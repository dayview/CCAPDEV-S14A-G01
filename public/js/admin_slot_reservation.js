const ROOM_SEATS = {
  'GK302A': 20,
  'GK302B': 20,
  'GK304B': 20
};

const lab_layout = [
  "1",  "2",  "3",  "4",  "5",
  "6",  "7",  "8",  "9",  "10",
  "11", "12", "13", "14", "15",
  "16", "17", "18", "19", "20"
];

let currentMode = 'reserve';
let selectedSeats = [];
let currentOccupiedSeats = [];

async function fetchOccupiedSeats(room, date, timeIn) {
  if (!room || !date || !timeIn) return [];
  try {
    const res = await fetch(`/admin/slots/seats?lab=${encodeURIComponent(room)}&date=${encodeURIComponent(date)}&timeIn=${encodeURIComponent(timeIn)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.occupiedSeats || [];
  } catch (err) {
    console.error('fetchOccupiedSeats error:', err);
    return [];
  }
}

function updateBookingOverview(room, occupiedSeats) {
  const seatsAvailableEl = document.getElementById('seatsAvailable');
  const seatsRepairEl = document.getElementById('seatsRepair');
  const totalSeats = ROOM_SEATS[room] || 20;

  if (!room) {
    seatsAvailableEl.textContent = '0/0';
  } else {
    const available = totalSeats - occupiedSeats.length;
    seatsAvailableEl.textContent = `${available}/${totalSeats}`;
  }
  seatsRepairEl.textContent = '0';
}

function renderSeats(room, occupiedSeats) {
  const seatMap = document.getElementById('seat_map');
  seatMap.innerHTML = '';
  selectedSeats = [];

  if (!room) return;

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

    btn.addEventListener('click', function() {
      handleSeatClick(this, isOccupied);
    });

    seatMap.appendChild(btn);
  });
}

function handleSeatClick(seatEl, isOccupied) {
  const seatId = seatEl.dataset.seat;

  if (currentMode === 'reserve' && isOccupied) {
    alert('This seat is already reserved for this time slot.');
    return;
  }

  if (currentMode === 'remove' && !isOccupied) {
    alert('This seat is not occupied. Please select an occupied seat to remove.');
    return;
  }

  if (seatEl.classList.contains('selected')) {
    seatEl.classList.remove('selected');
    seatEl.classList.add(isOccupied ? 'occupied' : 'available');
    selectedSeats = selectedSeats.filter(s => s !== seatId);
  } else {
    seatEl.classList.remove('available', 'occupied');
    seatEl.classList.add('selected');
    selectedSeats.push(seatId);
  }
}

function convertTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

document.addEventListener('DOMContentLoaded', function() {
  const roomSelect = document.getElementById('roomSelect');
  const dateInput = document.getElementById('dateInput');

  const leftStudentId = document.getElementById('studentId');
  const leftDateInput = document.getElementById('reservationDate');
  const leftTimeIn = document.getElementById('timeIn');
  const leftTimeOut = document.getElementById('timeOut');
  const leftRoomInput = document.getElementById('roomNumber');

  const reserveButton = document.querySelector('.reserve_button');
  const removeButton = document.querySelector('.remove_button');

  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.min = today;
  if (leftDateInput) leftDateInput.min = today;

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
      }
    });
  }

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
      }
    });
  }

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

  if (leftTimeIn) {
    leftTimeIn.addEventListener('change', updateDisplay);
  }

  async function updateDisplay() {
    const date = dateInput.value || leftDateInput.value;
    const room = roomSelect.value || leftRoomInput.value;
    const timeIn = leftTimeIn.value;

    currentOccupiedSeats = await fetchOccupiedSeats(room, date, timeIn);
    updateBookingOverview(room, currentOccupiedSeats);
    renderSeats(room, currentOccupiedSeats);
  }

  async function performReservation() {
    const studentId = leftStudentId.value.trim();
    const date = leftDateInput.value;
    const timeIn = leftTimeIn.value;
    const timeOut = leftTimeOut.value;
    const room = leftRoomInput.value;

    if (!studentId) { alert('Please enter a Student ID.'); return; }
    if (studentId.length !== 8 || isNaN(studentId)) { alert('Please enter a valid 8-digit Student ID.'); return; }
    if (!date) { alert('Please select a date.'); return; }
    if (!timeIn) { alert('Please select a Time In.'); return; }
    if (!timeOut) { alert('Please select a Time Out.'); return; }
    if (convertTimeToMinutes(timeOut) <= convertTimeToMinutes(timeIn)) {
      alert('Time Out must be after Time In.'); return;
    }
    if (!room) { alert('Please select a room.'); return; }
    if (selectedSeats.length === 0) { alert('Please select at least one seat.'); return; }

    try {
      const res = await fetch('/admin/slots/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, date, timeIn, timeOut, room, seats: selectedSeats, isAnonymous: document.getElementById('isAnonymous').checked })
      });
      const data = await res.json();

      if (!res.ok) { alert(data.error || 'Reservation failed.'); return; }

      const failed = data.results.filter(r => !r.success);
      const succeeded = data.results.filter(r => r.success);

      if (succeeded.length > 0) {
        alert(`Successfully reserved seat(s): ${succeeded.map(r => r.seat).join(', ')}`);
      }
      if (failed.length > 0) {
        alert(`Could not reserve seat(s): ${failed.map(r => `${r.seat} (${r.reason})`).join(', ')}`);
      }

      leftStudentId.value = '';
      leftTimeIn.value = '';
      leftTimeOut.value = '';
      await updateDisplay();
    } catch (err) {
      console.error('performReservation error:', err);
      alert('An error occurred. Please try again.');
    }
  }

  async function performRemoval() {
    const date = leftDateInput.value;
    const timeIn = leftTimeIn.value;
    const room = leftRoomInput.value;

    if (!date) { alert('Please select a date.'); return; }
    if (!timeIn) { alert('Please select a Time In.'); return; }
    if (!room) { alert('Please select a room.'); return; }
    if (selectedSeats.length === 0) { alert('Please select at least one occupied seat to remove.'); return; }

    if (!confirm(`Remove reservation(s) for seat(s): ${selectedSeats.join(', ')}?`)) return;

    try {
      const res = await fetch('/admin/slots/removal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, timeIn, room, seats: selectedSeats })
      });
      const data = await res.json();

      if (!res.ok) { alert(data.error || 'Removal failed.'); return; }

      const succeeded = data.results.filter(r => r.success);
      const failed = data.results.filter(r => !r.success);

      if (succeeded.length > 0) {
        alert(`Successfully removed reservation(s) for seat(s): ${succeeded.map(r => r.seat).join(', ')}`);
      }
      if (failed.length > 0) {
        alert(`Could not remove seat(s): ${failed.map(r => `${r.seat} (${r.reason})`).join(', ')}`);
      }

      await updateDisplay();
    } catch (err) {
      console.error('performRemoval error:', err);
      alert('An error occurred. Please try again.');
    }
  }
});