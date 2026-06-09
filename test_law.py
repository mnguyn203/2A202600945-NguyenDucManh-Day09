import asyncio
import sys
import os
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from law_agent.graph import create_graph

async def main():
    graph = create_graph()
    question = "If a company breaks a contract and avoids taxes, what are the legal and regulatory consequences?"
    
    try:
        result = await graph.ainvoke({
            "question": question,
            "context_id": "123",
            "trace_id": "123",
            "delegation_depth": 1,
            "law_analysis": "",
            "needs_tax": False,
            "needs_compliance": False,
            "tax_result": "",
            "compliance_result": "",
            "final_answer": "",
        }, config={"configurable": {"thread_id": "123"}})
        
        print("SUCCESS!")
        print(result.get("final_answer"))
    except Exception as e:
        print("ERROR:", repr(e))
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
