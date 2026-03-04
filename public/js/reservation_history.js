const rememberUntil = Number(localStorage.getItem("rememberUntil"));
const sessionLogin = sessionStorage.getItem("isLoggedIn");
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

let authenticated = false;

if (rememberUntil && Date.now() <= rememberUntil) authenticated = true;
else if (sessionLogin === "true") authenticated = true;

if (!authenticated || !currentUser) {
  alert("You must be logged in to view this page.");
  localStorage.removeItem("rememberUntil");
  localStorage.removeItem("currentUser");
  sessionStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
}

const userIdDisplay = document.getElementById('userIdDisplay');
if (userIdDisplay && currentUser) {
  userIdDisplay.textContent = currentUser.idNumber || 'N/A';
}

function getReservations() {
  const raw = localStorage.getItem("reservations");
  return raw ? JSON.parse(raw) : [];
}

function getUserReservations() {
  const allReservations = getReservations();
  return allReservations.filter(res => res.userId === currentUser.idNumber);
}

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

function renderReservations(filter = 'all') {
  const tbody = document.getElementById('history_body');
  const noReservationsEl = document.getElementById('noReservations');
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
    if (noReservationsEl) noReservationsEl.style.display = 'block';
    return;
  }
  
  if (historyTable) historyTable.style.display = 'table';
  if (noReservationsEl) noReservationsEl.style.display = 'none';
  
  tbody.innerHTML = '';
  
  reservationsToShow.forEach(res => {
    const row = document.createElement('tr');
    
    const status = getReservationStatus(res);
    
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

const filterStatus = document.getElementById('filterStatus');
if (filterStatus) {
  filterStatus.addEventListener('change', function() {
    renderReservations(this.value);
  });
}

renderReservations('all');