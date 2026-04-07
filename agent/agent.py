"""
Second Brain Agent - Pydantic AI agent with AG-UI protocol support.

This agent uses StateDeps for bidirectional state sync with the frontend
via the AG-UI protocol, enabling seamless CopilotKit integration.
"""

import os
import sys
from typing import Any
from uuid import uuid4
from datetime import datetime
from textwrap import dedent

# Ensure the agent package directory is on sys.path so sibling modules
# (content_analyzer, llm_orchestrator, etc.) can be imported directly.
_AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
if _AGENT_DIR not in sys.path:
    sys.path.insert(0, _AGENT_DIR)

from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from pydantic_ai.settings import ModelSettings
from pydantic_ai.ag_ui import StateDeps
from pydantic_ai.models.openai import OpenAIChatModel
from ag_ui.core import EventType, StateSnapshotEvent

# Load environment variables
from dotenv import load_dotenv
_agent_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_agent_dir, ".env"))
load_dotenv()  # Also try project root .env


class DashboardState(BaseModel):
    """
    Shared state between frontend and agent.

    This state is synchronized bidirectionally via AG-UI protocol.
    The frontend can read and update this state, and the agent
    can emit StateSnapshot events to update it.
    """
    # Document info
    markdown_content: str = ""
    document_title: str = ""
    document_type: str = ""  # tutorial, research, article, etc.

    # Analysis results
    content_analysis: dict[str, Any] = Field(default_factory=dict)
    layout_type: str = ""  # instructional, data, news, etc.

    # Generated components (A2UI format)
    components: list[dict[str, Any]] = Field(default_factory=list)

    # Processing status
    status: str = "idle"  # idle, analyzing, generating, complete, error
    progress: int = 0  # 0-100
    current_step: str = ""

    # Activity log for frontend rendering
    activity_log: list[dict[str, Any]] = Field(default_factory=list)

    # Error tracking
    error_message: str | None = None


def create_openrouter_model() -> OpenAIChatModel:
    """Create OpenRouter model instance."""
    # Support OPENAI_API_KEY as a compatibility alias.
    api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        # Allow server startup (e.g. /health and /info) even without a key.
        # Actual generation calls will fail downstream until a key is configured.
        print("[!] WARNING: OPENROUTER_API_KEY/OPENAI_API_KEY is not set")

    model_name = os.getenv("OPENROUTER_MODEL", "anthropic/claude-sonnet-4")
    return OpenAIChatModel(model_name, provider='openrouter')


# Create the agent with StateDeps for AG-UI integration
agent = Agent(
    model=create_openrouter_model(),
    model_settings=ModelSettings(max_tokens=8000),
    deps_type=StateDeps[DashboardState],
    name="dashboard_agent",
    system_prompt=dedent("""
    You are a specialized AI assistant that transforms broadcaster and streaming
    analytics documents into interactive dashboard components.

    ## YOUR RULES
    1. DO NOT automatically start the generation process when you see markdown content.
    2. Wait for the user to explicitly ask to "generate", "build", "create", or "update" the dashboard.
    3. You have access to the current document via your state dependency (`markdown_content`).

    ## YOUR WORKFLOW (Only when asked):
    1. Call confirm_analysis_options() FIRST to let the user choose which broadcaster
       dimensions to focus on. Pass a `document_title` (if known) and an `options` array
       with the most relevant dimensions for the document. Use these defaults unless the
       content suggests otherwise:
         - { label: "Viewership Metrics", description: "Audience size, concurrent viewers, watch time, and retention trends", icon: "👥", selected: true }
         - { label: "Stream Quality", description: "Rebuffering ratio, startup time, bitrate stability, and error rates", icon: "📡", selected: true }
         - { label: "CDN Performance", description: "Cache hit ratio, latency by region, and delivery reliability", icon: "🌐", selected: true }
         - { label: "Revenue & Monetization", description: "Ad impressions, CPM, fill rate, and subscription MRR", icon: "💰", selected: true }
         - { label: "Engagement Analytics", description: "Session depth, completion rate, return viewer rate, and top content", icon: "🎯", selected: true }
         - { label: "Geographic Breakdown", description: "Viewership and quality metrics segmented by region", icon: "🗺️", selected: false }
       Wait for the user's response before proceeding.
    2. Call analyze_content() to classify the document structure, focusing only on
       the dimensions the user confirmed.
    3. Then call generate_components() to build the A2UI components.

    Always explain what you're doing. If the user hasn't asked to build yet,
    just offer to help them refine their data or answer questions about the content.
""").strip()
)


@agent.tool
def get_markdown_content(ctx: RunContext[StateDeps[DashboardState]]) -> str:
    """Get the current markdown content from state."""
    content = ctx.deps.state.markdown_content
    print(f"[TOOL] get_markdown_content: {len(content)} chars")
    return content if content else "No markdown content provided yet."


@agent.tool
async def analyze_content(ctx: RunContext[StateDeps[DashboardState]]) -> StateSnapshotEvent:
    """
    Analyze the markdown content to determine document type and extract key elements.
    Updates the shared state with analysis results.
    """
    from content_analyzer import parse_markdown
    from llm_orchestrator import analyze_content_with_llm

    state = ctx.deps.state
    markdown = state.markdown_content

    print(f"[TOOL] analyze_content: analyzing {len(markdown)} chars")

    # Update state to show we're analyzing
    state.status = "analyzing"
    state.progress = 20
    state.current_step = "Analyzing document structure..."
    state.activity_log.append({
        "id": str(uuid4()),
        "message": "Starting content analysis",
        "timestamp": datetime.now().isoformat(),
        "status": "in_progress"
    })

    # Parse markdown structure
    parsed = parse_markdown(markdown)

    # Get LLM analysis
    analysis = await analyze_content_with_llm(markdown)

    # Update state with results
    state.document_title = parsed.get("title", "Untitled")
    state.document_type = analysis.get("document_type", "article")
    state.content_analysis = {
        **parsed,
        **analysis
    }
    state.progress = 40
    state.current_step = f"Document classified as: {state.document_type}"
    state.activity_log.append({
        "id": str(uuid4()),
        "message": f"Analysis complete: {state.document_type}",
        "timestamp": datetime.now().isoformat(),
        "status": "completed"
    })

    print(f"[TOOL] analyze_content: document_type={state.document_type}")

    # Return StateSnapshotEvent to sync state with frontend
    return StateSnapshotEvent(
        type=EventType.STATE_SNAPSHOT,
        snapshot=state,
    )


@agent.tool
async def generate_components(ctx: RunContext[StateDeps[DashboardState]]) -> StateSnapshotEvent:
    """
    Generate A2UI dashboard components based on the analyzed content.
    Each component is added to state and synced with the frontend.
    """
    from llm_orchestrator import orchestrate_dashboard_with_llm

    state = ctx.deps.state

    print(f"[TOOL] generate_components: starting")

    # Update status
    state.status = "generating"
    state.current_step = "Generating dashboard components..."
    state.progress = 50
    state.components = []  # Clear existing

    # Generate components using the orchestrator
    component_count = 0
    async for component in orchestrate_dashboard_with_llm(state.markdown_content):
        component_count += 1

        # Convert component to dict
        component_dict = {
            "type": component.type,
            "id": component.id,
            "props": component.props,
        }
        if component.layout:
            component_dict["layout"] = component.layout
        if component.zone:
            component_dict["zone"] = component.zone

        state.components.append(component_dict)
        state.progress = min(50 + (component_count * 3), 95)
        state.current_step = f"Generated {component.type}"

        print(f"[TOOL] generate_components: added {component.type}")

    # Final status
    state.status = "complete"
    state.progress = 100
    state.current_step = "Dashboard complete!"
    state.activity_log.append({
        "id": str(uuid4()),
        "message": f"Generated {component_count} components",
        "timestamp": datetime.now().isoformat(),
        "status": "completed"
    })

    print(
        f"[TOOL] generate_components: complete with {component_count} components")

    # Return StateSnapshotEvent to sync final state with frontend
    return StateSnapshotEvent(
        type=EventType.STATE_SNAPSHOT,
        snapshot=state,
    )
