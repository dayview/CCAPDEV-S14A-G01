const rememberUntil = Number(localStorage.getItem("adminRememberUntil"));
const sessionLogin = sessionStorage.getItem("isAdminLoggedIn");
const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));

let authenticated = false;

if (rememberUntil && Date.now() <= rememberUntil) authenticated = true;
else if (sessionLogin === "true") authenticated = true;

if (!authenticated || !currentAdmin) {
  alert("Authentication failed. Please log in as an administrator.");
  localStorage.removeItem("adminRememberUntil");
  localStorage.removeItem("currentAdmin");
  sessionStorage.removeItem("isAdminLoggedIn");
  window.location.href = "index.html";
}

function getReservations() {
  const raw = localStorage.getItem("reservations");
  return raw ? JSON.parse(raw) : [];
}

function validateStudentId(studentId) {
  const users = JSON.parse(localStorage.getItem("userAccounts")) || [];
  return users.find(user => user.idNumber === studentId);
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

let currentStudentId = null;
let currentStudentReservations = [];

function renderReservations(filter = 'all') {
  const historyBody = document.getElementById('history_body');
  const tableContainer = document.getElementById('table_container');
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

const searchButton = document.getElementById('search_btn');
const studentIdInput = document.getElementById('student_id_input');
const studentInfo = document.getElementById('student_info');
const displayStudentId = document.getElementById('displayStudentId');
const errorMessage = document.getElementById('error_message');
const filterSection = document.getElementById('filter_section');
const filterStatus = document.getElementById('filterStatus');

if (searchButton && studentIdInput) {
  searchButton.addEventListener('click', function() {
    const studentId = studentIdInput.value.trim();
    
    studentInfo.style.display = 'none';
    errorMessage.style.display = 'none';
    filterSection.style.display = 'none';
    document.getElementById('table_container').style.display = 'none';
    document.getElementById('noReservations').style.display = 'none';
    
    if (!studentId) {
      alert('Please enter a Student ID');
      return;
    }
    
    if (studentId.length !== 8 || isNaN(studentId)) {
      alert('Please enter a valid 8-digit Student ID');
      return;
    }
    
    const studentExists = validateStudentId(studentId);
    if (!studentExists) {
      errorMessage.style.display = 'block';
      return;
    }
    
    const allReservations = getReservations();
    const studentReservations = allReservations.filter(res => res.userId === studentId);
    
    currentStudentId = studentId;
    currentStudentReservations = studentReservations;
    
    displayStudentId.textContent = studentId;
    studentInfo.style.display = 'block';
    filterSection.style.display = 'flex';
    
    renderReservations('all');
  });
  
  studentIdInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      searchButton.click();
    }
  });
}

if (filterStatus) {
  filterStatus.addEventListener('change', function() {
    renderReservations(this.value);
  });
}
