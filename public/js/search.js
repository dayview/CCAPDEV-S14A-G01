const inputDate = document.getElementById("reserve_date");
const inputTime = document.getElementById("reserve_time");
const inputRoom = document.getElementById("room_num");

const searchbtn = document.querySelector(".search-btn");

const resultsBox = document.getElementById("availableseats");
const resultstext = document.getElementById("seatsresults");
const seattext = document.getElementById("availableseatstext");

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

function formatDate(date){
    return date.toISOString().split("T")[0];
}

const today = new Date();
const maxDate = new Date();
maxDate.setDate(today.getDate() + 6);

inputDate.min = formatDate(today);
inputDate.max = formatDate(maxDate);
if(!inputDate.value) inputDate.value = formatDate(today);

resultsBox.style.display= "none";

function showavailableseats(){
    const date = inputDate.value
    const timeIn = inputTime.value;
    const room = inputRoom.value;

    resultsBox.style.display = "block";

    const reservations = getReservations();

    if(!date || !timeIn || !room){
        resultstext.textContent = "";
        seattext.textContent = "Please select date, time and room.";
        return;
    }

    const reservedSeats = new Set(reservations.filter(reserved => reserved.date === date && reserved.timeIn === timeIn && reserved.room === room).map(reserved => reserved.seat)); 

    const available = labLayout.filter(seat => !reservedSeats.has(seat));

    resultstext.textContent = 
    `Room: ${room} | Date: ${date} | Time: ${timeIn} | Available: ${available.length}/${labLayout.length}`;

    seattext.textContent = available.length ? available.join(", ") : "No available seats for that schedule.";
}

searchbtn.addEventListener("click", (e) => {
    e.preventDefault();
    showavailableseats();
});
