// Room seat counts
const ROOM_SEATS = {
  'A1706': 36,
  'V301': 36,
  'V310': 36
};

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
  // Only check localStorage userAccounts
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
  const totalSeats = ROOM_SEATS[room] || 36;
  const occupied = getOccupiedSeats(date, room, timeIn);
  return totalSeats - occupied.length;
}

// Update booking overview
function updateBookingOverview(date, room, timeIn) {
  const seatsAvailableEl = document.getElementById('seatsAvailable');
  const seatsRepairEl = document.getElementById('seatsRepair');
  
  if (!date || !room || !timeIn) {
    if (room) {
      const totalSeats = ROOM_SEATS[room] || 36;
      seatsAvailableEl.textContent = `${totalSeats}/${totalSeats}`;
    } else {
      seatsAvailableEl.textContent = '0/0';
    }
    seatsRepairEl.textContent = '0';
    return;
  }
  
  const totalSeats = ROOM_SEATS[room] || 36;
  const available = calculateAvailableSeats(date, room, timeIn);
  
  seatsAvailableEl.textContent = `${available}/${totalSeats}`;
  seatsRepairEl.textContent = '0'; // No repair seats for now
}

// Update seating chart colors based on occupancy
function updateSeatingChart(date, room, timeIn) {
  if (!date || !room || !timeIn) return;
  
  const occupiedSeats = getOccupiedSeats(date, room, timeIn);
  const chart = document.getElementById('chart_' + room);
  
  if (!chart) return;
  
  // Reset all seats to available
  chart.querySelectorAll('.seat:not(.supervisor)').forEach(seat => {
    seat.classList.remove('occupied', 'selected', 'available');
    seat.classList.add('available');
  });
  
  // Mark occupied seats
  occupiedSeats.forEach(seatId => {
    const seatEl = chart.querySelector(`[data-seat="${seatId}"]`);
    if (seatEl) {
      seatEl.classList.remove('available', 'selected');
      seatEl.classList.add('occupied');
    }
  });
}

// Selected seats tracker
let selectedSeats = [];

// Handle seat selection
function setupSeatSelection(roomId) {
  const chart = document.getElementById('chart_' + roomId);
  if (!chart) {
    console.log('Chart not found for room:', roomId);
    return;
  }
  
  const seats = chart.querySelectorAll('.seat:not(.supervisor)');
  console.log(`Setting up ${seats.length} seats for room ${roomId}`);
  
  seats.forEach(seatEl => {
    // Remove any existing listeners by cloning
    const newSeatEl = seatEl.cloneNode(true);
    seatEl.parentNode.replaceChild(newSeatEl, seatEl);
    
    newSeatEl.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Seat clicked:', this.dataset.seat, 'Classes:', this.className);
      
      // Can only select available seats
      if (this.classList.contains('occupied')) {
        alert('This seat is already reserved for this time slot.');
        return;
      }
      
      if (this.classList.contains('repair')) {
        alert('This seat is under repair.');
        return;
      }
      
      const seatId = this.dataset.seat;
      
      if (this.classList.contains('selected')) {
        // Deselect
        console.log('Deselecting seat:', seatId);
        this.classList.remove('selected');
        this.classList.add('available');
        selectedSeats = selectedSeats.filter(s => s !== seatId);
      } else {
        // Select
        console.log('Selecting seat:', seatId);
        this.classList.remove('available');
        this.classList.add('selected');
        selectedSeats.push(seatId);
      }
      
      console.log('Currently selected seats:', selectedSeats);
    });
  });
}

// Helper function to convert time string to minutes
function convertTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Show/hide seating charts based on room selection
document.addEventListener('DOMContentLoaded', function() {
  const roomSelect = document.getElementById('roomSelect');
  const dateInput = document.getElementById('dateInput');
  
  // Left panel inputs
  const leftStudentId = document.getElementById('studentId');
  const leftDateInput = document.getElementById('reservationDate');
  const leftTimeIn = document.getElementById('timeIn');
  const leftTimeOut = document.getElementById('timeOut');
  const leftRoomInput = document.getElementById('roomNumber');
  
  // Reserve button
  const reserveButton = document.querySelector('.reserve_button');
  
  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.min = today;
  if (leftDateInput) leftDateInput.min = today;
  
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
  
  // Sync right panel room to left panel and show seating chart
  if (roomSelect) {
    roomSelect.addEventListener('change', function() {
      const selectedRoom = this.value;
      
      console.log('Room selected:', selectedRoom);
      
      // Sync to left panel
      if (leftRoomInput) {
        leftRoomInput.value = selectedRoom;
      }
      
      // Hide all charts
      document.querySelectorAll('.seating_chart').forEach(chart => {
        chart.style.display = 'none';
      });
      
      // Reset selected seats
      selectedSeats = [];
      
      // Show selected chart
      if (selectedRoom) {
        const chart = document.getElementById('chart_' + selectedRoom);
        if (chart) {
          chart.style.display = 'block';
          
          // Ensure all seats have the available class initially
          setTimeout(() => {
            chart.querySelectorAll('.seat:not(.supervisor)').forEach(seat => {
              if (!seat.classList.contains('occupied') && !seat.classList.contains('repair')) {
                seat.classList.add('available');
              }
            });
            
            // Setup seat selection handlers
            setupSeatSelection(selectedRoom);
            console.log('Seat selection setup complete for', selectedRoom);
          }, 100);
        }
      }
      
      updateDisplay();
    });
  }
  
  // Sync left panel room to right panel
  if (leftRoomInput) {
    leftRoomInput.addEventListener('change', function() {
      const selectedRoom = this.value;
      
      console.log('Left room input changed:', selectedRoom);
      
      // Sync to right panel
      if (roomSelect) {
        roomSelect.value = selectedRoom;
        
        // Trigger the room change event to show seating chart
        const event = new Event('change');
        roomSelect.dispatchEvent(event);
      }
    });
  }
  
  // Update display when time in changes
  if (leftTimeIn) {
    leftTimeIn.addEventListener('change', function() {
      updateDisplay();
    });
  }
  
  // Function to update all displays
  function updateDisplay() {
    const date = dateInput.value || leftDateInput.value;
    const room = roomSelect.value || leftRoomInput.value;
    const timeIn = leftTimeIn.value;
    
    // Don't reset selected seats when just updating display
    // selectedSeats = [];
    
    updateBookingOverview(date, room, timeIn);
    updateSeatingChart(date, room, timeIn);
  }
  
  // Reserve button functionality
  if (reserveButton) {
    reserveButton.addEventListener('click', function() {
      // Get form values
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
      
      // Validate Student ID exists
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
      
      // Validate time out is after time in
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
        username: 'Admin Reservation', // Admin-created reservation
        date: date,
        timeIn: timeIn,
        timeOut: timeOut,
        room: room,
        seat: seatId,
        anonymous: true // Admin reservations are anonymous
      }));
      
      console.log('Creating reservations:', newReservations);
      
      // Save reservations
      const allReservations = getReservations();
      console.log('Existing reservations:', allReservations);
      allReservations.push(...newReservations);
      saveReservations(allReservations);
      console.log('After saving, total reservations:', allReservations.length);
      
      // Verify it was saved
      const verifyReservations = getReservations();
      console.log('Verification - reservations in localStorage:', verifyReservations);
      
      // Success message
      alert(`Successfully reserved ${selectedSeats.length} seat(s): ${selectedSeats.join(', ')}`);
      
      // Reset form
      selectedSeats = [];
      leftStudentId.value = '';
      leftTimeIn.value = '';
      leftTimeOut.value = '';
      
      // Update display
      updateDisplay();
    });
  }
});