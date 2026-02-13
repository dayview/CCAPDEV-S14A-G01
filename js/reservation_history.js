// Reservation History JavaScript
// Authentication temporarily disabled for troubleshooting

// Get current user from localStorage
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { idNumber: "12345678", username: "Guest" };

// Display user ID
const userIdDisplay = document.getElementById('userIdDisplay');
if (userIdDisplay && currentUser) {
  userIdDisplay.textContent = currentUser.idNumber || 'N/A';
}

// Get reservations from localStorage
function getReservations() {
  const raw = localStorage.getItem("reservations");
  return raw ? JSON.parse(raw) : [];
}

// Filter reservations by user
function getUserReservations() {
  const allReservations = getReservations();
  return allReservations.filter(res => res.userId === currentUser.idNumber);
}

// Determine if reservation is past or upcoming
function getReservationStatus(reservation) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const resDate = new Date(reservation.date);
  
  if (resDate >= today) {
    return 'Upcoming';
  } else {
    return 'Past';
  }
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

// Render reservations
function renderReservations(filter = 'all') {
  const tbody = document.getElementById('history-body');
  const emptyState = document.querySelector('.empty-state');
  const historyTable = document.querySelector('.history_table');
  
  const userReservations = getUserReservations();
  const { upcoming, past } = categorizeReservations(userReservations);
  
  let reservationsToShow = [];
  
  if (filter === 'upcoming') {
    reservationsToShow = upcoming;
  } else if (filter === 'past') {
    reservationsToShow = past;
  } else {
    reservationsToShow = userReservations;
  }
  
  if (reservationsToShow.length === 0) {
    if (historyTable) historyTable.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (historyTable) historyTable.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';
  
  tbody.innerHTML = '';
  
  reservationsToShow.forEach(res => {
    const row = document.createElement('tr');
    
    // Determine status based on date
    const status = getReservationStatus(res);
    
    // Anonymous is always a boolean, true if reservation.anonymous is true
    const anonymous = res.anonymous ? 'Yes' : 'No';
    
    row.innerHTML = `
      <td>${res.room || 'N/A'}</td>
      <td>${res.seat || 'N/A'}</td>
      <td>${res.date || 'N/A'}</td>
      <td>${res.timeIn || 'N/A'}</td>
      <td>${res.timeOut || 'N/A'}</td>
      <td>${status}</td>
      <td>${anonymous}</td>
    `;
    
    tbody.appendChild(row);
  });
}

// Filter functionality
const filterStatus = document.getElementById('filterStatus');
if (filterStatus) {
  filterStatus.addEventListener('change', function() {
    renderReservations(this.value);
  });
}

// Initial render
renderReservations('all');
