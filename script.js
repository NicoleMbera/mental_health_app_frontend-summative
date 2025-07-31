let psychologists = [];
let selectedTimeSlot = null;
let currentDoctor = null;

const BACKEND_URL = "https://mental-health-app-backend-summative.onrender.com";

window.onload = async function () {
  const res = await fetch(`${BACKEND_URL}/doctors`);
  psychologists = await res.json();
  displayPsychologists(psychologists);

  document.getElementById("searchInput").addEventListener("input", function () {
    const term = this.value.toLowerCase();
    const filtered = psychologists.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.specialty.toLowerCase().includes(term)
    );
    displayPsychologists(filtered);
  });

  await loadMentalHealthBooks();
  await findNearbyClinics();
};

function displayPsychologists(list) {
  const container = document.getElementById("psychologistList");
  container.innerHTML = "";

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p><strong>Specialty:</strong> ${p.specialty}</p>
      <p><strong>Location:</strong> ${p.location}</p>
      <p>${p.bio}</p>
      <button onclick="startChat('${p.name}')">Start Chat</button>
    `;
    container.appendChild(card);
  });
}

function startChat(name) {
  currentDoctor = name;
  document.getElementById("chatWith").innerText = name;
  document.getElementById("chatBox").innerHTML = "";
  document.getElementById("chatInput").value = "";
  document.getElementById("userName").value = "";
  document.getElementById("userContact").value = "";
  document.getElementById("chatSection").classList.remove("hidden");

  document.getElementById("scheduleSection").classList.add("hidden");
  document.getElementById("sessionConfirmation").classList.add("hidden");
  document.getElementById("scheduleBtn").disabled = true;
  document.getElementById("scheduleBtn").textContent = "📅 Schedule Video Session";
  selectedTimeSlot = null;
}

async function sendMessage() {
  const msg = document.getElementById("chatInput").value.trim();
  const doctorName = currentDoctor;
  const userName = document.getElementById("userName").value.trim();
  const userContact = document.getElementById("userContact").value.trim();
  const chatBox = document.getElementById("chatBox");

  if (!msg || !userName || !userContact) {
    alert("Please fill in all fields before sending a message.");
    return;
  }

  const msgDiv = document.createElement("div");
  msgDiv.innerText = `${userName} (You): ${msg}`;
  chatBox.appendChild(msgDiv);
  document.getElementById("chatInput").value = "";

  try {
    const res = await fetch(`${BACKEND_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorName, userName, userContact, message: msg })
    });

    if (!res.ok) {
      alert("Failed to send message.");
      return;
    }

    const data = await res.json();
    const reply = document.createElement("div");
    reply.innerText = `Psychologist: Hey ${userName}, ${data.reply}`;
    chatBox.appendChild(reply);

    document.getElementById("scheduleSection").classList.remove("hidden");
    generateTimeSlots();
  } catch (err) {
    console.error("❌ Message Error:", err);
    alert("An error occurred while sending your message.");
  }
}

function generateTimeSlots() {
  const timeSlots = document.getElementById("timeSlots");
  const now = new Date();
  const slots = [];

  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(now.getDate() + day);

    const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const times = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];

    times.forEach(time => {
      const slotDate = new Date(date);
      const [timeStr, period] = time.split(' ');
      const [hours, minutes] = timeStr.split(':');
      let hour24 = parseInt(hours);
      if (period === 'PM' && hour24 !== 12) hour24 += 12;
      if (period === 'AM' && hour24 === 12) hour24 = 0;

      slotDate.setHours(hour24, parseInt(minutes), 0, 0);
      if (slotDate > now) {
        slots.push({ display: `${dayName} at ${time}`, value: slotDate.toISOString() });
      }
    });
  }

  timeSlots.innerHTML = '';
  slots.slice(0, 8).forEach(slot => {
    const slotDiv = document.createElement('div');
    slotDiv.className = 'time-slot';
    slotDiv.textContent = slot.display;
    slotDiv.dataset.value = slot.value;
    slotDiv.onclick = () => selectTimeSlot(slotDiv, slot.value);
    timeSlots.appendChild(slotDiv);
  });
}

function selectTimeSlot(element, value) {
  document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
  element.classList.add('selected');
  selectedTimeSlot = value;
  document.getElementById('scheduleBtn').disabled = false;
}

async function scheduleSession() {
  const sessionType = document.getElementById("sessionType").value;
  const userName = document.getElementById("userName").value.trim();
  const userContact = document.getElementById("userContact").value.trim();
  const selectedSlot = document.querySelector(".time-slot.selected");
  if (!selectedSlot) {
    alert("Please select a time slot.");
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/schedule-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorName: document.getElementById("chatWith").textContent,
        userName,
        userContact,
        sessionType,
        sessionTime: selectedSlot.dataset.value
      })
    });

    const result = await response.json();
    if (response.ok) {
      const confirmation = document.getElementById("sessionConfirmation");
      confirmation.classList.remove("hidden");
      confirmation.innerHTML = `
        ✅ Your session is scheduled! <br />
        📅 <strong>${sessionType}</strong> at <strong>${selectedSlot.textContent}</strong>
      `;

      const domain = "meet.jit.si";
      const options = {
        roomName: result.sessionId,
        width: "100%",
        height: 500,
        parentNode: document.getElementById("jitsiContainer"),
        userInfo: { displayName: userName }
      };
      new JitsiMeetExternalAPI(domain, options);
    } else {
      alert(result.message || "Failed to schedule session.");
    }
  } catch (error) {
    console.error("❌ Schedule Error:", error);
    alert("An error occurred while scheduling the session.");
  }
}

// ✅ Fetch mental health books 
async function loadMentalHealthBooks() {
  try {
    const res = await fetch("https://openlibrary.org/subjects/mental_health.json?limit=10");
    const data = await res.json();
    const books = data.works;

    const bookList = document.getElementById("bookList");
    bookList.innerHTML = ""; 
    books.forEach(book => {
      const div = document.createElement("div");
      div.className = "book-card";

      const coverImg = book.cover_id
        ? `<img src="https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg" alt="${book.title} cover" style="max-width:100px; height:auto;">`
        : `<div style="width:100px;height:150px;background:#ccc;display:flex;align-items:center;justify-content:center;">No Image</div>`;

      div.innerHTML = `
        ${coverImg}
        <strong>${book.title}</strong><br/>
        <em>by ${book.authors.map(a => a.name).join(", ")}</em><br/><br/>
      `;
      bookList.appendChild(div);
    });
  } catch (error) {
    console.error("📚 Error fetching books:", error);
  }
}

// ✅ Show nearby clinics on a Leaflet map
async function findNearbyClinics() {
  try {
    const res = await fetch(`${BACKEND_URL}/clinics`);
    const clinics = await res.json();

    if (!clinics || clinics.length === 0) {
      console.warn("No clinics returned.");
      return;
    }

    const firstClinic = clinics[0];
    const mapCenter = firstClinic ? [firstClinic.lat, firstClinic.lon] : [-1.95, 30.1];

    const map = L.map("map").setView(mapCenter, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    clinics.forEach(clinic => {
      L.marker([clinic.lat, clinic.lon])
        .addTo(map)
        .bindPopup(`<b>${clinic.display_name}</b>`);
    });

  } catch (error) {
    console.error("🏥 Error fetching clinics:", error);
  }
}
