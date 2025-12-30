from dotenv import load_dotenv
import os

load_dotenv("backend/.env")
key = os.environ.get("OPENAI_API_KEY")

print(f"Key loaded: '{key}'")
print(f"Key repr: {repr(key)}")

if key:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=key)
        client.models.list()
        print("OpenAI Client Connection: SUCCESS")
    except Exception as e:
        print(f"OpenAI Client Connection: FAILED - {e}")
else:
    print("Key is None")
