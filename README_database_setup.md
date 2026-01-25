# Database Setup Guide

This guide will help you populate your MongoDB database with meaningful sample data for development and testing.

## Quick Start

### 1. Install Dependencies
```bash
pip3 install -r requirements.txt
```

### 2. Run the Population Script
```bash
python3 populate_database.py
```

## What Gets Created

### **Users Collection (5 users)**
- **2 Volunteers**: Sarah Johnson, Miguel Rodriguez
- **2 Organizations**: Green Earth Foundation, Tech for Good Inc
- **1 Admin**: Admin User

### **Initiatives Collection (5 initiatives)**

## Prerequisites
- MongoDB running locally on port 27017
- Python 3.7+ installed
- Backend server running (optional, for full testing)

## Environment Variables
The script will automatically use these environment variables if set:
- `MONGO_URI` - Your MongoDB connection string
- `MONGO_LOCAL` - Local MongoDB URI
- `MONGO_PROD` - Production MongoDB URI

**Default**: `mongodb://localhost:27017/match4action`

## Testing with Sample Data

After running the script, you can:

### **Test User Authentication**
- Login with any of the sample users using the credentials
- Test different user roles (volunteer, organization, admin)

## 🔑 Sample User Credentials

**These are real bcrypt-hashed passwords that will work for login testing:**

### **Volunteers**
- `sarah.johnson@example.com` / `password123` - Environmental volunteer
- `miguel.rodriguez@example.com` / `password456` - Tech volunteer

### **Organizations**
- `contact@greenearth.org` / `password789` - Environmental non-profit
- `hello@techforgood.org` / `password101` - Tech for social impact

### **Admin**
- `admin@match4action.com` / `admin123` - System administrator

## Resetting the Database

To start fresh, simply run the script again:
```bash
python3 populate_database.py
```

The script automatically clears existing data before inserting new sample data.


## Troubleshooting

### **Connection Issues**
- Ensure MongoDB is running: `brew services list | grep mongodb`
- Check connection string in environment variables

### **Permission Issues**
- Ensure you have write access to the database
- Check if MongoDB requires authentication

### **Import Errors**
- Install dependencies: `pip3 install -r requirements.txt`
- Check Python version: `python3 --version`

### **Login Issues**
- Make sure you're using the exact credentials shown above
- Verify the backend is running and MongoDB is accessible
- Check backend logs for any authentication errors



