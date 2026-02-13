// Admin Slot Reservation JavaScript
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

// Show/hide seating charts based on room selection
document.addEventListener('DOMContentLoaded', function() {
  const roomSelect = document.getElementById('roomSelect');
  const dateInput = document.getElementById('dateInput');
  
  // Left panel inputs
  const leftDateInput = document.getElementById('reservationDate');
  const leftRoomInput = document.getElementById('roomNumber');
  
  // Sync right panel date to left panel
  if (dateInput && leftDateInput) {
    dateInput.addEventListener('change', function() {
      leftDateInput.value = this.value;
    });
    
    leftDateInput.addEventListener('change', function() {
      dateInput.value = this.value;
    });
  }
  
  // Sync right panel room to left panel and show seating chart
  if (roomSelect) {
    roomSelect.addEventListener('change', function() {
      const selectedRoom = this.value;
      
      // Sync to left panel
      if (leftRoomInput) {
        leftRoomInput.value = selectedRoom;
      }
      
      // Hide all charts
      document.querySelectorAll('.seating_chart').forEach(chart => {
        chart.style.display = 'none';
      });
      
      // Show selected chart
      if (selectedRoom) {
        const chart = document.getElementById('chart_' + selectedRoom);
        if (chart) {
          chart.style.display = 'block';
        }
      }
    });
  }
  
  // Sync left panel room to right panel
  if (leftRoomInput) {
    leftRoomInput.addEventListener('change', function() {
      const selectedRoom = this.value;
      
      // Sync to right panel
      if (roomSelect) {
        roomSelect.value = selectedRoom;
        
        // Trigger the room change event to show seating chart
        const event = new Event('change');
        roomSelect.dispatchEvent(event);
      }
    });
  }
});