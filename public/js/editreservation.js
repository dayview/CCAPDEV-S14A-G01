const infoDate = document.getElementById("infoDate");
const infoTimeIn = document.getElementById("infoTimeIn");
const infoTimeOut = document.getElementById("infoTimeOut");
const infoRoom = document.getElementById("infoRoom");
const infoSeat = document.getElementById("infoSeat");

const inputDate = document.getElementById("reserve_date");
const inputTime = document.getElementById("reserve_time");
const inputRoom = document.getElementById("room_num");

const seatMap = document.getElementById("seat_map");
const selectedSeatInput = document.getElementById("selectedSeat");
const editForm = document.getElementById("editReservationForm");

let selectedSeat = null;

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

function formatTime(time) {
    return time.getHours().toString().padStart(2, "0") + ":" +
           time.getMinutes().toString().padStart(2, "0");
}

function updateTimeInfo() {
    if (!inputTime.value) {
        infoTimeIn.textContent = "--";
        infoTimeOut.textContent = "--";
        return;
    }

    const [hours, minutes] = inputTime.value.split(":").map(Number);

    const timeIn = new Date();
    timeIn.setHours(hours, minutes, 0, 0);

    const timeOut = new Date(timeIn);
    timeOut.setMinutes(timeOut.getMinutes() + 30);

    infoTimeIn.textContent = formatTime(timeIn);
    infoTimeOut.textContent = formatTime(timeOut);
}

async function fetchAvailableSeats() {
    const date = inputDate?.value;
    const time = inputTime?.value;
    const room = inputRoom?.value;

    if (!date || !time || !room) {
        return [];
    }

    try {
        const response = await fetch(
            `/reservation/search-availability?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&room=${encodeURIComponent(room)}`
        );
        const data = await response.json();
        return data.availableSeats || [];
    } catch (err) {
        console.error("Error fetching available seats:", err);
        return [];
    }
}

async function renderSeats() {
    if (!seatMap) return;

    const date = inputDate?.value;
    const time = inputTime?.value;
    const room = inputRoom?.value;
    
    if (!date || !time || !room) {
        seatMap.innerHTML = "<p>Please select date, time, and room</p>";
        return;
    }

    const availableSeats = await fetchAvailableSeats();

    seatMap.innerHTML = "";
    selectedSeat = null;
    infoSeat.textContent = "--";
    if (selectedSeatInput) selectedSeatInput.value = "";

    for (let i = 1; i <= 20; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = i;
        btn.classList.add("seat");
        
        if (availableSeats.includes(i)) {
            btn.classList.add("available");
            btn.addEventListener("click", () => {
                document.querySelectorAll(".seat.selected").forEach(el => {
                    el.classList.remove("selected");
                });
                btn.classList.add("selected");
                selectedSeat = i;
                infoSeat.textContent = i;
                if (selectedSeatInput) selectedSeatInput.value = i;
            });
        } else {
            btn.classList.add("reserved");
            btn.disabled = true;
        }
        
        seatMap.appendChild(btn);
    }
}


const today = new Date();
const maxDate = new Date();
maxDate.setDate(today.getDate() + 6);

if (inputDate) {
    inputDate.min = formatDate(today);
    inputDate.max = formatDate(maxDate);
}


if (inputDate) {
    inputDate.addEventListener("change", () => {
        infoDate.textContent = inputDate.value;
        renderSeats();
    });
}

if (inputTime) {
    inputTime.addEventListener("change", () => {
        updateTimeInfo();
        renderSeats();
    });
}

if (inputRoom) {
    inputRoom.addEventListener("change", () => {
        infoRoom.textContent = inputRoom.value || "--";
        renderSeats();
    });
}


if (editForm) {
    editForm.addEventListener("submit", (e) => {
        if (!selectedSeat) {
            e.preventDefault();
            alert("Please select a seat");
            return false;
        }
    });
}


async function loadCurrentReservation() {
    const reservationId = editForm?.dataset.reservationId;
    if (!reservationId) return;
    
    try {
        const response = await fetch(`/reservation/edit/${reservationId}/data`);
        const data = await response.json();
        
        if (data.reservation) {
            const slotDate = new Date(data.reservation.slot.date);
            inputDate.value = formatDate(slotDate);
            inputTime.value = data.reservation.slot.startTime;
            inputRoom.value = data.reservation.slot.lab.labName;
            
            infoDate.textContent = inputDate.value;
            infoRoom.textContent = inputRoom.value;
            updateTimeInfo();
            
            await renderSeats();
            
            
            const currentSeatNum = data.reservation.slot.seatNum;
            const seats = document.querySelectorAll(".seat");
            seats.forEach(seat => {
                if (parseInt(seat.textContent) === currentSeatNum && !seat.disabled) {
                    seat.click();
                }
            });
        }
    } catch (err) {
        console.error("Error loading reservation:", err);
    }
}

updateTimeInfo();
loadCurrentReservation();