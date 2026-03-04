const rememberUntil = Number(localStorage.getItem("adminRememberUntil"));
const sessionLogin = sessionStorage.getItem("isAdminLoggedIn");
const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));

let authenticated = false;

if (rememberUntil && Date.now() <= rememberUntil) authenticated = true;
else if (sessionLogin === "true") authenticated = true;

if (!authenticated || !currentAdmin) {
  alert("Authentication failed. Please log in as an administrator.");
  localStorage.removeItem("adminRememberUntil");
  localStorage.removeItem("currentAdmin");
  sessionStorage.removeItem("isAdminLoggedIn");
  window.location.href = "index.html";
}

const ROOM_SEATS = {
  'G302A': 20,
  'G302B': 20,
  'G304B': 20
};

const TIME_SLOTS = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

function getReservations() {
  const raw = localStorage.getItem("reservations");
  return raw ? JSON.parse(raw) : [];
}

function getOccupiedSeatsCount(date, room, timeIn) {
  const reservations = getReservations();
  
  const occupied = reservations.filter(res => 
    res.date === date && 
    res.room === room && 
    res.timeIn === timeIn
  );
  
  return occupied.length;
}

function calculateSlotStatus(date, room, timeIn) {
  const totalSeats = ROOM_SEATS[room] || 20;
  const occupiedCount = getOccupiedSeatsCount(date, room, timeIn);
  
  if (occupiedCount === 0) {
    return 0;
  } else if (occupiedCount < totalSeats) {
    return 0;
  } else if (occupiedCount >= totalSeats) {
    return 2;
  }
  
  return 0;
}

const roomSelect = document.getElementById('roomSelect');
const dateInput = document.getElementById('dateInput');
const scheduleBody = document.getElementById('scheduleBody');
const seatsAvailableEl = document.getElementById('seatsAvailable');
const seatsRepairEl = document.getElementById('seatsRepair');

dateInput.valueAsDate = new Date();

const statusClasses = {
  0: 'status_available',
  1: 'status_class',
  2: 'status_full',
  3: 'status_unavailable'
};

let selectedCell = null;

function generateScheduleTable(room, date) {
  scheduleBody.innerHTML = '';
  
  if (!room || !date) {
    scheduleBody.innerHTML = '<tr><td colspan="23" class="empty_message">Please select a room and date to view availability</td></tr>';
    updateBookingOverview(null, null, null);
    return;
  }

  const row = document.createElement('tr');
  
  const labelCell = document.createElement('td');
  labelCell.textContent = 'SLOTS';
  labelCell.style.background = '#2f4f1f';
  labelCell.style.color = 'white';
  labelCell.style.fontWeight = 'bold';
  labelCell.style.fontSize = '13px';
  row.appendChild(labelCell);
  
  TIME_SLOTS.forEach((timeSlot, index) => {
    const cell = document.createElement('td');
    const status = calculateSlotStatus(date, room, timeSlot);
    
    cell.className = statusClasses[status];
    cell.dataset.room = room;
    cell.dataset.time = timeSlot;
    cell.dataset.status = status;
    
    cell.addEventListener('click', function() {
      if (selectedCell) {
        selectedCell.classList.remove('selected_slot');
      }
      
      this.classList.add('selected_slot');
      selectedCell = this;
      
      updateBookingOverview(room, date, timeSlot);
    });
    
    row.appendChild(cell);
  });
  
  scheduleBody.appendChild(row);
  
  selectedCell = null;
}

function updateBookingOverview(room, date, timeSlot) {
  if (!room || !date || !timeSlot) {
    if (room) {
      const totalSeats = ROOM_SEATS[room] || 20;
      seatsAvailableEl.textContent = `${totalSeats}/${totalSeats}`;
      seatsRepairEl.textContent = '0';
    } else {
      seatsAvailableEl.textContent = '0/0';
      seatsRepairEl.textContent = '0';
    }
    return;
  }
  
  const totalSeats = ROOM_SEATS[room] || 20;
  const occupiedCount = getOccupiedSeatsCount(date, room, timeSlot);
  const availableCount = totalSeats - occupiedCount;
  
  seatsAvailableEl.textContent = `${availableCount}/${totalSeats}`;
  seatsRepairEl.textContent = '0';
}

roomSelect.addEventListener('change', function() {
  const selectedRoom = this.value;
  const selectedDate = dateInput.value;
  generateScheduleTable(selectedRoom, selectedDate);
});

dateInput.addEventListener('change', function() {
  const selectedRoom = roomSelect.value;
  const selectedDate = this.value;
  generateScheduleTable(selectedRoom, selectedDate);
});

generateScheduleTable(null, null);
