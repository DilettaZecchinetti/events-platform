# 🎟️ Events Platform App

A full-stack application that allows staff users to create and manage events, and regular users to sign up and sync them to Google Calendar. The platform uses Clerk for authentication and integrates the Ticketmaster API to fetch live events.

---

## 🚀 Features

- Staff dashboard for creating custom events  
- Google Calendar integration 
- Manual sign-up/login 
- MongoDB for storing users and event data  
- Backend API built with Express.js  
- Frontend built with React and Vite  

---

## 🧪 Test Account Access

Use the following test credentials to log in as a user: 
Email: tester@esempio.com
Password: ciao123 

Use the following test credentials to log in as a staff user:
Email: stafftester@esempio.com
Password: ciao123


This account has staff privileges and can access the staff dashboard to create events.

---

## 🛠️ Running the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/DilettaZecchinetti/events-platform
cd events-platform
cd server
npm install
```

### 2. Set Up the Backend

```bash
cd server
npm install

Create a .env file inside the backend/ folder with the following contents:
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5174

Start the backend server:
npm run dev
```

### 3. Set Up the Frontend

In a new terminal window:
```bash
cd client
npm install
```
```
