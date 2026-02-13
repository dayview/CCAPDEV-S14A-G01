// Room seat counts (20 seats: A1-A5, B1-B5, C1-C5, D1-D5)
const ROOM_SEATS = {
  'G302A': 20,
  'G302B': 20,
  'G304B': 20
};

// Seat layout (5 columns x 4 rows)
const lab_layout = [
  "A1", "A2", "A3", "A4", "A5",
  "B1", "B2", "B3", "B4", "B5",
  "C1", "C2", "C3", "C4", "C5",
  "D1", "D2", "D3", "D4", "D5"
];

// Track current mode: 'reserve' or 'remove'
let currentMode = 'reserve';

// Selected seats tracker
let selectedSeats = [];

// Get reservations from localStorage
function getReservations() {
  const raw = localStorage.getItem("reservations");
  return raw ? JSON.parse(raw) : [];
}

// Save reservations to localStorage
function saveReservations(reservations) {
  localStorage.setItem("reservations", JSON.stringify(reservations));
}

// Validate Student ID exists in system
function validateStudentId(studentId) {
  const users = JSON.parse(localStorage.getItem("userAccounts")) || [];
  return users.find(user => user.idNumber === studentId);
}

// Get occupied seats for a specific date, room, and time
function getOccupiedSeats(date, room, timeIn) {
  const reservations = getReservations();
  
  return reservations.filter(res => 
    res.date === date && 
    res.room === room && 
    res.timeIn === timeIn
  ).map(res => res.seat);
}

// Calculate seats available
function calculateAvailableSeats(date, room, timeIn) {
  const totalSeats = ROOM_SEATS[room] || 20;
  const occupied = getOccupiedSeats(date, room, timeIn);
  return totalSeats - occupied.length;
}

// Update booking overview
function updateBookingOverview(date, room, timeIn) {
  const seatsAvailableEl = document.getElementById('seatsAvailable');
  const seatsRepairEl = document.getElementById('seatsRepair');
  
  if (!date || !room || !timeIn) {
    if (room) {
      const totalSeats = ROOM_SEATS[room] || 20;
      seatsAvailableEl.textContent = `${totalSeats}/${totalSeats}`;
    } else {
      seatsAvailableEl.textContent = '0/0';
    }
    seatsRepairEl.textContent = '0';
    return;
  }
  
  const totalSeats = ROOM_SEATS[room] || 20;
  const available = calculateAvailableSeats(date, room, timeIn);
  
  seatsAvailableEl.textContent = `${available}/${totalSeats}`;
  seatsRepairEl.textContent = '0';
}

// Render seats in the 5-column grid
function renderSeats(room, date, timeIn) {
  const seatMap = document.getElementById('seat_map');
  seatMap.innerHTML = '';
  selectedSeats = [];
  
  if (!room) return;
  
  const occupiedSeats = getOccupiedSeats(date, room, timeIn);
  
  lab_layout.forEach(seatId => {
    const btn = document.createElement('button');
    btn.textContent = seatId;
    btn.classList.add('seat');
    btn.dataset.seat = seatId;
    
    const isOccupied = occupiedSeats.includes(seatId);
    
    if (isOccupied) {
      btn.classList.add('occupied');
    } else {
      btn.classList.add('available');
    }
    
    // Add click handler
    btn.addEventListener('click', function() {
      handleSeatClick(this, isOccupied);
    });
    
    seatMap.appendChild(btn);
  });
}

// Handle seat click
function handleSeatClick(seatEl, isOccupied) {
  const seatId = seatEl.dataset.seat;
  
  console.log('Seat clicked:', seatId, 'Mode:', currentMode, 'Is Occupied:', isOccupied);
  
  // In RESERVE mode: can only select available seats
  if (currentMode === 'reserve') {
    if (isOccupied) {
      alert('This seat is already reserved for this time slot.');
      return;
    }
  }
  
  // In REMOVE mode: can only select occupied seats
  if (currentMode === 'remove') {
    if (!isOccupied) {
      alert('This seat is not occupied. Please select an occupied seat to remove.');
      return;
    }
  }
  
  // Toggle selection
  if (seatEl.classList.contains('selected')) {
    // Deselect
    seatEl.classList.remove('selected');
    if (currentMode === 'reserve') {
      seatEl.classList.add('available');
    } else {
      seatEl.classList.add('occupied');
    }
    selectedSeats = selectedSeats.filter(s => s !== seatId);
  } else {
    // Select
    seatEl.classList.remove('available', 'occupied');
    seatEl.classList.add('selected');
    selectedSeats.push(seatId);
  }
  
  console.log('Currently selected seats:', selectedSeats);
}

// Helper function to convert time string to minutes
function convertTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  const roomSelect = document.getElementById('roomSelect');
  const dateInput = document.getElementById('dateInput');
  
  // Left panel inputs
  const leftStudentId = document.getElementById('studentId');
  const leftDateInput = document.getElementById('reservationDate');
  const leftTimeIn = document.getElementById('timeIn');
  const leftTimeOut = document.getElementById('timeOut');
  const leftRoomInput = document.getElementById('roomNumber');
  
  // Buttons
  const reserveButton = document.querySelector('.reserve_button');
  const removeButton = document.querySelector('.remove_button');
  
  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.min = today;
  if (leftDateInput) leftDateInput.min = today;
  
  // Reserve button click handler
  if (reserveButton) {
    reserveButton.addEventListener('click', function() {
      if (currentMode === 'reserve' && selectedSeats.length > 0) {
        performReservation();
      } else {
        currentMode = 'reserve';
        reserveButton.classList.add('active');
        if (removeButton) removeButton.classList.remove('active');
        selectedSeats = [];
        updateDisplay();
        console.log('Mode set to: RESERVE');
      }
    });
  }
  
  // Remove button click handler  
  if (removeButton) {
    removeButton.addEventListener('click', function() {
      if (currentMode === 'remove' && selectedSeats.length > 0) {
        performRemoval();
      } else {
        currentMode = 'remove';
        removeButton.classList.add('active');
        if (reserveButton) reserveButton.classList.remove('active');
        selectedSeats = [];
        updateDisplay();
        console.log('Mode set to: REMOVE');
      }
    });
  }
  
  // Sync right panel date to left panel
  if (dateInput && leftDateInput) {
    dateInput.addEventListener('change', function() {
      leftDateInput.value = this.value;
      updateDisplay();
    });
    
    leftDateInput.addEventListener('change', function() {
      dateInput.value = this.value;
      updateDisplay();
    });
  }
  
  // Room selection handlers
  if (roomSelect) {
    roomSelect.addEventListener('change', function() {
      if (leftRoomInput) leftRoomInput.value = this.value;
      selectedSeats = [];
      updateDisplay();
    });
  }
  
  if (leftRoomInput) {
    leftRoomInput.addEventListener('change', function() {
      if (roomSelect) roomSelect.value = this.value;
      selectedSeats = [];
      updateDisplay();
    });
  }
  
  // Time in change handler
  if (leftTimeIn) {
    leftTimeIn.addEventListener('change', function() {
      updateDisplay();
    });
  }
  
  // Update display function
  function updateDisplay() {
    const date = dateInput.value || leftDateInput.value;
    const room = roomSelect.value || leftRoomInput.value;
    const timeIn = leftTimeIn.value;
    
    updateBookingOverview(date, room, timeIn);
    renderSeats(room, date, timeIn);
  }
  
  // Perform reservation
  function performReservation() {
    const studentId = leftStudentId.value.trim();
    const date = leftDateInput.value;
    const timeIn = leftTimeIn.value;
    const timeOut = leftTimeOut.value;
    const room = leftRoomInput.value;
    
    // Validation
    if (!studentId) {
      alert('Please enter a Student ID.');
      return;
    }
    
    if (studentId.length !== 8 || isNaN(studentId)) {
      alert('Please enter a valid 8-digit Student ID.');
      return;
    }
    
    if (!validateStudentId(studentId)) {
      alert('Student ID not found in the system. Please check and try again.');
      return;
    }
    
    if (!date) {
      alert('Please select a date.');
      return;
    }
    
    if (!timeIn) {
      alert('Please select a Time In.');
      return;
    }
    
    if (!timeOut) {
      alert('Please select a Time Out.');
      return;
    }
    
    const timeInMinutes = convertTimeToMinutes(timeIn);
    const timeOutMinutes = convertTimeToMinutes(timeOut);
    
    if (timeOutMinutes <= timeInMinutes) {
      alert('Time Out must be after Time In.');
      return;
    }
    
    if (!room) {
      alert('Please select a room.');
      return;
    }
    
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat from the seating chart.');
      return;
    }
    
    // Check for conflicts
    const existingReservations = getReservations();
    const conflicts = [];
    
    selectedSeats.forEach(seatId => {
      const conflict = existingReservations.some(res =>
        res.date === date &&
        res.room === room &&
        res.seat === seatId &&
        res.timeIn === timeIn
      );
      
      if (conflict) {
        conflicts.push(seatId);
      }
    });
    
    if (conflicts.length > 0) {
      alert(`The following seats are already reserved: ${conflicts.join(', ')}`);
      return;
    }
    
    // Create reservations
    const newReservations = selectedSeats.map(seatId => ({
      userId: studentId,
      username: 'Admin Reservation',
      date: date,
      timeIn: timeIn,
      timeOut: timeOut,
      room: room,
      seat: seatId,
      anonymous: true
    }));
    
    // Save reservations
    const allReservations = getReservations();
    allReservations.push(...newReservations);
    saveReservations(allReservations);
    
    alert(`Successfully reserved ${selectedSeats.length} seat(s): ${selectedSeats.join(', ')}`);
    
    // Reset form
    selectedSeats = [];
    leftStudentId.value = '';
    leftTimeIn.value = '';
    leftTimeOut.value = '';
    
    updateDisplay();
  }
  
  // Perform removal
  function performRemoval() {
    const date = leftDateInput.value;
    const timeIn = leftTimeIn.value;
    const room = leftRoomInput.value;
    
    if (!date) {
      alert('Please select a date.');
      return;
    }
    
    if (!timeIn) {
      alert('Please select a Time In.');
      return;
    }
    
    if (!room) {
      alert('Please select a room.');
      return;
    }
    
    if (selectedSeats.length === 0) {
      alert('Please select at least one occupied seat to remove.');
      return;
    }
    
    const confirmMsg = `Are you sure you want to remove ${selectedSeats.length} reservation(s) for seat(s): ${selectedSeats.join(', ')}?`;
    if (!confirm(confirmMsg)) {
      return;
    }
    
    let allReservations = getReservations();
    const removedSeats = [];
    
    selectedSeats.forEach(seatId => {
      const index = allReservations.findIndex(res =>
        res.date === date &&
        res.room === room &&
        res.seat === seatId &&
        res.timeIn === timeIn
      );
      
      if (index !== -1) {
        allReservations.splice(index, 1);
        removedSeats.push(seatId);
      }
    });
    
    if (removedSeats.length > 0) {
      saveReservations(allReservations);
      alert(`Successfully removed ${removedSeats.length} reservation(s): ${removedSeats.join(', ')}`);
    } else {
      alert('No matching reservations found to remove.');
    }
    
    selectedSeats = [];
    updateDisplay();
  }
});
