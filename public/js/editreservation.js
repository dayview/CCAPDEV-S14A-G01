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

function renderSeats() {
    if (!seatMap) {
        console.log("seat_map not found");
        return;
    }

    seatMap.innerHTML = "";
    selectedSeat = null;
    infoSeat.textContent = "--";
    reserveBtn.disabled = true;

    labLayout.forEach(seatId => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = seatId;
        btn.classList.add("seat");

        btn.addEventListener("click", () => {
            document.querySelectorAll(".seat.selected").forEach(el => {
                el.classList.remove("selected");
            });

            btn.classList.add("selected");
            selectedSeat = seatId;
            infoSeat.textContent = seatId;
            reserveBtn.disabled = false;
        });

        seatMap.appendChild(btn);
    });
}

const today = new Date();
const maxDate = new Date();
maxDate.setDate(today.getDate() + 6);

if (inputDate) {
    inputDate.min = formatDate(today);
    inputDate.max = formatDate(maxDate);
    inputDate.value = formatDate(today);
    infoDate.textContent = inputDate.value;

    inputDate.addEventListener("input", () => {
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

    infoRoom.textContent = inputRoom.value || "--";
}

updateTimeInfo();
renderSeats();
