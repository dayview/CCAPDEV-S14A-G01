const TIME_SLOTS = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

const roomSelect = document.getElementById('roomSelect');
const dateInput = document.getElementById('dateInput');
const scheduleBody = document.getElementById('scheduleBody');
const seatsAvailableEl = document.getElementById('seatsAvailable');
const seatsRepairEl = document.getElementById('seatsRepair');

dateInput.valueAsDate = new Date();

let selectedCell = null;

async function fetchSlotData(lab, date) {
  const res = await fetch(`/admin/slots/search?lab=${encodeURIComponent(lab)}&date=${encodeURIComponent(date)}`);
  if (!res.ok) throw new Error('Failed to fetch slot data');
  return res.json();
}

async function generateScheduleTable(room, date) {
  scheduleBody.innerHTML = '';
  selectedCell = null;

  if (!room || !date) {
    scheduleBody.innerHTML = '<tr><td colspan="23" class="empty_message">Please select a room and date to view availability</td></tr>';
    updateBookingOverview(null, null);
    return;
  }

  scheduleBody.innerHTML = '<tr><td colspan="23" class="empty_message">Loading...</td></tr>';

  try {
    const data = await fetchSlotData(room, date);
    scheduleBody.innerHTML = '';

    const slotMap = {};
    for (const ts of data.timeSlots) {
      slotMap[ts.startTime] = ts;
    }

    const row = document.createElement('tr');

    const labelCell = document.createElement('td');
    labelCell.textContent = 'SLOTS';
    labelCell.style.background = '#2f4f1f';
    labelCell.style.color = 'white';
    labelCell.style.fontWeight = 'bold';
    labelCell.style.fontSize = '13px';
    row.appendChild(labelCell);

    TIME_SLOTS.forEach((timeSlot) => {
      const cell = document.createElement('td');
      const ts = slotMap[timeSlot];

      if (!ts || ts.totalSeats === 0) {
        cell.className = 'status_unavailable';
      } else if (ts.availableSeats === 0) {
        cell.className = 'status_full';
      } else {
        cell.className = 'status_available';
      }

      cell.dataset.room = room;
      cell.dataset.time = timeSlot;

      cell.addEventListener('click', function () {
        if (selectedCell) selectedCell.classList.remove('selected_slot');
        this.classList.add('selected_slot');
        selectedCell = this;
        updateBookingOverview(ts || null, data.lab.capacity);
      });

      row.appendChild(cell);
    });

    scheduleBody.appendChild(row);
    updateBookingOverview(null, data.lab.capacity);
  } catch (err) {
    console.error('generateScheduleTable error:', err);
    scheduleBody.innerHTML = '<tr><td colspan="23" class="empty_message">Failed to load slot data. Please try again.</td></tr>';
    updateBookingOverview(null, null);
  }
}

function updateBookingOverview(slotData, capacity) {
  if (!slotData) {
    seatsAvailableEl.textContent = capacity ? `${capacity}/${capacity}` : '0/0';
    seatsRepairEl.textContent = '0';
    return;
  }
  seatsAvailableEl.textContent = `${slotData.availableSeats}/${slotData.totalSeats}`;
  seatsRepairEl.textContent = '0';
}

roomSelect.addEventListener('change', function () {
  generateScheduleTable(this.value, dateInput.value);
});

dateInput.addEventListener('change', function () {
  generateScheduleTable(roomSelect.value, this.value);
});

generateScheduleTable(null, null);
