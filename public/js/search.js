const inputDate = document.getElementById("reserve_date");
const inputTime = document.getElementById("reserve_time");
const inputRoom = document.getElementById("room_num");

const searchbtn = document.querySelector(".search-btn");

const resultsBox = document.getElementById("availableseats");
const resultstext = document.getElementById("seatsresults");
const seattext = document.getElementById("availableseatstext");

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

if (inputDate) {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 6);

    inputDate.min = formatDate(today);
    inputDate.max = formatDate(maxDate);

    if (!inputDate.value) {
        inputDate.value = formatDate(today);
    }
}

if (resultsBox) {
    resultsBox.style.display = "none";
}

async function showAvailableSeats() {
    const date = inputDate?.value;
    const time = inputTime?.value;
    const room = inputRoom?.value;

    if (!resultsBox || !resultstext || !seattext) return;

    resultsBox.style.display = "block";

    if (!date || !time || !room) {
        resultstext.textContent = "";
        seattext.textContent = "Please select date, time, and room.";
        return;
    }

    try {
        const response = await fetch(
            `/reservation/search-availability?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&room=${encodeURIComponent(room)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to load available seats.");
        }

        const availableSeats = data.availableSeats || [];

        resultstext.textContent =
            `Room: ${room} | Date: ${date} | Time: ${time} | Available: ${availableSeats.length}/20`;

        seattext.textContent =
            availableSeats.length > 0
                ? availableSeats.join(", ")
                : "No available seats for that schedule.";
    } catch (err) {
        console.error("Search error:", err);
        resultstext.textContent = "";
        seattext.textContent = err.message || "Could not fetch seat availability.";
    }
}

if (searchbtn) {
    searchbtn.addEventListener("click", (e) => {
        e.preventDefault();
        showAvailableSeats();
    });
}