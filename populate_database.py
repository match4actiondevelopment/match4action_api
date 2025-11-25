#!/usr/bin/env python3
"""
Script to populate MongoDB database with meaningful sample data
Run this script to populate all collections with realistic data for development
"""

import os
from pymongo import MongoClient
from datetime import datetime, timedelta
import uuid
import bcrypt

def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def connect_to_mongodb():
    """Connect to MongoDB"""
    mongo_uri = os.getenv('MONGO_URI') or os.getenv('MONGO_LOCAL') or 'mongodb://localhost:27017/match4action'
    
    try:
        client = MongoClient(mongo_uri)
        client.admin.command('ping')
        print("Connected to MongoDB")
        return client
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

def populate_goals(db):
    """Populate goals collection with UN SDGs"""
    print("\n Populating Goals collection...")
    
    goals_data = [
        {
            "name": "No Poverty",
            "order": 1,

        },
        {
            "name": "Zero Hunger", 
            "order": 2,

        },
        {
            "name": "Good Health and Well-being",
            "order": 3,

        },
        {
            "name": "Quality Education",
            "order": 4,

        },
        {
            "name": "Gender Equality",
            "order": 5,

        }
    ]
    
    try:
        # Clear existing goals
        db.goals.delete_many({})
        
        # Insert new goals
        result = db.goals.insert_many(goals_data)
        print(f" Inserted {len(result.inserted_ids)} goals")
        
        return [str(goal_id) for goal_id in result.inserted_ids]
    except Exception as e:
        print(f" Error populating goals: {e}")
        return []

def populate_users(db):
    """Populate users collection with sample users"""
    print("\n Populating Users collection...")
    
    # Generate real bcrypt hashes for passwords
    password123 = hash_password("password123")
    password456 = hash_password("password456")
    password789 = hash_password("password789")
    password101 = hash_password("password101")
    admin_pass = hash_password("admin123")
    
    users_data = [
        {
            "name": "Sarah Johnson",
            "email": "sarah.johnson@example.com",
            "password": password123,
            "role": "volunteer",
            "provider": {
                "id": "local-001",
                "name": "credentials"
            },
            "termsAndConditions": True,
            "bio": "Passionate environmentalist looking to make a difference in my community.",
            "location": {
                "city": "San Francisco",
                "country": "USA"
            },

        },
        {
            "name": "Miguel Rodriguez",
            "email": "miguel.rodriguez@example.com", 
            "password": password456,
            "role": "volunteer",
            "provider": {
                "id": "local-002",
                "name": "credentials"
            },
            "termsAndConditions": True,
            "bio": "Software engineer who loves teaching coding to underprivileged youth.",
            "location": {
                "city": "Austin",
                "country": "USA"
            },

        },
        {
            "name": "Green Earth Foundation",
            "email": "contact@greenearth.org",
            "password": password789,
            "role": "organization",
            "provider": {
                "id": "local-003",
                "name": "credentials"
            },
            "termsAndConditions": True,
            "bio": "Non-profit organization dedicated to environmental conservation and sustainability.",
            "location": {
                "city": "Portland",
                "country": "USA"
            },

        },
        {
            "name": "Tech for Good Inc",
            "email": "hello@techforgood.org",
            "password": password101,
            "role": "organization",
            "provider": {
                "id": "local-004",
                "name": "credentials"
            },
            "termsAndConditions": True,
            "bio": "Technology company focused on creating solutions for social impact.",
            "location": {
                "city": "Seattle",
                "country": "USA"
            },

        },
        {
            "name": "Admin User",
            "email": "admin@match4action.com",
            "password": admin_pass,
            "role": "admin",
            "provider": {
                "id": "local-admin",
                "name": "credentials"
            },
            "termsAndConditions": True,
            "bio": "System administrator for the platform.",
            "location": {
                "city": "New York",
                "country": "USA"
            },

        }
    ]
    
    try:
        # Clear existing users
        db.users.delete_many({})
        
        # Insert new users
        result = db.users.insert_many(users_data)
        print(f" Inserted {len(result.inserted_ids)} users")
        
        # Print login credentials for testing
        print("\n Login Credentials for Testing:")
        print("=" * 50)
        print("Volunteers:")
        print("  - sarah.johnson@example.com / password123")
        print("  - miguel.rodriguez@example.com / password456")
        print("\nOrganizations:")
        print("  - contact@greenearth.org / password789")
        print("  - hello@techforgood.org / password101")
        print("\nAdmin:")
        print("  - admin@match4action.com / admin123")
        print("=" * 50)
        
        return [str(user_id) for user_id in result.inserted_ids]
    except Exception as e:
        print(f" Error populating users: {e}")
        return []

def populate_initiatives(db, user_ids, goal_ids):
    """Populate initiatives collection with sample initiatives"""
    print("\n Populating Initiatives collection...")
    
    # Get some user IDs for different roles
    volunteer_ids = user_ids[:2]  # First 2 are volunteers
    org_ids = user_ids[2:4]      # Next 2 are organizations
    
    initiatives_data = [
        {
            "initiativeName": "Community Garden Project",
            "description": "Help us create and maintain a community garden to provide fresh produce to local families in need.",
            "servicesNeeded": ["Gardening", "Landscaping", "Teaching", "Fundraising"],
            "whatMovesThisInitiative": ["Food Security", "Community Building", "Environmental Education"],
            "whichAreasAreCoveredByThisInitiative": ["Urban Agriculture", "Education", "Community Development"],
            "eventItemFrame": "Ongoing",
            "eventItemType": "Community Service",
            "startDate": datetime.now() + timedelta(days=7),
            "endDate": datetime.now() + timedelta(days=90),
            "startTime": datetime.now().replace(hour=9, minute=0, second=0),
            "endTime": datetime.now().replace(hour=17, minute=0, second=0),
            "postalCode": "94102",
            "website": "https://greenearth.org/garden",
            "location": {
                "country": "USA",
                "city": "San Francisco"
            },

            "userId": org_ids[0],  # Green Earth Foundation
            "goals": [goal_ids[1]],  # Zero Hunger
            "applicants": volunteer_ids,  # Both volunteers applied
            "postalCode": "94102"
        },
        {
            "initiativeName": "Coding Bootcamp for Youth",
            "description": "Teach programming fundamentals to underprivileged high school students. No coding experience required from volunteers - we'll provide training!",
            "servicesNeeded": ["Teaching", "Mentoring", "Curriculum Development", "Technical Support"],
            "whatMovesThisInitiative": ["Education Equality", "Digital Literacy", "Youth Empowerment"],
            "whichAreasAreCoveredByThisInitiative": ["Technology Education", "Youth Development", "Digital Inclusion"],
            "eventItemFrame": "Weekly",
            "eventItemType": "Education",
            "startDate": datetime.now() + timedelta(days=14),
            "endDate": datetime.now() + timedelta(days=120),
            "startTime": datetime.now().replace(hour=15, minute=0, second=0),
            "endTime": datetime.now().replace(hour=18, minute=0, second=0),
            "postalCode": "73301",
            "website": "https://techforgood.org/bootcamp",
            "location": {
                "country": "USA",
                "city": "Austin"
            },

            "userId": org_ids[1],  # Tech for Good Inc
            "goals": [goal_ids[3]],  # Quality Education
            "applicants": [volunteer_ids[1]],  # Miguel applied
            "postalCode": "73301"
        },
        {
            "initiativeName": "Beach Cleanup Initiative",
            "description": "Join us for a monthly beach cleanup to help protect marine life and keep our beaches beautiful for everyone to enjoy.",
            "servicesNeeded": ["Beach Cleanup", "Environmental Education", "Data Collection", "Community Outreach"],
            "whatMovesThisInitiative": ["Environmental Protection", "Marine Conservation", "Community Engagement"],
            "whichAreasAreCoveredByThisInitiative": ["Environmental Conservation", "Marine Biology", "Community Service"],
            "eventItemFrame": "Monthly",
            "eventItemType": "Environmental",
            "startDate": datetime.now() + timedelta(days=30),
            "endDate": datetime.now() + timedelta(days=30),
            "startTime": datetime.now().replace(hour=8, minute=0, second=0),
            "endTime": datetime.now().replace(hour=12, minute=0, second=0),
            "postalCode": "94102",
            "website": "https://greenearth.org/beach-cleanup",
            "location": {
                "country": "USA",
                "city": "San Francisco"
            },

            "userId": org_ids[0],  # Green Earth Foundation
            "goals": [goal_ids[4]],  # Gender Equality (inclusive event)
            "applicants": [volunteer_ids[0]],  # Sarah applied
            "postalCode": "94102"
        },
        {
            "initiativeName": "Health Workshop Series",
            "description": "Organize and facilitate health and wellness workshops for seniors in the community, covering nutrition, exercise, and mental health.",
            "servicesNeeded": ["Health Education", "Workshop Facilitation", "Senior Care", "Nutrition Knowledge"],
            "whatMovesThisInitiative": ["Senior Health", "Community Wellness", "Preventive Healthcare"],
            "whichAreasAreCoveredByThisInitiative": ["Healthcare", "Senior Services", "Community Health"],
            "eventItemFrame": "Weekly",
            "eventItemType": "Healthcare",
            "startDate": datetime.now() + timedelta(days=21),
            "endDate": datetime.now() + timedelta(days=84),
            "startTime": datetime.now().replace(hour=10, minute=0, second=0),
            "endTime": datetime.now().replace(hour=11, minute=30, second=0),
            "postalCode": "97201",
            "website": "https://techforgood.org/health-workshops",
            "location": {
                "country": "USA",
                "city": "Portland"
            },

            "userId": org_ids[1],  # Tech for Good Inc
            "goals": [goal_ids[2]],  # Good Health and Well-being
            "applicants": [],
            "postalCode": "97201"
        },
        {
            "initiativeName": "Digital Literacy for Seniors",
            "description": "Help seniors learn to use smartphones, tablets, and computers to stay connected with family and access online services.",
            "servicesNeeded": ["Technology Teaching", "Patience", "Communication", "Basic Tech Support"],
            "whatMovesThisInitiative": ["Digital Inclusion", "Senior Empowerment", "Technology Access"],
            "whichAreasAreCoveredByThisInitiative": ["Digital Education", "Senior Services", "Technology"],
            "eventItemFrame": "Ongoing",
            "eventItemType": "Education",
            "startDate": datetime.now() + timedelta(days=10),
            "endDate": datetime.now() + timedelta(days=180),
            "startTime": datetime.now().replace(hour=14, minute=0, second=0),
            "endTime": datetime.now().replace(hour=16, minute=0, second=0),
            "postalCode": "73301",
            "website": "https://techforgood.org/digital-literacy",
            "location": {
                "country": "USA",
                "city": "Austin"
            },

            "userId": org_ids[1],  # Tech for Good Inc
            "goals": [goal_ids[3], goal_ids[4]],  # Quality Education + Gender Equality
            "applicants": [volunteer_ids[0], volunteer_ids[1]],  # Both volunteers applied
            "postalCode": "73301"
        }
    ]

    # Auto-generate additional initiatives to reach a desired total
    try:
        target_total = int(os.getenv('INITIATIVE_COUNT', '60'))  # default to 60 (50+)
        additional_needed = max(0, target_total - len(initiatives_data))
        sample_cities = [
            ("USA", "San Francisco"),
            ("USA", "Austin"),
            ("USA", "Portland"),
            ("USA", "Seattle"),
            ("USA", "New York"),
        ]
        sample_services = [
            ["Teaching", "Mentoring"],
            ["Fundraising", "Outreach"],
            ["Event Planning", "Logistics"],
            ["Design", "Content"],
            ["Data Collection", "Research"],
        ]

        for i in range(additional_needed):
            country, city = sample_cities[i % len(sample_cities)]
            services = sample_services[i % len(sample_services)]
            org_id = org_ids[i % len(org_ids)]
            goal_id = goal_ids[i % len(goal_ids)] if goal_ids else None
            start_offset = 5 + (i % 20)
            end_offset = start_offset + 30

            initiatives_data.append({
                "initiativeName": f"Community Initiative #{i + 1}",
                "description": "Autogenerated initiative for testing end-to-end flows.",
                "servicesNeeded": services,
                "whatMovesThisInitiative": ["Community", "Impact"],
                "whichAreasAreCoveredByThisInitiative": ["Education", "Community"],
                "eventItemFrame": "Ongoing",
                "eventItemType": "Community",
                "startDate": datetime.now() + timedelta(days=start_offset),
                "endDate": datetime.now() + timedelta(days=end_offset),
                "startTime": datetime.now().replace(hour=9, minute=0, second=0),
                "endTime": datetime.now().replace(hour=17, minute=0, second=0),
                "postalCode": "00000",
                "website": "https://example.org/initiative",
                "location": {"country": country, "city": city},
                "userId": org_id,
                "goals": [goal_id] if goal_id else [],
                "applicants": volunteer_ids,
                "postalCode": "00000",
            })
    except Exception as e:
        print(f" Error generating additional initiatives: {e}")
    
    try:
        # Clear existing initiatives
        db.initiatives.delete_many({})
        
        # Insert new initiatives
        result = db.initiatives.insert_many(initiatives_data)
        print(f" Inserted {len(result.inserted_ids)} initiatives")
        
        return [str(initiative_id) for initiative_id in result.inserted_ids]
    except Exception as e:
        print(f" Error populating initiatives: {e}")
        return []

def populate_user_tokens(db, user_ids):
    """Populate usertokens collection with sample refresh tokens"""
    print("\n Populating UserTokens collection...")
    
    tokens_data = []
    for user_id in user_ids:
        tokens_data.append({
            "userId": user_id,
            "token": f"refresh_token_{uuid.uuid4().hex[:16]}",
            "createdAt": datetime.now() - timedelta(days=1)  # Token created yesterday
        })
    
    try:
        # Clear existing tokens
        db.usertokens.delete_many({})
        
        # Insert new tokens
        result = db.usertokens.insert_many(tokens_data)
        print(f" Inserted {len(result.inserted_ids)} user tokens")
        
    except Exception as e:
        print(f" Error populating user tokens: {e}")

def show_database_summary(db):
    """Show summary of all collections"""
    print("\n Database Summary:")
    print("=" * 50)
    
    collections = ['users', 'initiatives', 'goals', 'usertokens']
    
    for collection in collections:
        count = db[collection].count_documents({})
        print(f" {collection.capitalize()}: {count} documents")
    
    # Show some sample data
    print("\n Sample Users:")
    users = list(db.users.find({}, {'name': 1, 'role': 1, 'email': 1}))
    for user in users[:3]:
        print(f"  - {user['name']} ({user['role']}) - {user['email']}")
    
    print("\n Sample Initiatives:")
    initiatives = list(db.initiatives.find({}, {'initiativeName': 1, 'userId': 1}))
    for initiative in initiatives[:3]:
        print(f"  - {initiative['initiativeName']}")
    
    print("\n Sample Goals:")
    goals = list(db.goals.find({}, {'name': 1, 'order': 1}))
    for goal in goals[:3]:
        print(f"  - {goal['order']}. {goal['name']}")

def main():
    """Main function to populate the database"""
    print("MongoDB Database Populator")
    print("=" * 50)
    print("This script will populate your database with sample data for development.")
    
    # Check if pymongo is installed
    try:
        import pymongo
    except ImportError:
        print(" pymongo is not installed")
        print("Please install it with: pip install pymongo")
        return
    
    # Connect to MongoDB
    client = connect_to_mongodb()
    if not client:
        return
    
    try:
        db = client.get_database()
        
        # Populate collections in order (respecting dependencies)
        goal_ids = populate_goals(db)
        user_ids = populate_users(db)
        initiative_ids = populate_initiatives(db, user_ids, goal_ids)
        populate_user_tokens(db, user_ids)
        
        # Show summary
        show_database_summary(db)
        
        print("\n Database population completed successfully!")
        print("\n You can now:")
        print("  - Test user registration and login")
        print("  - Browse initiatives")
        print("  - Test role-based access control")
        print("  - Develop and debug with realistic data")
        
    except Exception as e:
        print(f" Error during database population: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
