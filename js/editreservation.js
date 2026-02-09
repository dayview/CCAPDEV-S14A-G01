if(localStorage.getItem("isLoggedIn") !== "true"){
    window.location.href = "login.html";
}

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser){
    alert("Please sign in before booking");
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

function formatDate(date){
    return date.toISOString().split("T")[0];
}

function formatTime(time){
    return(time.getHours().toString().padStart(2,"0") + ":" + time.getMinutes().toString().padStart(2,"0"));
}

const today = new Date();
const maxDate = new Date();
maxDate.setDate(today.getDate() + 6);

inputDate.min = formatDate(today);
inputDate.max = formatDate(maxDate);


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


inputDate.value = userReservation.date;
inputRoom.value = userReservation.room;
inputTime.value = userReservation.timeIn;

infoDate.textContent = inputDate.value;
infoRoom.textContent = inputRoom.value;
infoSeat.textContent = userReservation.seat || "--";

(function initTimeinfo(){
    if(!inputTime.value){
        infoTimeIn.textContent = "--";
        infoTimeOut.textContent = "--";
        return;
    }
    
    const [hours, minutes] = inputTime.value.split(":").map(Number);
    const timeIn = new Date();
    timeIn.setHours(hours);
    timeIn.setMinutes(minutes);
    
    const timeOut = new Date(timeIn);
    timeOut.setMinutes(timeOut.getMinutes() + 30);

    infoTimeIn.textContent = formatTime(timeIn);
    infoTimeOut.textContent = formatTime(timeOut);
})();


function renderSeats(){
    reservations = getReservations();
    seatMap.innerHTML = "";
    reserveBtn.disabled = true;
    

    const date = inputDate.value;
    const time = inputTime.value;
    const room = inputRoom.value;

    const slot = date === userReservation.date && time === userReservation.timeIn && room === userReservation.room;

    if(!slot){
        selectedSeat = null;
        infoSeat.textContent = "--";
    }else {
        selectedSeat = userReservation.seat;
        infoSeat.textContent = selectedSeat || "--";
        if(selectedSeat) reserveBtn.disabled = false;
    }

const reservedSeats = reservations.filter((same, idx) => idx !== userReservationIndex && same.room === room && same.date === date && same.timeIn === time);

lab_layout.forEach(seatId => {
    const btn = document.createElement("button");
    btn.textContent = seatId;
    btn.classList.add("seat");
    const seatTaken = reservedSeats.find(same => same.seat === seatId);

    //other person that booked it
    if(seatTaken){
        btn.classList.add("reserved");
        btn.disabled = true;
        seatMap.appendChild(btn);
        return;
    }

    //current users seat
    if (slot && seatId === userReservation.seat) {
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

inputDate.addEventListener("input", () => {
    infoDate.textContent = inputDate.value;
});

inputDate.addEventListener("change", () => {
    infoDate.textContent = inputDate.value;
    renderSeats();
});

inputRoom.addEventListener("change",() => {
    infoRoom.textContent = inputRoom.value;
    renderSeats();
});

inputTime.addEventListener("change",() =>{
    const [hours, minutes] = inputTime.value.split(":").map(Number);
    const timeIn = new Date();
    timeIn.setHours(hours);
    timeIn.setMinutes(minutes);

    const timeOut = new Date(timeIn);
    timeOut.setMinutes(timeOut.getMinutes() + 30);
    
    infoTimeIn.textContent = formatTime(timeIn);
    infoTimeOut.textContent = formatTime(timeOut);

    renderSeats();
})


//save reservation

reserveBtn.addEventListener("click", () => {
    reservations = getReservations();

    if(!selectedSeat){
        alert("Please select a seat before editing");
        return;
    }

    //checker of conflict
    const conflict = reservations.some((same,idx) => idx !== userReservationIndex && same.room === inputRoom.value && same.date === inputDate.value && same.timeIn === inputTime.value && same.seat === selectedSeat);

    if(conflict){
        alert("Seat already booked");
        return;
    }

    reservations[userReservationIndex].date = inputDate.value;
    reservations[userReservationIndex].timeIn = inputTime.value;
    reservations[userReservationIndex].timeOut = infoTimeOut.textContent;
    reservations[userReservationIndex].room = inputRoom.value;
    reservations[userReservationIndex].seat = selectedSeat;


    userReservation.date = inputDate.value;
    userReservation.timeIn = inputTime.value;
    userReservation.timeOut = infoTimeOut.textContent;
    userReservation.room = inputRoom.value;
    userReservation.seat = selectedSeat;
    
    saveReservations(reservations);

    alert("Reservation is updated! Please check your booking");
    window.location.href = "user_profile.html";
})

