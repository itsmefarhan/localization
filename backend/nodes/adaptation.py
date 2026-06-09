from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from state import AgentState

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2, streaming=True)

async def adapt_culture(state: AgentState):
    prompt = ChatPromptTemplate.from_template(
        "You are an expert native copywriter located in {target_culture}.\n"
        "Literal Translation Draft: '{literal_translation}'\n"
        "Identified Friction Points:\n{cultural_notes}\n"
        "Live Market Context: {search_context}\n\n"
        "Rewrite this copy into flawless, engaging marketing text for {target_culture}.\n"
        "CRITICAL CURRENCY RULE: Look at the original price in the draft. Do NOT simply change the currency label "
        "while keeping the same number (e.g., $1,200 USD should NEVER become 1,200 Pesos). Either multiply/convert the value "
        "accurately using exchange rates found in the Live Market Context, or explicitly specify that the price is in USD "
        "so the local consumer isn't misled (e.g., '$1.200 USD' or '1.200 dólares estadounidenses').\n\n"
        "Adapt regional formatting, timezones, and structural slang naturally. "
        "Preserve the core selling intent. Return ONLY the final localized text."
    )
    chain = prompt | llm
    response = await chain.ainvoke({
        "target_culture": state["target_culture"],
        "literal_translation": state["literal_translation"],
        "cultural_notes": state["cultural_notes"],
        "search_context": state["search_context"]
    })
    return {"final_output": response.content.strip()}