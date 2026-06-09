import requests
import json
import time

payload = {
  "id": "e63f9116-02b1-4c60-878c-35e23e98ea5e",
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "kind": "message",
      "messageId": "1234",
      "parts": [
        {
          "kind": "text",
          "text": "hello"
        }
      ],
      "role": "user"
    }
  }
}

t0 = time.time()
r = requests.post("http://localhost:10100", json=payload)
t1 = time.time()

print(f"Time: {t1-t0:.2f}s")
print(json.dumps(r.json(), indent=2))
