const rememberUntil = Number(localStorage.getItem("adminRememberUntil"));
const sessionLogin = sessionStorage.getItem("isAdminLoggedIn");
const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));

let authenticated = false;

if (rememberUntil && Date.now() <= rememberUntil) authenticated = true;
else if (sessionLogin === "true") authenticated = true;

if (!authenticated || !currentAdmin) {
  alert("You are not logged in or your session has expired. Please log in again.");
  localStorage.removeItem("adminRememberUntil");
  localStorage.removeItem("currentAdmin");
  sessionStorage.removeItem("isAdminLoggedIn");
  window.location.href = "index.html";
}

// Sample data for demonstration - in production, this would come from your backend
// Status: 0 = available, 1 = class occupied, 2 = full, 3 = unavailable
// Now with 22 slots (7:30 AM to 6:00 PM in 30-minute increments)
const sampleScheduleData = {
  'A1706': [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  'V301': [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'V310': [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
};

// Get DOM elements
const roomSelect = document.getElementById('roomSelect');
const dateInput = document.getElementById('dateInput');
const scheduleBody = document.getElementById('scheduleBody');
const seatsAvailableEl = document.getElementById('seatsAvailable');
const seatsRepairEl = document.getElementById('seatsRepair');

// Set today's date as default
dateInput.valueAsDate = new Date();

// Status class mapping
const statusClasses = {
  0: 'status_available',
  1: 'status_class',
  2: 'status_full',
  3: 'status_unavailable'
};

// Function to generate schedule table for a single room
function generateScheduleTable(room) {
  scheduleBody.innerHTML = '';
  
  if (!room) {
    scheduleBody.innerHTML = '<tr><td colspan="23" class="empty_message">Please select a room to view availability</td></tr>';
    return;
  }

  const scheduleData = sampleScheduleData[room] || Array(22).fill(0); // Default to available if no data
  const row = document.createElement('tr');
  
  // First cell shows "AVAILABLE SLOTS" or similar label
  const labelCell = document.createElement('td');
  labelCell.textContent = 'SLOTS';
  labelCell.style.background = '#2f4f1f';
  labelCell.style.color = 'white';
  labelCell.style.fontWeight = 'bold';
  labelCell.style.fontSize = '13px';
  row.appendChild(labelCell);
  
  // Time slot cells (22 slots from 7:30 AM to 6:00 PM in 30-minute increments)
  for (let i = 0; i < 22; i++) {
    const cell = document.createElement('td');
    const status = scheduleData[i];
    cell.className = statusClasses[status];
    cell.dataset.room = room;
    
    // Calculate time slot (7:30 AM = 7.5, increments of 0.5)
    const hourDecimal = 7.5 + (i * 0.5);
    const hour = Math.floor(hourDecimal);
    const minutes = (hourDecimal % 1) === 0 ? '00' : '30';
    cell.dataset.time = `${hour}:${minutes}`;
    cell.dataset.status = status;
    
    // Add click event (for future reservation functionality)
    cell.addEventListener('click', function() {
      if (this.dataset.status === '0') { // Only clickable if available
        console.log(`Clicked: ${room} at ${this.dataset.time}`);
        // Add your reservation logic here
      }
    });
    
    row.appendChild(cell);
  }
  
  scheduleBody.appendChild(row);
}

// Function to update booking overview
function updateBookingOverview(room) {
  // For now, assuming 36 seats per room and 0 for repair
  // In production, this would be fetched from your backend
  if (room) {
    seatsAvailableEl.textContent = '36/36';
    seatsRepairEl.textContent = '0';
  } else {
    seatsAvailableEl.textContent = '0/0';
    seatsRepairEl.textContent = '0';
  }
}

// Event listener for room selection
roomSelect.addEventListener('change', function() {
  const selectedRoom = this.value;
  generateScheduleTable(selectedRoom);
  updateBookingOverview(selectedRoom);
});

// Event listener for date change
dateInput.addEventListener('change', function() {
  const selectedRoom = roomSelect.value;
  if (selectedRoom) {
    // In production, fetch new data for the selected date
    generateScheduleTable(selectedRoom);
    updateBookingOverview(selectedRoom);
  }
});

// Initialize with empty state
generateScheduleTable(null);