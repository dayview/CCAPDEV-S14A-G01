const rememberUntil = Number(localStorage.getItem("adminRememberUntil"));
const sessionLogin = sessionStorage.getItem("isAdminLoggedIn");
const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));

let authenticated = false;

if (rememberUntil && Date.now() <= rememberUntil) authenticated = true;
else if (sessionLogin === "true") authenticated = true;

if (!authenticated || !currentAdmin) {
  alert("You are not logged in or your session has expired. Please log in again.");
  localStorage.removeItem("adminRememberUntil");
  localStorage.removeItem("currentAdmin");
  sessionStorage.removeItem("isAdminLoggedIn");
  window.location.href = "index.html";
}

// Get all reservations from localStorage
function getReservations() {
    const raw = localStorage.getItem("reservations");
    return raw ? JSON.parse(raw) : [];
}

// Get all user accounts from localStorage
function getUserAccounts() {
    const raw = localStorage.getItem("userAccounts");
    return raw ? JSON.parse(raw) : [];
}

// Validate if Student ID exists in the system
function validateStudentId(studentId) {
    // Only check localStorage userAccounts
    const users = getUserAccounts();
    return users.find(user => user.idNumber === studentId);
}

// Get reservations for a specific student ID
function getStudentReservations(studentId) {
    const allReservations = getReservations();
    return allReservations.filter(reservation => reservation.userId === studentId);
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

// Status class mapping
const statusClasses = {
    0: 'status_available',
    1: 'status_class',
    2: 'status_full',
    3: 'status_unavailable'
};

// Global variable to store current student ID being viewed
let currentSearchedStudentId = null;

// Render reservations in table format
function renderReservations(studentId, filter = 'all') {
    const studentReservations = getStudentReservations(studentId);
    const tableBody = document.getElementById("history-body");
    const noReservations = document.getElementById("noReservations");
    const tableContainer = document.getElementById("table-container");
    const filterSection = document.getElementById("filter-section");

    // Clear previous content
    tableBody.innerHTML = "";

    if (studentReservations.length === 0) {
        noReservations.style.display = "block";
        tableContainer.style.display = "none";
        filterSection.style.display = "none";
        return;
    }

    // Show filter and table
    filterSection.style.display = "flex";

    // Filter based on selection
    let filteredReservations = studentReservations;
    if (filter === 'upcoming') {
        filteredReservations = studentReservations.filter(r => !isPastReservation(r));
    } else if (filter === 'past') {
        filteredReservations = studentReservations.filter(r => isPastReservation(r));
    }

    if (filteredReservations.length === 0) {
        noReservations.style.display = "block";
        const noResMsg = noReservations.querySelector("p");
        
        if (filter === 'upcoming') {
            noResMsg.textContent = "This student has no upcoming reservations.";
        } else if (filter === 'past') {
            noResMsg.textContent = "This student has no past reservations.";
        }
        
        tableContainer.style.display = "none";
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

// Handle search button click
document.getElementById("search-btn").addEventListener("click", function() {
    const studentIdInput = document.getElementById("student-id-input");
    const studentId = studentIdInput.value.trim();
    
    console.log('Searching for Student ID:', studentId);
    
    // Hide all result sections
    document.getElementById("student-info").style.display = "none";
    document.getElementById("error-message").style.display = "none";
    document.getElementById("table-container").style.display = "none";
    document.getElementById("noReservations").style.display = "none";
    document.getElementById("filter-section").style.display = "none";
    
    // Validate input
    if (!studentId) {
        return;
    }
    
    // Check if Student ID is 8 digits
    if (studentId.length !== 8 || isNaN(studentId)) {
        document.getElementById("error-message").style.display = "block";
        document.getElementById("error-message").querySelector("p").textContent = 
            "⚠️ Please enter a valid 8-digit Student ID.";
        return;
    }
    
    // Validate if Student ID exists
    const student = validateStudentId(studentId);
    console.log('Student found:', student);
    
    if (!student) {
        document.getElementById("error-message").style.display = "block";
        document.getElementById("error-message").querySelector("p").textContent = 
            "⚠️ Student ID not registered in the system.";
        return;
    }
    
    // Check reservations
    const allReservations = getReservations();
    console.log('All reservations in system:', allReservations);
    
    const studentReservations = getStudentReservations(studentId);
    console.log('Reservations for this student:', studentReservations);
    
    // Student ID is valid - display student info
    currentSearchedStudentId = studentId;
    document.getElementById("student-info").style.display = "block";
    document.getElementById("displayStudentId").textContent = student.idNumber || studentId;
    
    // Render reservations
    renderReservations(studentId, 'all');
});

// Handle Enter key in input field
document.getElementById("student-id-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        document.getElementById("search-btn").click();
    }
});

// Filter event listener
document.getElementById("filterStatus").addEventListener("change", function() {
    if (currentSearchedStudentId) {
        renderReservations(currentSearchedStudentId, this.value);
    }
});