from pymongo import MongoClient
import sys

uri = "mongodb+srv://match4action:DRa9HOr0t61HPlXM@cluster0.6xfixxg.mongodb.net/?retryWrites=true&w=majority"

print(f"Attempting to connect to: {uri.split('@')[1]}")

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("SUCCESS: Connected to MongoDB!")
except Exception as e:
    print(f"FAILURE: Could not connect to MongoDB: {e}")
    sys.exit(1)
