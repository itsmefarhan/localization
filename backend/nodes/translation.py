from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from state import AgentState
from schemas import TranslationOutput

llm_fast = ChatGroq(model="llama-3.1-8b-instant", temperature=0.1, streaming=True)

async def translate_text(state: AgentState):
    prompt = ChatPromptTemplate.from_template(
        "You are a linguistic analyzer. Translate the following text into {target_language} "
        "and analyze potential friction points for an audience in {target_culture}.\n\n"
        "You must respond strictly with a valid JSON object matching this schema:\n"
        "1. \"literal_translation\": string (The raw translation without prefixes)\n"
        "2. \"cultural_notes\": array of strings (Each entry is a specific point of friction regarding idioms, timezones, or formatting errors)\n\n"
        "Text to translate:\n{source_text}"
    )
    
    structured_llm = llm_fast.with_structured_output(TranslationOutput, method="json_mode")
    chain = prompt | structured_llm
    
    response = await chain.ainvoke({
        "target_language": state["target_language"],
        "target_culture": state["target_culture"],
        "source_text": state["source_text"]
    })
    
    clean_translation = response.literal_translation.strip()
    if clean_translation.startswith('";'):
        clean_translation = clean_translation[2:]
    if clean_translation.startswith('"') or clean_translation.startswith("'"):
        clean_translation = clean_translation[1:]
    if clean_translation.endswith('"') or clean_translation.endswith("'"):
        clean_translation = clean_translation[:-1]
        
    clean_translation = clean_translation.strip()
    formatted_notes = "\n".join(response.cultural_notes)
    
    return {
        "literal_translation": clean_translation, 
        "cultural_notes": formatted_notes
    }