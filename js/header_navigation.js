function adminLogout() {
  localStorage.removeItem("currentAdmin");
  localStorage.removeItem("adminRememberUntil");
  sessionStorage.removeItem("isAdminLoggedIn");
}

function studentLogout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("rememberUntil");
  sessionStorage.removeItem("isLoggedIn");
}

document.addEventListener('DOMContentLoaded', function() {
  const reservationHistoryLink = document.querySelector('.top_right a[href="#"]');
  
  if (reservationHistoryLink && reservationHistoryLink.textContent.trim() === 'Reservation History') {
    const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));
    const currentStudent = JSON.parse(localStorage.getItem("currentStudent"));
    
    if (currentAdmin) {
      reservationHistoryLink.href = "admin_reservation.html";
    } else if (currentStudent) {
      reservationHistoryLink.href = "student_reservation.html";
    } else {
      const isAdminPage = window.location.pathname.includes('admin_');
      if (isAdminPage) {
        reservationHistoryLink.href = "admin_reservation.html";
      } else {
        reservationHistoryLink.href = "student_reservation.html";
      }
    }
  }
  
  const logoutButton = document.querySelector('.logout_button');
  
  if (logoutButton) {
    logoutButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      const isAdminPage = window.location.pathname.includes('admin_');
      
      if (isAdminPage) {
        adminLogout();
        window.location.replace("index.html");
      } else {
        studentLogout();
        window.location.replace("index.html");
      }
    });
  }
});
