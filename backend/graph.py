from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver
from state import AgentState
from nodes.translation import translate_text
from nodes.verification import verify_cultural_facts
from nodes.adaptation import adapt_culture

# Build Workflow Graph
workflow = StateGraph(AgentState)

# Wire up our modular nodes
workflow.add_node("translator", translate_text)
workflow.add_node("verifier", verify_cultural_facts)
workflow.add_node("adapter", adapt_culture)

workflow.add_edge(START, "translator")
workflow.add_edge("translator", "verifier")
workflow.add_edge("verifier", "adapter")
workflow.add_edge("adapter", END)

memory = MemorySaver()
localized_agent = workflow.compile(checkpointer=memory)