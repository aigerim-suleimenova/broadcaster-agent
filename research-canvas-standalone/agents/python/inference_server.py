"""
FastAPI server for LLM inference - used by the Pipeline for broadcast research stages.
This server uses the same model infrastructure as the agents.
"""

import json
import os
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import HumanMessage

# Import model getter
from src.lib.model import get_model
from src.lib.state import AgentState

app = FastAPI(title="Research Canvas Inference Server")


class InferenceRequest(BaseModel):
    prompt: str
    model: str = "openai"  # Default to OpenAI
    temperature: float = 0.7
    response_json_schema: Optional[dict] = None


class InferenceResponse(BaseModel):
    result: str
    parsed: Optional[dict] = None


def get_llm_model(model_name: str) -> BaseChatModel:
    """Get LLM model by name - delegates to agent's model infrastructure."""
    state: AgentState = {"model": model_name}
    return get_model(state)


@app.post("/invoke-llm", response_model=InferenceResponse)
async def invoke_llm(request: InferenceRequest):
    """
    Invoke LLM with a prompt and return the response.
    Supports optional JSON schema parsing.
    """
    try:
        # Get model
        llm = get_llm_model(request.model)

        # Create message
        message = HumanMessage(content=request.prompt)

        # Invoke model
        response = await llm.ainvoke([message])

        # Extract content
        result = response.content if hasattr(response, "content") else str(response)

        # Try to parse as JSON if schema provided
        parsed = None
        if request.response_json_schema:
            try:
                parsed = json.loads(result)
            except json.JSONDecodeError:
                # If parsing fails, try to extract JSON from the response
                import re

                json_match = re.search(r"\{.*\}", result, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group())

        return InferenceResponse(result=result, parsed=parsed)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/models")
async def list_models():
    """List available models."""
    return {
        "models": ["openai", "anthropic", "google_genai", "groq"],
        "default": "openai",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("INFERENCE_SERVER_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
