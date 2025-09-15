#!/usr/bin/env python3
"""
Simple script to list all entries from all MongoDB collections
"""

from pymongo import MongoClient
import os
from datetime import datetime

def format_date(date_obj):
    """Format date object for display"""
    if isinstance(date_obj, datetime):
        return date_obj.strftime("%Y-%m-%d %H:%M")
    return str(date_obj)

def display_users(db):
    """Display users collection"""
    users = db.users
    total = users.count_documents({})
    print(f"\n USERS Collection ({total} documents):")
    print("=" * 60)
    
    if total == 0:
        print("No users found!")
        return
    
    for user in users.find({}):
        print(f"ID: {user['_id']}")
        print(f"Name: {user.get('name', 'N/A')}")
        print(f"Email: {user.get('email', 'N/A')}")
        print(f"Role: {user.get('role', 'N/A')}")
        
        if 'provider' in user:
            provider = user['provider']
            print(f"Provider: {provider.get('name', 'N/A')}")
        
        if 'location' in user and user['location']:
            loc = user['location']
            print(f"Location: {loc.get('city', 'N/A')}, {loc.get('country', 'N/A')}")
        
        print("-" * 60)

def display_initiatives(db):
    """Display initiatives collection"""
    initiatives = db.initiatives
    total = initiatives.count_documents({})
    print(f"\n INITIATIVES Collection ({total} documents):")
    print("=" * 60)
    
    if total == 0:
        print("No initiatives found!")
        return
    
    for initiative in initiatives.find({}):
        print(f"ID: {initiative['_id']}")
        print(f"Name: {initiative.get('initiativeName', 'N/A')}")
        print(f"Description: {initiative.get('description', 'N/A')[:80]}...")
        print(f"Type: {initiative.get('eventItemType', 'N/A')}")
        print(f"Frame: {initiative.get('eventItemFrame', 'N/A')}")
        
        if 'startDate' in initiative:
            print(f"Start: {format_date(initiative['startDate'])}")
        
        if 'location' in initiative and initiative['location']:
            loc = initiative['location']
            print(f"Location: {loc.get('city', 'N/A')}, {loc.get('country', 'N/A')}")
        
        if 'servicesNeeded' in initiative:
            services = initiative['servicesNeeded']
            print(f"Services: {', '.join(services[:3])}{'...' if len(services) > 3 else ''}")
        
        print("-" * 60)

def display_goals(db):
    """Display goals collection"""
    goals = db.goals
    total = goals.count_documents({})
    print(f"\n GOALS Collection ({total} documents):")
    print("=" * 60)
    
    if total == 0:
        print("No goals found!")
        return
    
    for goal in goals.find({}):
        print(f"ID: {goal['_id']}")
        print(f"Order: {goal.get('order', 'N/A')}")
        print(f"Name: {goal.get('name', 'N/A')}")
        print(f"Image: {goal.get('image', 'N/A')}")
        print("-" * 60)

def display_user_tokens(db):
    """Display usertokens collection"""
    tokens = db.usertokens
    total = tokens.count_documents({})
    print(f"\n USERTOKENS Collection ({total} documents):")
    print("=" * 60)
    
    if total == 0:
        print("No user tokens found!")
        return
    
    for token in tokens.find({}):
        print(f"ID: {token['_id']}")
        print(f"User ID: {token.get('userId', 'N/A')}")
        print(f"Token: {token.get('token', 'N/A')[:20]}...")
        print(f"Created: {format_date(token.get('createdAt', 'N/A'))}")
        print("-" * 60)

def main():
    # Get MongoDB URI from environment or use default
    mongo_uri = os.getenv('MONGO_URI') or os.getenv('MONGO_LOCAL') or 'mongodb://localhost:27017/match4action'
    
    print(f"Connecting to MongoDB: {mongo_uri}")
    
    try:
        # Connect to MongoDB
        client = MongoClient(mongo_uri)
        
        # Test connection
        client.admin.command('ping')
        print(" Connected to MongoDB")
        
        # Get database
        db = client.get_database()
        
        # Display all collections
        display_users(db)
        display_initiatives(db)
        display_goals(db)
        display_user_tokens(db)
        
        # Show summary
        print(f"\n DATABASE SUMMARY:")
        print("=" * 60)
        collections = ['users', 'initiatives', 'goals', 'usertokens']
        for collection in collections:
            count = db[collection].count_documents({})
            print(f" {collection.capitalize()}: {count} documents")
        
        client.close()
        
    except Exception as e:
        print(f" Error: {e}")
        print("\n Make sure MongoDB is running and the connection string is correct.")

if __name__ == "__main__":
    main() 