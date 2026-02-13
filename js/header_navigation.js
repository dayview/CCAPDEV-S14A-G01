// Header Navigation Handler
// This script handles dynamic navigation based on user type

document.addEventListener('DOMContentLoaded', function() {
  // Get the Reservation History link in the header
  const reservationHistoryLink = document.querySelector('.top_right a[href="#"]');
  
  if (reservationHistoryLink && reservationHistoryLink.textContent.trim() === 'Reservation History') {
    // Check if user is admin or student
    const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));
    const currentStudent = JSON.parse(localStorage.getItem("currentStudent"));
    
    if (currentAdmin) {
      // Admin user - redirect to admin_reservation.html
      reservationHistoryLink.href = "admin_reservation.html";
    } else if (currentStudent) {
      // Student user - redirect to student_reservation.html
      reservationHistoryLink.href = "student_reservation.html";
    } else {
      // Fallback - check if we're on an admin page
      const isAdminPage = window.location.pathname.includes('admin_');
      if (isAdminPage) {
        reservationHistoryLink.href = "admin_reservation.html";
      } else {
        reservationHistoryLink.href = "student_reservation.html";
      }
    }
  }
});
