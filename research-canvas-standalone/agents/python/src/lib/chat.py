"""Chat Node"""

from typing import List, Literal, cast

from copilotkit.langgraph import copilotkit_customize_config
from langchain.tools import tool
from langchain_core.messages import AIMessage, SystemMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from langgraph.types import Command

from src.lib.download import get_resource
from src.lib.model import get_model
from src.lib.state import AgentState


@tool
def Search(queries: List[str]) -> str:
    """Search for resources to support the research."""
    return "ok"


@tool
def WriteReport(report: str) -> str:
    """Write the research report."""
    return "ok"


@tool
def WriteResearchQuestion(research_question: str) -> str:
    """Write the research question."""
    return "ok"


@tool
def DeleteResources(urls: str) -> str:
    """Delete the URLs from the resources."""
    return "ok"


async def chat_node(
    state: AgentState, config: RunnableConfig
) -> Command[Literal["search_node", "chat_node", "delete_node", "__end__"]]:
    """
    Chat Node
    """

    # Configure CopilotKit state emission
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[
            {
                "state_key": "report",
                "tool": "WriteReport",
                "tool_argument": "report",
            },
            {
                "state_key": "research_question",
                "tool": "WriteResearchQuestion",
                "tool_argument": "research_question",
            },
        ],
    )

    # Ensure defaults
    state["resources"] = state.get("resources", [])
    research_question = state.get("research_question", "")
    report = state.get("report", "")

    # Load resource contents
    resources = []
    print("LLM RESOURCES:", state["resources"])
    for resource in state["resources"]:
        content = resource.get("content")

        if not content:
            content = get_resource(resource["url"])

        if not content:
            continue

        resources.append({
            **resource,
            "content": content
        })

    # Build messages
    messages = [
        SystemMessage(
            content=f"""
You are a research assistant. You help the user with writing a research report.
Use the resources to answer the user's question. When you use information from a resource, cite it by including the resource URL and title.

Format citations like this: [Resource Title](URL)

Use the search tool if needed to find more resources.

If you write or update the report, prefer using the WriteReport tool.

This is the research question:
{research_question}

This is the research report:
{report}

Here are the resources that you have available:
{resources}
"""
        ),
        *state["messages"],
    ]

    model = get_model(state)
    model_name = model.__class__.__name__

    # ---- MODEL EXECUTION ----
    # Only use tool calling for models that support it
    if model_name == "ChatOpenAI":
        # OpenAI supports proper function calling
        response = await model.bind_tools(
            [
                Search,
                WriteReport,
                WriteResearchQuestion,
                DeleteResources,
            ],
            parallel_tool_calls=False,
        ).ainvoke(messages, config=config)
    else:
        # For other models like Groq, use simple text generation
        # and extract content from the response
        response = await model.ainvoke(messages, config=config)

    ai_message = cast(AIMessage, response)

    # ---- TOOL CALL SAFETY ----
    if ai_message.tool_calls:
        for call in ai_message.tool_calls:
            if not isinstance(call.get("args"), dict):
                ai_message.tool_calls = []
                break

    # ---- HANDLE TOOL CALLS (for OpenAI) ----
    if ai_message.tool_calls:
        tool_call = ai_message.tool_calls[0]

        if tool_call["name"] == "WriteReport":
            report = tool_call["args"].get("report", "")
            return Command(
                goto="chat_node",
                update={
                    "report": report,
                    "messages": [
                        ai_message,
                        ToolMessage(
                            tool_call_id=tool_call["id"],
                            content="Report written.",
                        ),
                    ],
                },
            )

        if tool_call["name"] == "WriteResearchQuestion":
            return Command(
                goto="chat_node",
                update={
                    "research_question": tool_call["args"].get(
                        "research_question", ""
                    ),
                    "messages": [
                        ai_message,
                        ToolMessage(
                            tool_call_id=tool_call["id"],
                            content="Research question written.",
                        ),
                    ],
                },
            )

    # ---- FOR GROQ AND OTHER MODELS: AUTO-POPULATE REPORT ----
    # If the model generated a substantial response without tool calls,
    # automatically update the report
    if ai_message.content and len(ai_message.content) > 50 and not report:
        return Command(
            goto="chat_node",
            update={
                "report": ai_message.content,
                "messages": [ai_message],
            },
        )

    # ---- ROUTING ----
    goto = "__end__"

    if ai_message.tool_calls:
        name = ai_message.tool_calls[0]["name"]
        if name == "Search":
            goto = "search_node"
        elif name == "DeleteResources":
            goto = "delete_node"

    return Command(goto=goto, update={"messages": [ai_message]})
