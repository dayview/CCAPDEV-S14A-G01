const noreservation = document.getElementById("noreservation");
const reservationtable = document.getElementById("reservationtable");
const reservationbody = document.getElementById("reservationbody");

const reservationsDataEl = document.getElementById("reservations-data");
const reservations = reservationsDataEl ? JSON.parse(reservationsDataEl.textContent) : [];

function info(value) {
    if (value === null || value === undefined || value === "") return "";
    return `${value}`;
}

function getRoom(reservation) {
    if (reservation.room) return reservation.room;
    if (reservation.slot?.lab?.labName) return reservation.slot.lab.labName;
    if (reservation.slot?.labName) return reservation.slot.labName;
    return "";
}

function getSeat(reservation) {
    if (reservation.seat) return reservation.seat;
    if (reservation.slot?.seat) return reservation.slot.seat;
    if (reservation.slot?.seatNumber) return reservation.slot.seatNumber;
    return "";
}

function getDate(reservation) {
    if (reservation.date) return reservation.date;
    if (reservation.slot?.date) return reservation.slot.date;
    return "";
}

function getTimeIn(reservation) {
    if (reservation.timeIn) return reservation.timeIn;
    if (reservation.slot?.timeIn) return reservation.slot.timeIn;
    return "";
}

function getAnonymous(reservation) {
    return reservation.isAnonymous ? "Yes" : "No";
}

function getStatus(reservation) {
    return reservation.status ? reservation.status : "Confirmed";
}

function renderReservations() {
    reservationbody.innerHTML = "";

    if (!reservations || reservations.length === 0) {
        reservationtable.style.display = "none";
        noreservation.style.display = "block";
        return;
    }

    reservationtable.style.display = "table";
    noreservation.style.display = "none";

    reservations.forEach((reservation) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${info(getDate(reservation))}</td>
            <td>${info(getTimeIn(reservation))}</td>
            <td>${info(getRoom(reservation))}</td>
            <td>${info(getSeat(reservation))}</td>
            <td>${info(getAnonymous(reservation))}</td>
            <td><span class="status">${info(getStatus(reservation))}</span></td>
            <td class="delete">
                <form action="/reservation/delete/${reservation._id}" method="POST" class="delete-form">
                    <button type="submit" class="deletebtn">Delete</button>
                </form>
            </td>
        `;

        reservationbody.appendChild(tr);
    });
}

reservationbody.addEventListener("submit", (e) => {
    const form = e.target.closest(".delete-form");
    if (!form) return;

    const row = form.closest("tr");
    const date = row.children[0]?.textContent?.trim() || "";
    const timeIn = row.children[1]?.textContent?.trim() || "";
    const room = row.children[2]?.textContent?.trim() || "";
    const seat = row.children[3]?.textContent?.trim() || "";

    const final = confirm(
        `Delete this reservation?\n\nDate: ${date}\nTime: ${timeIn}\nRoom: ${room}\nSeat: ${seat}`
    );

    if (!final) {
        e.preventDefault();
    }
});

renderReservations();
