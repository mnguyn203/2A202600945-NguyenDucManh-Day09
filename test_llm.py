import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from common.llm import get_llm
from langchain_core.messages import HumanMessage

async def main():
    llm = get_llm()
    try:
        res = await llm.ainvoke([HumanMessage(content="Hello")])
        print("LLM Response:", res.content)
    except Exception as e:
        print("LLM Error:", repr(e))

if __name__ == "__main__":
    asyncio.run(main())
