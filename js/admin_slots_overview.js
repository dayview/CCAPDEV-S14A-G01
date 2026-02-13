// Admin Slots Overview JavaScript
// Authentication temporarily disabled for troubleshooting

// Room seat counts (20 seats per room)
const ROOM_SEATS = {
  'G302A': 20,
  'G302B': 20,
  'G304B': 20
};

// Time slots (7:30 AM to 6:00 PM in 30-minute increments = 22 slots)
const TIME_SLOTS = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

// Get reservations from localStorage
function getReservations() {
  const raw = localStorage.getItem("reservations");
  return raw ? JSON.parse(raw) : [];
}

// Get occupied seats count for a specific date, room, and time
function getOccupiedSeatsCount(date, room, timeIn) {
  const reservations = getReservations();
  
  const occupied = reservations.filter(res => 
    res.date === date && 
    res.room === room && 
    res.timeIn === timeIn
  );
  
  return occupied.length;
}

// Calculate status for a time slot
// Returns: 0 = available, 1 = class occupied (placeholder), 2 = full, 3 = unavailable (placeholder)
function calculateSlotStatus(date, room, timeIn) {
  const totalSeats = ROOM_SEATS[room] || 20;
  const occupiedCount = getOccupiedSeatsCount(date, room, timeIn);
  
  if (occupiedCount === 0) {
    return 0; // Available (green)
  } else if (occupiedCount < totalSeats) {
    return 0; // Still available (some seats left) - green
  } else if (occupiedCount >= totalSeats) {
    return 2; // Full (red)
  }
  
  return 0; // Default to available
}

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

// Currently selected cell for highlighting
let selectedCell = null;

// Function to generate schedule table for a single room
function generateScheduleTable(room, date) {
  scheduleBody.innerHTML = '';
  
  if (!room || !date) {
    scheduleBody.innerHTML = '<tr><td colspan="23" class="empty_message">Please select a room and date to view availability</td></tr>';
    updateBookingOverview(null, null, null);
    return;
  }

  const row = document.createElement('tr');
  
  // First cell shows "SLOTS" label
  const labelCell = document.createElement('td');
  labelCell.textContent = 'SLOTS';
  labelCell.style.background = '#2f4f1f';
  labelCell.style.color = 'white';
  labelCell.style.fontWeight = 'bold';
  labelCell.style.fontSize = '13px';
  row.appendChild(labelCell);
  
  // Time slot cells (22 slots from 7:30 AM to 6:00 PM)
  TIME_SLOTS.forEach((timeSlot, index) => {
    const cell = document.createElement('td');
    const status = calculateSlotStatus(date, room, timeSlot);
    
    cell.className = statusClasses[status];
    cell.dataset.room = room;
    cell.dataset.time = timeSlot;
    cell.dataset.status = status;
    
    // Add click event to update booking overview
    cell.addEventListener('click', function() {
      // Remove previous selection highlight
      if (selectedCell) {
        selectedCell.classList.remove('selected_slot');
      }
      
      // Highlight current selection
      this.classList.add('selected_slot');
      selectedCell = this;
      
      // Update booking overview for this specific time slot
      updateBookingOverview(room, date, timeSlot);
      
      console.log(`Selected: ${room} on ${date} at ${timeSlot}`);
    });
    
    row.appendChild(cell);
  });
  
  scheduleBody.appendChild(row);
  
  // Clear selection when regenerating table
  selectedCell = null;
}

// Function to update booking overview
function updateBookingOverview(room, date, timeSlot) {
  if (!room || !date || !timeSlot) {
    // No specific time slot selected - show overall room capacity
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
  
  // Calculate availability for the specific time slot
  const totalSeats = ROOM_SEATS[room] || 20;
  const occupiedCount = getOccupiedSeatsCount(date, room, timeSlot);
  const availableCount = totalSeats - occupiedCount;
  
  seatsAvailableEl.textContent = `${availableCount}/${totalSeats}`;
  seatsRepairEl.textContent = '0'; // No repair seats for now
}

// Event listener for room selection
roomSelect.addEventListener('change', function() {
  const selectedRoom = this.value;
  const selectedDate = dateInput.value;
  generateScheduleTable(selectedRoom, selectedDate);
});

// Event listener for date change
dateInput.addEventListener('change', function() {
  const selectedRoom = roomSelect.value;
  const selectedDate = this.value;
  generateScheduleTable(selectedRoom, selectedDate);
});

// Initialize with empty state
generateScheduleTable(null, null);
