const infoDate = document.getElementById("infoDate");
const infoTimeIn = document.getElementById("infoTimeIn");
const infoTimeOut = document.getElementById("infoTimeOut");
const infoRoom = document.getElementById("infoRoom");
const infoSeat = document.getElementById("infoSeat");

const inputDate = document.getElementById("reserve_date");
const inputTime = document.getElementById("reserve_time");
const inputRoom = document.getElementById("room_num");
const reserveBtn = document.querySelector(".reserve-btn");
const seatMap = document.getElementById("seat_map");
if (!seatMap) console.log("seat_map not found.")

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
    return time
        .getHours()
        .toString()
        .padStart(2, "0") + ":" + time
        .getMinutes()
        .toString()
        .padStart(2, "0");
}

const today = new Date();
const maxDate = new Date();
maxDate.setDate(today.getDate() + 6);

inputDate.min = formatDate(today);
inputDate.max = formatDate(maxDate);
inputDate.value = formatDate(today);
infoDate.textContent = inputDate.value;

function updateTimeInfo() {
    const [hours, minutes] = inputTime.value.split(":").map(Number);
    const timeIn = new Date();
    timeIn.setHours(hours);
    timeIn.setMinutes(minutes);

    const timeOut = new Date(timeIn);
    timeOut.setMinutes(timeOut.getMinutes() + 30);

    infoTimeIn.textContent = formatTime(timeIn);
    infoTimeOut.textContent = formatTime(timeOut);
}


function renderSeats() {
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
            document.querySelectorAll(".seat.selected").forEach(el=> el.classList.remove("selected"));
            btn.classList.add("selected");
            selectedSeat = seatId;
            infoSeat.textContent = seatId;
            reserveBtn.disabled = false;
        });

        seatMap.appendChild(btn);
    });
}

inputDate?.addEventListener("input", () => {
    infoDate.textContent = inputDate.value;
    renderSeats();
})

inputTime?.addEventListener("change", () => {
    updateTimeInfo();
    renderSeats();
})

inputRoom?.addEventListener("change", () => {
    infoRoom.textContent = inputRoom.value;
    renderSeats();
})

updateTimeInfo();
infoRoom.textContent = inputRoom.value;
renderSeats();