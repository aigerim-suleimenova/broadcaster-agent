"""
This is the state definition for the AI.
It defines the state of the agent and the state of the conversation.
"""

from typing import List, TypedDict, Optional
from langgraph.graph import MessagesState


class Resource(TypedDict):
    """
    Represents a resource. Give it a good title and a short description.
    """
    url: str
    title: str
    description: str


class Log(TypedDict):
    """
    Represents a log of an action performed by the agent.
    """
    message: str
    done: bool


class CoreMetric(TypedDict):
    """Core performance metric"""
    label: str
    value: int


class RegionalBreakdown(TypedDict):
    """Regional distribution data"""
    region: str
    value: int


class RiskAssessment(TypedDict):
    """Risk assessment details"""
    level: str  # "low", "medium", "high"
    factors: List[str]


class BroadcasterMetrics(TypedDict):
    """Complete broadcaster metrics for display"""
    broadcasterName: str
    domain: str
    networkSnapshot: TypedDict('NetworkSnapshot', {
        'audienceSize': str,
        'revenue': str,
        'platformCount': int,
        'coverage': str
    })
    audienceProfile: TypedDict('AudienceProfile', {
        'primaryDemographic': str,
        'secondaryDemographic': str,
        'geographicReach': List[str],
        'engagementRate': str
    })
    strategicContext: TypedDict('StrategicContext', {
        'sspPartners': List[str],
        'adServers': List[str],
        'technology': List[str]
    })
    coreMetrics: List[CoreMetric]
    regionalBreakdown: List[RegionalBreakdown]
    riskAssessment: RiskAssessment


class AgentState(MessagesState):
    """
    This is the state of the agent.
    It is a subclass of the MessagesState class from langgraph.
    """
    model: str
    research_question: str
    report: str
    resources: List[Resource]
    logs: List[Log]
    broadcaster_metrics: Optional[dict] = None
