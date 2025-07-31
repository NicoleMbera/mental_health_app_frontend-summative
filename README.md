YouMatter — Mental Health Support App

YouMatter is a mental health companion web application that connects users to psychologists, allows them to chat, schedule video therapy sessions using Jitsi Meet, find nearby mental health clinics, and get book recommendations on mental wellness. This project was built with Node.js, Express, HTML/CSS/JS, and integrates multiple external APIs to deliver a meaningful and user-friendly experience.

🚀 Features

🔍 Search Psychologists by name or specialty

💬 Live Messaging simulation with mental health professionals

📅 Schedule Video Sessions via Jitsi Meet

📚 Mental Health Book Recommendations from OpenLibrary API

🗺️ Nearby Clinics Locator via OpenStreetMap Nominatim API

⚙️ How It Works
1. Backend (Express Server)
   
Serves endpoints for:

GET /doctors → Returns mock psychologist data

POST /messages → Simulates messaging a doctor

POST /schedule-session → Schedules a session with a unique Jitsi Meet room

GET /clinics → Fetches clinics in Rwanda using OpenStreetMap's Nominatim API

All API requests from the frontend are served at http://localhost:5000.

2. Frontend (HTML/CSS/JavaScript)
3. 
Dynamically loads psychologists and allows real-time search

Displays a messaging interface with session scheduling upon sending a message

Allows selection of session type and time slot

Embeds Jitsi Meet for the scheduled session

Loads books from OpenLibrary API and displays them

Uses Leaflet.js to visualize clinic locations on an interactive map

🌐 External APIs Used

API	Purpose	Endpoint

OpenLibrary API	Fetch mental health book data	https://openlibrary.org/subjects/mental_health.json?limit=10

OpenStreetMap Nominatim	Search for nearby clinics in Rwanda	https://nominatim.openstreetmap.org/search?q=clinics&countrycodes=rw&format=json

Jitsi Meet API	Schedule secure, private video consultations	Embedded via https://meet.jit.si/external_api.js

🛠️ Setup Instructions (Local Implementation)

🔧 Prerequisites
Node.js and npm installed

Git (optional)

📦 Installation
Clone the repository

git clone https://github.com/NicoleMbera/mental_health_app_frontend-summative.git

cd  mental_health_app_frontend-summative

Install dependencies
npm install

Run the server
node server.js

The backend server will run at http://localhost:5000.

Open the frontend

Simply open index.html in your browser (no build step needed).

Ensure your browser allows http://localhost:5000 requests (CORS is enabled in the backend).

📂 Project Structure

mental_health_app_frontend-summative/

├── server.js           # Express backend server

├── .env                # Environment config (if needed)

├── index.html          # Main web interface

├── style.css           # Styles

└── script.js           # Frontend logic

Future Improvements

Add user authentication

Persist scheduled sessions in a database

Enable real-time chat via WebSocket

Add location detection for more precise clinic suggestions



Author
Nicole Mbera Umurerwa
