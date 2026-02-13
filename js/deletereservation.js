if(localStorage.getItem("isLoggedIn") !== "true"){
    window.location.href = "login.html";
}

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser){
    alert("Please sign in before booking");
    window.location.href = "login.html";
}

const noreservation = document.getElementById("noreservation");
const reservationtable = document.getElementById("reservationtable");
const reservationbody = document.getElementById("reservationbody");

function getReservations() {
    const raw = localStorage.getItem("reservations");
    return raw ? JSON.parse(raw) : [];
}

function saveReservations(reservations){
    localStorage.setItem("reservations", JSON.stringify(reservations));
}

function info(value){
    if(value === null || value === undefined) return "";
    return `${value}`; //${value} turns to string 
}

//creates the info about the reservation
function renderReservations(){
    const reservations = getReservations();
    
    const current = reservations.map((r, idx) => ({r, idx})).filter(item => item.r.userId === currentUser.idNumber);

    reservationbody.innerHTML = "";

    if(current.length === 0){
        reservationtable.style.display = "none";
        noreservation.style.display = "block";
        return;
    }

    reservationtable.style.display = "table";
    noreservation.style.display = "none";

    current.forEach(({r, idx}) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td> ${info(r.date)} </td>
        <td> ${info(r.timeIn)} </td>
        <td> ${info(r.room)} </td>
        <td> ${info(r.seat)} </td>
        <td> ${info(r.anonymous ? "Yes" : "No")} </td>
        <td> <span class = "status"> Confirmed</span> </td>
        <td class ="delete">
            <button class = "deletebtn" data-index="${idx}">Delete</button>
        </td>
        `;

        reservationbody.appendChild(tr);
        
    });
}

reservationbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".deletebtn");
    if(!btn) return;

    const index = Number(btn.dataset.index); //read and write the data
    if(Number.isNaN(index)) return; //NaN not a number

    const reservations = getReservations();
    const chosen = reservations[index];

    if(!chosen || chosen.userId !== currentUser.idNumber){
        alert("Cant delete the reservation.");
        return;
    }

    const final = confirm(`Delete this reservation?\n\nDate: ${chosen.date}\nTime: ${chosen.timeIn}\nRoom: ${chosen.room}\nSeat: ${chosen.seat}`);
    if(!final) return;
    
    reservations.splice(index,1);
    saveReservations(reservations);
    renderReservations();
});

renderReservations();

