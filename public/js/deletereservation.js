const noreservation = document.getElementById("noreservation");
const reservationtable = document.getElementById("reservationtable");
const reservationbody = document.getElementById("reservationbody");


if (reservationbody) {
    reservationbody.addEventListener("submit", (e) => {
        const form = e.target.closest("form");
        if (!form) return;

        const row = form.closest("tr");
        if (!row) return;
        
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
}


if (reservationtable && noreservation) {
    const hasRows = reservationbody && reservationbody.children.length > 0;
    reservationtable.style.display = hasRows ? "table" : "none";
    noreservation.style.display = hasRows ? "none" : "block";
}