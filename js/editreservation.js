const rememberUntil = Number(localStorage.getItem("rememberUntil"));
const sessionLogin = sessionStorage.getItem("isLoggedIn");
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

let authenticated = false;

if(rememberUntil && Date.now() <= rememberUntil) {
    authenticated = true;
} else if (sessionLogin) {
    authenticated = true;
}

if (!authenticated || !currentUser){
   localStorage.removeItem("rememberUntil");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
}

//information
const infoDate = document.getElementById("infoDate");
const infoTimeIn = document.getElementById("infoTimeIn");
const infoTimeOut = document.getElementById("infoTimeOut");
const infoRoom = document.getElementById("infoRoom");
const infoSeat = document.getElementById("infoSeat");

//inputs
const inputDate = document.getElementById("reserve_date");
const inputTime = document.getElementById("reserve_time");
const inputRoom = document.getElementById("room_num");

const seatMap = document.getElementById("seat_map");
const reserveBtn = document.querySelector(".reserve-btn");

const lab_layout = [
    "A1", "A2", "A3", "A4", "A5",
    "B1", "B2", "B3", "B4", "B5",
    "C1", "C2", "C3", "C4", "C5",
    "D1", "D2", "D3", "D4", "D5"
];

function getReservations() {
    const raw = localStorage.getItem("reservations");
    return raw ? JSON.parse(raw) : [];
}

function saveReservations(reservations){
    localStorage.setItem("reservations", JSON.stringify(reservations));
}


let selectedSeat = null;
let userReservationIndex = -1;
let reservations = getReservations();


for(let i = reservations.length - 1; i >= 0; i--){
    if(reservations[i].userId === currentUser.idNumber){
        userReservationIndex = i;
        break;
    }
}

if(userReservationIndex == -1){
    alert("You have no reservation");
    window.location.href = "reservation.html";
}

const userReservation = reservations[userReservationIndex];

// not touching the date, time and room

inputDate.value = userReservation.date;
inputRoom.value = userReservation.room;
inputTime.value = userReservation.timeIn;

inputDate.disabled = true;
inputRoom.disabled = true;
inputTime.disabled = true;

infoDate.textContent = userReservation.date;
infoTimeIn.textContent = userReservation.timeIn;
infoTimeOut.textContent = userReservation.timeOut;
infoRoom.textContent = userReservation.room;
infoSeat.textContent = userReservation.seat;


function renderSeats(){
    seatMap.innerHTML = "";
    reserveBtn.disabled = true;
    selectedSeat = null;    

const reservedSeats = reservations.filter(same => same.room === userReservation.room && same.date === userReservation.date && same.timeIn === userReservation.timeIn);

lab_layout.forEach(seatId => {
    const btn = document.createElement("button");
    btn.textContent = seatId;
    btn.classList.add("seat");
    const seatTaken = reservedSeats.find(same => same.seat === seatId);

    //other person that booked it
    if(seatTaken && seatTaken.userId != currentUser.idNumber){
        btn.classList.add("reserved");
        btn.disabled = true;
        seatMap.appendChild(btn);
        return;
    }

    //current users seat
    if (seatId === userReservation.seat) {
        btn.classList.add("selected");
        selectedSeat = seatId;
        reserveBtn.disabled = false;
    }

    btn.addEventListener("click", () =>{
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

renderSeats();


//saving the new reservation
reserveBtn.addEventListener("click", () => {
    if(!selectedSeat) return;
    reservations[userReservationIndex].seat = selectedSeat;
    saveReservations(reservations);

    alert("Reservation is now updated!");
    window.location.href = "user_profile.html";
});


