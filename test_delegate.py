import asyncio
import os
import sys

# Ensure common is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from common.a2a_client import delegate
from common.registry_client import discover

async def main():
    endpoint = await discover("legal_question")
    print(f"Law Agent endpoint: {endpoint}")
    
    question = "công ty vi phạm hợp đồng lao động thì sẽ bị ảnh hưởng những vấn đề pháp lý nào"
    print(f"Question: {question}")
    
    answer = await delegate(
        endpoint=endpoint,
        question=question,
        context_id="test-context",
        trace_id="test-trace",
        depth=0
    )
    
    print(f"\n--- ANSWER ---\n{answer}\n--------------")

if __name__ == "__main__":
    asyncio.run(main())
