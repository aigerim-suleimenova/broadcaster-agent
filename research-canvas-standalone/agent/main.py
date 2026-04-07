"""
Second Brain Agent - AG-UI endpoint using Pydantic AI.

This creates an AG-UI compatible endpoint that CopilotKit can connect to
for bidirectional state synchronization and streaming agent responses.
"""

from starlette.middleware.cors import CORSMiddleware
from pydantic_ai.ag_ui import StateDeps
try:
    from .agent import agent, DashboardState
except ImportError:
    # Fallback for uvicorn --reload spawn workers which run this as a script
    import sys as _sys
    import os as _os
    _sys.path.insert(0, _os.path.dirname(
        _os.path.dirname(_os.path.abspath(__file__))))
    from agent.agent import agent, DashboardState
from starlette.requests import Request
from starlette.applications import Starlette
from starlette.responses import JSONResponse, StreamingResponse
from starlette.routing import Route
import os
import re
import json
from dotenv import load_dotenv

# Load environment variables - try agent/.env first, then project root .env
_agent_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_agent_dir, ".env"))
load_dotenv()  # Also try project root .env


# Configuration
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
PRIMARY_AGENT_ID = "dashboard_agent"
AGENT_ID_ALIASES = {PRIMARY_AGENT_ID, "default"}


def pascal_to_screaming_snake(name: str) -> str:
    """Convert PascalCase to SCREAMING_SNAKE_CASE."""
    # Insert underscore before uppercase letters (except first)
    result = re.sub(r'(?<!^)(?=[A-Z])', '_', name)
    return result.upper()


# Map of PascalCase to SCREAMING_SNAKE_CASE event types
EVENT_TYPE_MAP = {
    "RunStarted": "RUN_STARTED",
    "RunFinished": "RUN_FINISHED",
    "RunError": "RUN_ERROR",
    "StepStarted": "STEP_STARTED",
    "StepFinished": "STEP_FINISHED",
    "StateSnapshot": "STATE_SNAPSHOT",
    "StateDelta": "STATE_DELTA",
    "MessagesSnapshot": "MESSAGES_SNAPSHOT",
    "TextMessageStart": "TEXT_MESSAGE_START",
    "TextMessageContent": "TEXT_MESSAGE_CONTENT",
    "TextMessageEnd": "TEXT_MESSAGE_END",
    "TextMessageChunk": "TEXT_MESSAGE_CHUNK",
    "ToolCallStart": "TOOL_CALL_START",
    "ToolCallArgs": "TOOL_CALL_ARGS",
    "ToolCallEnd": "TOOL_CALL_END",
    "ToolCallChunk": "TOOL_CALL_CHUNK",
    "ToolCallResult": "TOOL_CALL_RESULT",
    "Raw": "RAW",
    "Custom": "CUSTOM",
}


def transform_event_type(event_data: str) -> str:
    """Transform event type in SSE data from PascalCase to SCREAMING_SNAKE_CASE."""
    try:
        data = json.loads(event_data)
        if "type" in data:
            original_type = data["type"]
            # Check if we have a mapping, otherwise convert dynamically
            if original_type in EVENT_TYPE_MAP:
                data["type"] = EVENT_TYPE_MAP[original_type]
            elif not original_type.isupper():
                # Dynamically convert if not already SCREAMING_SNAKE_CASE
                data["type"] = pascal_to_screaming_snake(original_type)
        return json.dumps(data)
    except json.JSONDecodeError:
        return event_data


async def transform_sse_stream(original_response):
    """Transform SSE stream to use SCREAMING_SNAKE_CASE event types."""
    try:
        async for chunk in original_response.body_iterator:
            try:
                if isinstance(chunk, bytes):
                    chunk = chunk.decode('utf-8')

                # Process each line in the chunk
                lines = chunk.split('\n')
                transformed_lines = []

                for line in lines:
                    if line.startswith('event: '):
                        # Transform event name
                        event_name = line[7:]
                        if event_name in EVENT_TYPE_MAP:
                            transformed_lines.append(
                                f'event: {EVENT_TYPE_MAP[event_name]}')
                        elif not event_name.isupper():
                            transformed_lines.append(
                                f'event: {pascal_to_screaming_snake(event_name)}')
                        else:
                            transformed_lines.append(line)
                    elif line.startswith('data: '):
                        # Transform data JSON
                        data = line[6:]
                        transformed_data = transform_event_type(data)
                        transformed_lines.append(f'data: {transformed_data}')
                    else:
                        transformed_lines.append(line)

                yield '\n'.join(transformed_lines)
            except Exception as chunk_error:
                print(
                    f"[SSE ERROR] Error processing chunk: {chunk_error}", flush=True)
                import traceback
                traceback.print_exc()
                raise
    except Exception as stream_error:
        print(f"[SSE ERROR] Stream error: {stream_error}", flush=True)
        import traceback
        traceback.print_exc()
        raise


# Create the base AG-UI app using Pydantic AI's built-in integration
_base_ag_ui_app = agent.to_ag_ui(
    deps=StateDeps(DashboardState()),
)


def build_runtime_info() -> dict:
    """Return CopilotKit-compatible runtime metadata."""
    return {
        "version": "1.0.0",
        "mode": "rest",
        "a2uiEnabled": True,
        "agents": {
            PRIMARY_AGENT_ID: {
                "description": "Generate interactive dashboards from markdown research documents",
            },
            "default": {
                "description": "Generate interactive dashboards from markdown research documents",
            }
        },
    }


async def _call_base_ag_ui_endpoint(request: Request, body: bytes):
    """Forward a raw AG-UI request body to Pydantic AI's generated endpoint."""
    from starlette.requests import Request as StarletteRequest

    scope = dict(request.scope)

    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    new_request = StarletteRequest(scope, receive)

    for route in _base_ag_ui_app.routes:
        if hasattr(route, 'methods') and 'POST' in route.methods:
            return await route.endpoint(new_request)

    return JSONResponse({"error": "AG-UI endpoint not found"}, status_code=500)

# Create our wrapper app
app = Starlette()

# AG-UI POST endpoint with event type transformation


async def ag_ui_endpoint(request: Request):
    """
    AG-UI endpoint that wraps Pydantic AI's implementation
    and transforms event types to SCREAMING_SNAKE_CASE format.
    """
    try:
        body = await request.body()
        print(f"[AG-UI] Received request: {len(body)} bytes", flush=True)

        # CopilotKit single-endpoint transport sends an envelope:
        # {"method": "info" | "agent/run" | "agent/connect" | "agent/stop", ...}
        # In these cases, unwrap and route accordingly.
        try:
            payload = json.loads(body.decode("utf-8")) if body else None
        except json.JSONDecodeError:
            payload = None

        if isinstance(payload, dict) and "method" in payload:
            method = payload.get("method")

            if method == "info":
                return JSONResponse(build_runtime_info())

            if method in {"agent/run", "agent/connect"}:
                params = payload.get("params") or {}
                agent_id = params.get("agentId")
                if agent_id and agent_id not in AGENT_ID_ALIASES:
                    return JSONResponse(
                        {"error": f"Unknown agentId: {agent_id}"},
                        status_code=404,
                    )

                ag_ui_payload = payload.get("body") or {}
                forwarded_body = json.dumps(ag_ui_payload).encode("utf-8")
                original_response = await _call_base_ag_ui_endpoint(request, forwarded_body)
            elif method == "agent/stop":
                # AG-UI endpoint does not maintain server-side run state to stop.
                return JSONResponse({"ok": True})
            else:
                return JSONResponse(
                    {"error": f"Unsupported method: {method}"},
                    status_code=400,
                )
        else:
            # Raw AG-UI request body (no CopilotKit method envelope)
            original_response = await _call_base_ag_ui_endpoint(request, body)

        if getattr(original_response, "status_code", 200) == 422:
            details = b""
            try:
                if hasattr(original_response, "body"):
                    details = original_response.body
            except Exception:
                details = b""

            if details:
                print(
                    f"[AG-UI 422] {details.decode('utf-8', errors='replace')}", flush=True)

        # If it's a streaming response, wrap it with our transformer
        if isinstance(original_response, StreamingResponse):
            return StreamingResponse(
                transform_sse_stream(original_response),
                media_type="text/event-stream",
                headers=dict(original_response.headers),
            )

        return original_response
    except Exception as e:
        print(f"[AG-UI ERROR] {e}", flush=True)
        import traceback
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)


# Info endpoint for debugging / CopilotKit compatibility
async def info_endpoint(request: Request):
    """Return agent information."""
    return JSONResponse(build_runtime_info())


# Health endpoint
async def health_endpoint(request: Request):
    """Health check endpoint."""
    return JSONResponse({
        "status": "healthy",
        "agent_ready": bool(os.getenv("OPENROUTER_API_KEY")),
    })


# GET handler for root to help with debugging/discovery
async def root_get_endpoint(request: Request):
    """Return AG-UI endpoint info for GET requests."""
    return JSONResponse({
        "protocol": "ag-ui",
        "version": "1.0.0",
        "endpoints": {
            "run_agent": "POST /",
            "info": "GET /info",
            "health": "GET /health",
        },
        "description": "Second Brain Dashboard Agent - POST to / to run the agent",
    })


# Combined handler for root path
async def root_handler(request: Request):
    """Handle both GET and POST for root path."""
    if request.method == "POST":
        return await ag_ui_endpoint(request)
    return await root_get_endpoint(request)


# Add routes to the app
app.routes.append(Route("/", root_handler, methods=["GET", "POST"]))
app.routes.append(Route("/info", info_endpoint, methods=["GET"]))
app.routes.append(Route("/health", health_endpoint, methods=["GET"]))


# Add CORS middleware for development

# ...existing code...
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
# ...existing code...


@app.on_event("startup")
async def startup():
    """Startup event handler."""
    print(f"[*] Second Brain Agent (AG-UI) starting on port {BACKEND_PORT}")
    print(f"[*] AG-UI endpoint: POST http://localhost:{BACKEND_PORT}/")
    print(f"[*] Info endpoint: GET http://localhost:{BACKEND_PORT}/info")
    print(f"[*] Health endpoint: GET http://localhost:{BACKEND_PORT}/health")

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("[!] WARNING: OPENROUTER_API_KEY not set")
    else:
        print("[+] OpenRouter API key configured")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("agent.main:app", host="0.0.0.0",
                port=BACKEND_PORT, reload=False)
