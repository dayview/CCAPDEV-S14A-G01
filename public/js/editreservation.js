const infoDate = document.getElementById("infoDate");
const infoTimeIn = document.getElementById("infoTimeIn");
const infoTimeOut = document.getElementById("infoTimeOut");
const infoRoom = document.getElementById("infoRoom");
const infoSeat = document.getElementById("infoSeat");

const inputDate = document.getElementById("reserve_date");
const inputTime = document.getElementById("reserve_time");
const inputRoom = document.getElementById("room_num");

const seatMap = document.getElementById("seat_map");
const reserveBtn = document.querySelector(".reserve-btn");

const labLayout = [
    "1", "2", "3", "4", "5",
    "6", "7", "8", "9", "10",
    "11", "12", "13", "14", "15",
    "16", "17", "18", "19", "20"
];

function getReservations() {
    const raw = localStorage.getItem("reservations");
    return raw ? JSON.parse(raw) : [];
}

function saveReservations(reservations) {
    localStorage.setItem("reservations", JSON.stringify(reservations));
}

function computeTimeOut(timeIn) {
    const [hours, minutes] = timeIn.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes + 30, 0, 0);

    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const currentUserId = currentUser?.idNum || currentUser?.idNumber;

if (!currentUser || !currentUserId) {
    alert("Please log in first.");
    window.location.href = "/auth/login";
}

let selectedSeat = null;
let userReservationIndex = -1;
let reservations = getReservations();

for (let i = reservations.length - 1; i >= 0; i--) {
    if (reservations[i].userId === currentUserId) {
        userReservationIndex = i;
        break;
    }
}

if (userReservationIndex === -1) {
    alert("You have no reservation.");
    window.location.href = "/auth/profile";
}

const userReservation = reservations[userReservationIndex];

const today = new Date();
const maxDate = new Date();
maxDate.setDate(today.getDate() + 6);

inputDate.min = formatDate(today);
inputDate.max = formatDate(maxDate);

inputDate.value = userReservation.date;
inputRoom.value = userReservation.room;
inputTime.value = userReservation.timeIn;

selectedSeat = userReservation.seat;

function syncInfoPanel() {
    const date = inputDate.value;
    const timeIn = inputTime.value;
    const room = inputRoom.value;
    const timeOut = computeTimeOut(timeIn);

    if (infoDate) infoDate.textContent = date || "-";
    if (infoTimeIn) infoTimeIn.textContent = timeIn || "-";
    if (infoTimeOut) infoTimeOut.textContent = timeOut || "-";
    if (infoRoom) infoRoom.textContent = room || "-";
    if (infoSeat) infoSeat.textContent = selectedSeat || "-";
}

function renderSeats() {
    if (!seatMap || !reserveBtn) return;

    seatMap.innerHTML = "";
    reserveBtn.disabled = true;

    const chosenRoom = inputRoom.value;
    const chosenDate = inputDate.value;
    const chosenTime = inputTime.value;

    if (!chosenRoom || !chosenDate || !chosenTime) {
        syncInfoPanel();
        return;
    }

    const reservedSeats = reservations.filter(res =>
        res.room === chosenRoom &&
        res.date === chosenDate &&
        res.timeIn === chosenTime
    );

    labLayout.forEach(seatId => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = seatId;
        btn.classList.add("seat");

        const seatTaken = reservedSeats.find(res => res.seat === seatId);

        if (seatTaken && seatTaken.userId !== currentUserId) {
            btn.classList.add("reserved");
            btn.disabled = true;
            seatMap.appendChild(btn);
            return;
        }

        if (seatId === selectedSeat) {
            btn.classList.add("selected");
            reserveBtn.disabled = false;
        }

        btn.addEventListener("click", () => {
            const prev = document.querySelector(".seat.selected");
            if (prev) prev.classList.remove("selected");

            btn.classList.add("selected");
            selectedSeat = seatId;
            reserveBtn.disabled = false;
            syncInfoPanel();
        });

        seatMap.appendChild(btn);
    });

    syncInfoPanel();
}

inputDate.addEventListener("change", () => {
    selectedSeat = null;
    renderSeats();
});

inputTime.addEventListener("change", () => {
    selectedSeat = null;
    renderSeats();
});

inputRoom.addEventListener("change", () => {
    selectedSeat = null;
    renderSeats();
});

renderSeats();

reserveBtn.addEventListener("click", () => {
    if (!selectedSeat) {
        alert("Please select a seat.");
        return;
    }

    reservations[userReservationIndex] = {
        ...reservations[userReservationIndex],
        date: inputDate.value,
        timeIn: inputTime.value,
        timeOut: computeTimeOut(inputTime.value),
        room: inputRoom.value,
        seat: selectedSeat
    };

    saveReservations(reservations);

    alert("Reservation is now updated!");
    window.location.href = "/auth/profile";
});