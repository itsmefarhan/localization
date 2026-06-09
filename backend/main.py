import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from graph import localized_agent

app = FastAPI(title="Autonomous Content Localization Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LocalizationPayload(BaseModel):
    source_text: str
    target_language: str
    target_culture: str
    thread_id: str

@app.post("/api/localize/stream")
async def stream_localization(payload: LocalizationPayload):
    config = {"configurable": {"thread_id": payload.thread_id}}
    
    async def event_generator():
        inputs = {
            "source_text": payload.source_text,
            "target_language": payload.target_language,
            "target_culture": payload.target_culture,
            "literal_translation": "",
            "cultural_notes": "",
            "search_context": "",
            "final_output": ""
        }
        
        # Use astream with updates mode to capture nodes finishing in real-time
        async for chunk in localized_agent.astream(inputs, config, stream_mode="updates"):
            for node_name, data in chunk.items():
                payload_data = {
                    "node": node_name,
                    "data": data
                }
                # Format perfectly as Server-Sent Event (SSE) text stream
                yield f"data: {json.dumps(payload_data)}\n\n"
                
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)