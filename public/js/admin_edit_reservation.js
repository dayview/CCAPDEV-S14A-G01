const dateInput      = document.getElementById('dateInput');
const roomSelect     = document.getElementById('roomSelect');
const seatMapEl      = document.getElementById('seat_map');
const seatsAvail     = document.getElementById('seatsAvailable');

const timeInSelect   = document.getElementById('timeInSelect');
const timeOutSelect  = document.getElementById('timeOutSelect');

const hiddenDate     = document.getElementById('hiddenDate');
const hiddenTimeIn   = document.getElementById('hiddenTimeIn');
const hiddenTimeOut  = document.getElementById('hiddenTimeOut');
const hiddenRoom     = document.getElementById('hiddenRoom');
const hiddenSeat     = document.getElementById('hiddenSeat');

const infoLab        = document.getElementById('infoLab');
const infoSeat       = document.getElementById('infoSeat');
const infoDate       = document.getElementById('infoDate');
const infoTimeIn     = document.getElementById('infoTimeIn');
const infoTimeOut    = document.getElementById('infoTimeOut');
const slotStatus     = document.getElementById('slotStatus');
const finishEditBtn  = document.getElementById('finishEditBtn');

let selectedSeat     = CURRENT_SEAT;
let currentCapacity  = CURRENT_CAPACITY;
let occupiedByOthers = [];


function convertTimeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function filterTimeOptions(selectEl, referenceTime, direction) {
    if (!selectEl) return;

    if (!referenceTime) {
        Array.from(selectEl.options).forEach(option => option.hidden = false);
        return;
    }

    const refMinutes = convertTimeToMinutes(referenceTime);

    Array.from(selectEl.options).forEach(option => {
        if (!option.value) return;
        const optMinutes = convertTimeToMinutes(option.value);
        if (direction === 'after') {
            option.hidden = optMinutes <= refMinutes;
        } else {
            option.hidden = optMinutes >= refMinutes;
        }
    });

    // Clear the current value if it's now invalid
    if (selectEl.value) {
        const currentMinutes = convertTimeToMinutes(selectEl.value);
        if (direction === 'after' && currentMinutes <= refMinutes) selectEl.value = '';
        if (direction === 'before' && currentMinutes >= refMinutes) selectEl.value = '';
    }
}


timeInSelect.value  = CURRENT_TIMEIN;
filterTimeOptions(timeOutSelect, CURRENT_TIMEIN, 'after');
timeOutSelect.value = CURRENT_TIMEOUT;


function setStatus(msg, type) {
    slotStatus.textContent = msg;
    slotStatus.className   = `slot_status slot_${type}`;
}


function syncLeftPanel() {
    const date    = dateInput.value;
    const timeIn  = timeInSelect.value;
    const timeOut = timeOutSelect.value;
    const room    = roomSelect.value;

    infoLab.textContent     = room        || '--';
    infoSeat.textContent    = selectedSeat || '--';
    infoDate.textContent    = date        || '--';
    infoTimeIn.textContent  = timeIn      || '--';
    infoTimeOut.textContent = timeOut     || '--';

    hiddenDate.value    = date;
    hiddenTimeIn.value  = timeIn;
    hiddenTimeOut.value = timeOut;
    hiddenRoom.value    = room;
    hiddenSeat.value    = selectedSeat || '';
}


function renderSeatMap(occupied) {
    seatMapEl.innerHTML = '';
    let availCount = 0;

    for (let i = 1; i <= currentCapacity; i++) {
        const seat = document.createElement('div');
        seat.classList.add('seat');
        seat.textContent = i;
        seat.dataset.num = i;

        if (occupied.includes(i)) {
            seat.classList.add('occupied');
            seat.title = 'Occupied';
        } else {
            if (i === selectedSeat) {
                seat.classList.add('selected');
                seat.title = 'Selected';
            } else {
                seat.classList.add('available');
                availCount++;
            }

            seat.addEventListener('click', () => {
                selectedSeat = i;
                syncLeftPanel();
                renderSeatMap(occupiedByOthers);
                validateSelection();
            });
        }

        seatMapEl.appendChild(seat);
    }

    seatsAvail.textContent = `${availCount}/${currentCapacity}`;
}


function validateSelection() {
    const date    = dateInput.value;
    const timeIn  = timeInSelect.value;
    const timeOut = timeOutSelect.value;

    if (!date || !timeIn || !timeOut || !selectedSeat) {
        finishEditBtn.disabled = true;
        setStatus('Please select a date, time in, time out, and seat.', 'checking');
        return;
    }

    if (convertTimeToMinutes(timeOut) <= convertTimeToMinutes(timeIn)) {
        finishEditBtn.disabled = true;
        setStatus('Time Out must be after Time In.', 'error');
        return;
    }

    if (occupiedByOthers.includes(selectedSeat)) {
        finishEditBtn.disabled = true;
        setStatus('That seat is already occupied at this date and time.', 'error');
        return;
    }

    finishEditBtn.disabled = false;
    setStatus('Slot is available — ready to save.', 'ok');
}


async function checkAvailability() {
    syncLeftPanel();

    const date   = dateInput.value;
    const timeIn = timeInSelect.value;
    const room   = roomSelect.value;

    const selectedOption = roomSelect.options[roomSelect.selectedIndex];
    if (selectedOption && selectedOption.dataset.capacity) {
        currentCapacity = Number(selectedOption.dataset.capacity);
    }

    if (!date || !timeIn || !room) {
        finishEditBtn.disabled = true;
        setStatus('', 'checking');
        renderSeatMap([]);
        return;
    }

    try {
        setStatus('Checking availability...', 'checking');

        const params = new URLSearchParams({ date, time: timeIn, room });
        const res    = await fetch(`/reservation/search-availability?${params}`);
        const data   = await res.json();

        const sameSlot = (room === CURRENT_LAB && date === CURRENT_DATE && timeIn === CURRENT_TIMEIN);
        occupiedByOthers = (data.occupiedSeats || []).filter(s => sameSlot ? s !== CURRENT_SEAT : true);

        if (room !== CURRENT_LAB && selectedSeat === CURRENT_SEAT) {
            selectedSeat = null;
        }

        renderSeatMap(occupiedByOthers);
        syncLeftPanel();
        validateSelection();
    } catch (err) {
        console.error('Availability check failed:', err);
        setStatus('Could not verify availability. Please try again.', 'error');
        finishEditBtn.disabled = true;
    }
}


dateInput.addEventListener('change', checkAvailability);
roomSelect.addEventListener('change', checkAvailability);

timeInSelect.addEventListener('change', function () {
    // Filter timeOut to only show times after the selected timeIn
    filterTimeOptions(timeOutSelect, this.value, 'after');
    syncLeftPanel();
    validateSelection();
    checkAvailability();
});

timeOutSelect.addEventListener('change', function () {
    // Filter timeIn to only show times before the selected timeOut
    filterTimeOptions(timeInSelect, this.value, 'before');
    syncLeftPanel();
    validateSelection();
});


syncLeftPanel();
checkAvailability();