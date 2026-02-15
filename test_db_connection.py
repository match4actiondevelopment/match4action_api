from pymongo import MongoClient
import sys

uri = "mongodb+srv://match4action:DRa9HOr0t61HPlXM@cluster0.qlwst0x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

print(f"Attempting to connect to: {uri.split('@')[1]}")

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("SUCCESS: Connected to MongoDB!")
    print("Databases found:", client.list_database_names())
except Exception as e:
    print(f"FAILURE: Could not connect to MongoDB: {e}")
    sys.exit(1)
