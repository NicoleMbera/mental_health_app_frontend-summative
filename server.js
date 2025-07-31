require('dotenv').config(); // Load env variables ASAP

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ Mocked doctor data
const doctors = [
  {
    id: 1,
    name: "Dr. Aline Umutoni",
    specialty: "Depression & Anxiety",
    location: "Kigali",
    bio: "Helping youth cope with mental challenges in fast-paced environments."
  },
  {
    id: 2,
    name: "Dr. Jean Bosco",
    specialty: "Family Therapy",
    location: "Huye",
    bio: "Experienced in rebuilding family relationships and trust."
  },
  {
    id: 3,
    name: "Dr. Keza Uwase",
    specialty: "Trauma & PTSD",
    location: "Rubavu",
    bio: "Specializes in trauma recovery for survivors."
  }
];

// ✅ GET /doctors
app.get('/doctors', (req, res) => {
  res.json(doctors);
});

// ✅ POST /messages
app.post('/messages', (req, res) => {
  const { doctorName, userName, userContact, message } = req.body;

  if (!doctorName || !message || !userName || !userContact) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  console.log(`📩 Message from ${userName} (${userContact}) to ${doctorName}: ${message}`);

  // Simulated response
  res.status(200).json({ reply: "Thanks for reaching out. A psychologist will respond shortly." });
});

// ✅ POST /schedule-session using Jitsi Meet
app.post('/schedule-session', async (req, res) => {
  try {
    const { doctorName, userName, userContact, sessionTime, sessionType } = req.body;

    // Generate unique Jitsi room name
    const roomName = `mindconnect_${Date.now()}`;

    // (Optional) Save session info + roomName in your DB here

    // Build the meeting URL using Jitsi
    const meetingUrl = `https://meet.jit.si/${roomName}`;

    console.log('✅ Session scheduled:', { doctorName, userName, sessionTime, sessionType, meetingUrl });

    res.status(200).json({
      success: true,
      meetingUrl,
      sessionId: roomName,
      message: 'Session scheduled successfully'
    });
  } catch (error) {
    console.error('❌ Error scheduling session:', error);
    res.status(500).json({ success: false, message: 'Could not schedule session' });
  }
});



app.get('/clinics', async (req, res) => {
  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: " clinics",
        format: "json",
        addressdetails: 1,
        limit: 20,
        countrycodes: "rw"
      },
      headers: {
        'User-Agent': 'YouMatterApp/1.0 (n.umurerwa@alustudent.com)'
      }
    });

    console.log("🔁 Clinic data:", response.data); // Log the response

    res.json(response.data);
  } catch (error) {
    console.error("❌ Failed to fetch clinics:", error.message);
    res.status(500).json({ error: "Failed to fetch clinics" });
  }
});



// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
