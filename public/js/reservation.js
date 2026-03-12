
const rememberUntil = Number(localStorage.getItem("rememberUntil"));
const sessionLogin = sessionStorage.getItem("isLoggedIn");
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

let authenticated = false;

if (rememberUntil && Date.now() <= rememberUntil) {
    authenticated = true;
} else if (sessionLogin === "true") {
    authenticated = true;
}

if (!authenticated || !currentUser) {
    localStorage.removeItem("rememberUntil");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("isLoggedIn");
    authenticated = false;
}

const infoDate = document.getElementById("infoDate");
const infoTimeIn = document.getElementById("infoTimeIn");
const infoTimeOut = document.getElementById("infoTimeOut");
const infoRoom = document.getElementById("infoRoom");
const infoSeat = document.getElementById("infoSeat");

const inputDate = document.getElementById("reserve_date");
const inputTime = document.getElementById("reserve_time");
const inputRoom = document.getElementById("room_num");

const anonymousReservation = document.getElementById("anonymous");

inputDate.addEventListener("input", () => {
    infoDate.textContent = inputDate.value;
})

const today = new Date();
const maxDate = new Date();
maxDate.setDate(today.getDate() + 6);

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

inputDate.min = formatDate(today);
inputDate.max = formatDate(maxDate);
inputDate.value = formatDate(today);

inputTime.addEventListener("change", () => {
    const [hours, minutes] = inputTime.value.split(":").map(Number);
    const timeIn = new Date();
    timeIn.setHours(hours);
    timeIn.setMinutes(minutes);

    const timeOut  = new Date(timeIn);
    timeOut.setMinutes(timeOut.getMinutes() + 30);

    infoTimeIn.textContent = formatTime(timeIn);
    infoTimeOut.textContent = formatTime(timeOut);
})

function formatTime(time) {
    return time
        .getHours()
        .toString()
        .padStart(2, "0") + ":" + time
        .getMinutes()
        .toString()
        .padStart(2, "0");
}

const seatMap = document.getElementById("seat_map");
const reserveBtn = document.querySelector(".reserve-btn");
const lab_layout = [
    "A1", "A2", "A3", "A4", "A5",
    "B1", "B2", "B3", "B4", "B5",
    "C1", "C2", "C3", "C4", "C5",
    "D1", "D2", "D3", "D4", "D5"
];

let selectedSeat = null;

function renderSeats(labCode) {
    seatMap.innerHTML = "";
    selectedSeat = null;
    infoSeat.textContent = "--";
    reserveBtn.disabled = true;

    const date = inputDate.value;
    const time = inputTime.value;

    const reservedSeats = getReservations().filter(reservation =>
        reservation.room === labCode &&
        reservation.date === date &&
        reservation.timeIn === time
    );

    lab_layout.forEach(seatId => {
        const btn = document.createElement("button");
        btn.textContent = seatId;
        btn.classList.add("seat");

        const seatReservation = reservedSeats.find(r => r.seat === seatId);

        if (seatReservation) {
            btn.classList.add("reserved");

            btn.addEventListener("click", () => {
                if (seatReservation.anonymous) {
                    alert("Reserved By: Anonymous");
                } else {
                    alert(`Reserved By: ${seatReservation.username}`);
                }
            });

            seatMap.appendChild(btn);
            return;
        }

        btn.addEventListener("click", () => {
            const prev = document.querySelector(".seat.selected");
            if (prev) prev.classList.remove("selected");

            btn.classList.add("selected");
            selectedSeat = seatId;
            infoSeat.textContent = seatId;
            reserveBtn.disabled = false;
        });

        seatMap.appendChild(btn);
    });
}

inputRoom.addEventListener("change", () => {
    infoRoom.textContent = inputRoom.value;
    renderSeats(inputRoom.value);
})

infoRoom.textContent = inputRoom.value;
renderSeats(inputRoom.value);

function getReservations() {
    const raw = localStorage.getItem("reservations");
    return raw ? JSON.parse(raw) : [];
}

function saveReservations(list) {
    localStorage.setItem("reservations", JSON.stringify(list));
}

reserveBtn.addEventListener("click", () => {
    if (!authenticated || !currentUser) {
        alert("Please log in to reserve a seat.");
        window.location.href = "login.html";
        return;
    }

    if (!selectedSeat) {
        alert("Please select seat.");
        return;
    }

    if (!inputDate.value || !inputTime.value) {
        alert("No date/time selected.");
        return;
    }

    const reservation = {
        userId: currentUser.idNumber,
        username: currentUser.username,
        date: inputDate.value,
        timeIn: inputTime.value,
        timeOut: infoTimeOut.textContent,
        room: inputRoom.value,
        seat: selectedSeat,
        anonymous: anonymousReservation.checked
    };

    const all = getReservations();

    const conflict = all.some(r =>
        r.date === reservation.date &&
        r.timeIn === reservation.timeIn &&
        r.room === reservation.room &&
        r.seat === reservation.seat
    );

    if (conflict) {
        alert("Seat already reserved.");
        return;
    }

    all.push(reservation);
    saveReservations(all);

    anonymousReservation.checked = false;
    renderSeats(reservation.room);
});

inputDate.addEventListener("change", () => {
    renderSeats(inputRoom.value);
})

inputTime.addEventListener("change", () => {
    renderSeats(inputRoom.value);
})
