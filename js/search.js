if(localStorage.getItem("isLoggedIn") !== "true"){
    window.location.href = "login.html";
}

const inputDate = document.getElementById("reserve_date");
const inputTime = document.getElementById("reserve_time");
const inputRoom = document.getElementById("room_num");

const searchbtn = document.querySelector(".search-btn");

const resultsBox = document.getElementById("availableseats");
const resultstext = document.getElementById("seatsresults");
const seattext = document.getElementById("availableseatstext");

const lab_layout = [
  "A1","A2","A3","A4","A5",
  "B1","B2","B3","B4","B5",
  "C1","C2","C3","C4","C5",
  "D1","D2","D3","D4","D5"
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

    const available = lab_layout.filter(seat => !reservedSeats.has(seat));

    resultstext.textContent = 
    `Room: ${room} 
     Date: ${date} 
     Time: ${timeIn}
     Available: ${available.length}/${lab_layout.length}`;

    seattext.textContent = available.length ? available.join(", ") : "No available seats for that schedule.";
}

searchbtn.addEventListener("click", (e) => {
    e.preventDefault();
    showavailableseats();
});
