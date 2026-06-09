import asyncio
import httpx
import json

from a2a.types import AgentCard, Message, Part, Role, TextPart, MessageSendParams
from a2a.client import A2AClient
from uuid import uuid4
from a2a.types import SendMessageRequest, MessageSendParams as MSP

async def main():
    agent_card = AgentCard(
        name="Customer Agent",
        description="test",
        url="http://localhost:10100",
        version="1.0.0",
        capabilities={"streaming": False},
        default_input_modes=["text/plain"],
        default_output_modes=["text/plain"],
        skills=[]
    )
    http_client = httpx.AsyncClient()
    client = A2AClient(httpx_client=http_client, agent_card=agent_card)
    
    message = Message(
        role=Role.user,
        parts=[Part(root=TextPart(text="hello"))],
        message_id="1234"
    )
    request = SendMessageRequest(
        id="1234",
        params=MSP(message=message),
    )
    
    # We mock httpx_client.post to capture the request
    async def mock_post(url, **kwargs):
        print("URL:", url)
        print("JSON:", json.dumps(kwargs.get("json"), indent=2))
        class MockResp:
            def raise_for_status(self): pass
            def json(self): return {"result": {"parts": []}}
        return MockResp()
    
    http_client.post = mock_post
    await client.send_message(request)

if __name__ == "__main__":
    asyncio.run(main())
