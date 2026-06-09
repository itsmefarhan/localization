import os
import httpx
from state import AgentState

async def verify_cultural_facts(state: AgentState):
    culture = state["target_culture"]
    notes = state["cultural_notes"]
    tavily_api_key = os.getenv("TAVILY_API_KEY")
    
    search_query = f"current cultural conversion factors trends slang {culture} regarding {notes[:60]}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": tavily_api_key,
                    "query": search_query,
                    "max_results": 1
                },
                timeout=15.0
            )
            
            if response.status_code == 200:
                raw_data = response.json()
                results = raw_data.get("results", [])
                context = "\n".join([r.get("content", "") for r in results]) if results else "No direct matches found."
            else:
                context = f"Tavily API returned status code {response.status_code}"
                
        except Exception as e:
            context = f"Failed to fetch live context via REST API: {str(e)}"
        
    return {"search_context": context}