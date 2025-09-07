# 🎟️ Events Scene App

A full-stack web application that allows staff users to create and manage events, and regular users to sign up and sync them to Google Calendar. The platform integrates the Ticketmaster API to fetch live events.

---

## 🔗 Live Demo
👉 Check out the live app: https://dz-events-platform.netlify.app/ 

 Note: The backend may take up to 50 seconds to wake up on first use due to Render's free-tier cold start behavior.

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
Email: user@example.com
Password: esempio123 

Use the following test credentials to log in as a staff user:
Email: staff@example.com
Password: esempio123


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
```

Create a .env file inside the backend/ folder with the following contents:

```bash
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5174
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server:

```bash
npm run dev
```

### 3. Set Up the Frontend

In a new terminal window:

```bash
cd client
npm install
```

Create a .env file inside the client/ folder with the following content:

```bash
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
```
Start the frontend app:

```bash
npm run dev
```

## 🚀 Deployment

Frontend: Hosted on Netlify

- Deployed from client/ folder

- Connected to GitHub branch: main

- Publish directory: client/dist

- Build command: node index.js

Backend: Hosted on Render

- Web Service started with npm start

- Environment variables added via the Render dashboard


## 🧪 Environment Variables

Make sure to create a `.env` file in both the `client/` and `server/` directories with the following variables:

### Server (.env)
TICKETMASTER_API_KEY=

MONGO_URI=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

GOOGLE_REDIRECT_URI=

SESSION_SECRET=

JWT_SECRET=

PORT=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=


### Client (.env)
VITE_API_BASE_URL=


> ⚠️ Do **not** commit `.env` files to version control. Add `.env` to your `.gitignore` file.


## ‼️ Known Limitations
The Add to Calendar feature works on desktop but may not work reliably on mobile browsers due to platform restrictions. Mobile users can still browse and sign up for events but might need to add events to their calendar manually.
