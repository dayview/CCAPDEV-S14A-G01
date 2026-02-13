// Admin Reservation History JavaScript
// Authentication temporarily disabled for troubleshooting

console.log("Admin Reservation History loaded");

// Get reservations from localStorage
function getReservations() {
  const raw = localStorage.getItem("reservations");
  return raw ? JSON.parse(raw) : [];
}

// Check if student exists in userAccounts
function validateStudentId(studentId) {
  const users = JSON.parse(localStorage.getItem("userAccounts")) || [];
  return users.find(user => user.idNumber === studentId);
}

// Categorize reservations as upcoming or past
function categorizeReservations(reservations) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const upcoming = [];
  const past = [];
  
  reservations.forEach(res => {
    const resDate = new Date(res.date);
    if (resDate >= today) {
      upcoming.push(res);
    } else {
      past.push(res);
    }
  });
  
  return { upcoming, past };
}

// Current student being viewed
let currentStudentId = null;
let currentStudentReservations = [];

// Render reservations based on filter
function renderReservations(filter = 'all') {
  const historyBody = document.getElementById('history-body');
  const tableContainer = document.getElementById('table-container');
  const noReservations = document.getElementById('noReservations');
  
  if (!currentStudentReservations || currentStudentReservations.length === 0) {
    tableContainer.style.display = 'none';
    noReservations.style.display = 'block';
    return;
  }
  
  const { upcoming, past } = categorizeReservations(currentStudentReservations);
  
  let reservationsToShow = [];
  
  if (filter === 'upcoming') {
    reservationsToShow = upcoming;
  } else if (filter === 'past') {
    reservationsToShow = past;
  } else {
    reservationsToShow = currentStudentReservations;
  }
  
  historyBody.innerHTML = '';
  
  if (reservationsToShow.length === 0) {
    tableContainer.style.display = 'none';
    noReservations.style.display = 'block';
    noReservations.innerHTML = `<p>No ${filter === 'all' ? '' : filter} reservations found for this student.</p>`;
    return;
  }
  
  tableContainer.style.display = 'block';
  noReservations.style.display = 'none';
  
  reservationsToShow.forEach(res => {
    const resDate = new Date(res.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let status = 'Upcoming';
    if (resDate < today) {
      status = 'Past';
    } else if (resDate.getTime() === today.getTime()) {
      status = 'Today';
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${res.room || 'N/A'}</td>
      <td>${res.seat || 'N/A'}</td>
      <td>${res.date || 'N/A'}</td>
      <td>${res.timeIn || 'N/A'}</td>
      <td>${res.timeOut || 'N/A'}</td>
      <td>${status}</td>
      <td>${res.anonymous ? 'Yes' : 'No'}</td>
    `;
    historyBody.appendChild(row);
  });
}

// Search functionality
const searchButton = document.getElementById('search-btn');
const studentIdInput = document.getElementById('student-id-input');
const studentInfo = document.getElementById('student-info');
const displayStudentId = document.getElementById('displayStudentId');
const errorMessage = document.getElementById('error-message');
const filterSection = document.getElementById('filter-section');
const filterStatus = document.getElementById('filterStatus');

if (searchButton && studentIdInput) {
  searchButton.addEventListener('click', function() {
    const studentId = studentIdInput.value.trim();
    
    // Reset displays
    studentInfo.style.display = 'none';
    errorMessage.style.display = 'none';
    filterSection.style.display = 'none';
    document.getElementById('table-container').style.display = 'none';
    document.getElementById('noReservations').style.display = 'none';
    
    if (!studentId) {
      alert('Please enter a Student ID');
      return;
    }
    
    if (studentId.length !== 8 || isNaN(studentId)) {
      alert('Please enter a valid 8-digit Student ID');
      return;
    }
    
    // Validate student exists
    const studentExists = validateStudentId(studentId);
    if (!studentExists) {
      errorMessage.style.display = 'block';
      return;
    }
    
    // Get all reservations and filter by student
    const allReservations = getReservations();
    const studentReservations = allReservations.filter(res => res.userId === studentId);
    
    // Store current student data
    currentStudentId = studentId;
    currentStudentReservations = studentReservations;
    
    // Display student info
    displayStudentId.textContent = studentId;
    studentInfo.style.display = 'block';
    filterSection.style.display = 'flex';
    
    // Render reservations
    renderReservations('all');
  });
  
  // Allow Enter key to search
  studentIdInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      searchButton.click();
    }
  });
}

// Filter functionality
if (filterStatus) {
  filterStatus.addEventListener('change', function() {
    renderReservations(this.value);
  });
}
