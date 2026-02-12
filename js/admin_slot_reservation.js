// Admin Slot Reservation JavaScript

// Show/hide seating charts based on room selection
document.addEventListener('DOMContentLoaded', function() {
  const roomSelect = document.getElementById('roomSelect');
  
  if (roomSelect) {
    roomSelect.addEventListener('change', function() {
      const selectedRoom = this.value;
      
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
});