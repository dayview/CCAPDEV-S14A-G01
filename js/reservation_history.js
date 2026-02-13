// Authentication check
const rememberUntil = Number(localStorage.getItem("rememberUntil"));
const sessionLogin = sessionStorage.getItem("isLoggedIn");
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

let authenticated = false;

if (rememberUntil && Date.now() <= rememberUntil) {
    authenticated = true;
} else if (sessionLogin === "true") {
    authenticated = true;
}

if (!authenticated || !currentUser) {
    localStorage.removeItem("rememberUntil");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("isLoggedIn");
    alert("Please log in to view reservation history.");
    window.location.href = "login.html";
}

// Display user information
document.getElementById("userIdDisplay").textContent = currentUser.idNumber;

// Get all reservations from localStorage
function getReservations() {
    const raw = localStorage.getItem("reservations");
    return raw ? JSON.parse(raw) : [];
}

// Filter reservations by current user's student ID
function getUserReservations() {
    const allReservations = getReservations();
    
    // Filter reservations where userId matches current user's idNumber
    return allReservations.filter(reservation => 
        reservation.userId === currentUser.idNumber
    );
}

// Check if reservation is in the past
function isPastReservation(reservation) {
    const reservationDateTime = new Date(`${reservation.date}T${reservation.timeIn}`);
    const now = new Date();
    return reservationDateTime < now;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format time for display (convert 24h to 12h format)
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Render reservations in table format
function renderReservations(filter = 'all') {
    const userReservations = getUserReservations();
    const tableBody = document.getElementById("history-body");
    const noReservations = document.getElementById("noReservations");
    const tableContainer = document.querySelector(".table_container");

    // Clear previous content
    tableBody.innerHTML = "";

    if (userReservations.length === 0) {
        noReservations.style.display = "block";
        tableContainer.style.display = "none";
        return;
    }

    // Filter based on selection
    let filteredReservations = userReservations;
    if (filter === 'upcoming') {
        filteredReservations = userReservations.filter(r => !isPastReservation(r));
    } else if (filter === 'past') {
        filteredReservations = userReservations.filter(r => isPastReservation(r));
    }

    if (filteredReservations.length === 0) {
        noReservations.style.display = "block";
        tableContainer.style.display = "none";
        
        const noResMsg = noReservations.querySelector("p");
        const noResBtn = noReservations.querySelector(".btn");
        
        if (filter === 'upcoming') {
            noResMsg.textContent = "You have no upcoming reservations.";
            noResBtn.style.display = "inline-block";
        } else if (filter === 'past') {
            noResMsg.textContent = "You have no past reservations.";
            noResBtn.style.display = "none";  // Hide button for past filter
        } else {
            noResMsg.textContent = "You have no reservations yet.";
            noResBtn.style.display = "inline-block";
        }
        
        return;
    }

    noReservations.style.display = "none";
    tableContainer.style.display = "block";

    // Sort reservations by date and time (most recent first)
    filteredReservations.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.timeIn}`);
        const dateB = new Date(`${b.date}T${b.timeIn}`);
        return dateB - dateA;
    });

    // Create table rows
    filteredReservations.forEach(reservation => {
        const isPast = isPastReservation(reservation);
        
        const row = document.createElement("tr");
        row.className = isPast ? 'past-reservation' : '';
        
        row.innerHTML = `
            <td><strong>${reservation.room}</strong></td>
            <td>${reservation.seat}</td>
            <td>${formatDate(reservation.date)}</td>
            <td>${formatTime(reservation.timeIn)}</td>
            <td>${formatTime(reservation.timeOut)}</td>
            <td>
                <span class="status-badge ${isPast ? 'status-past' : 'status-upcoming'}">
                    ${isPast ? 'Past' : 'Upcoming'}
                </span>
            </td>
            <td>
                <span class="${reservation.anonymous ? 'anonymous-yes' : 'anonymous-no'}">
                    ${reservation.anonymous ? '🔒 Yes' : 'No'}
                </span>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Filter event listener
document.getElementById("filterStatus").addEventListener("change", function() {
    renderReservations(this.value);
});

// Initial render
renderReservations();