/* ---------- HARD-CODED DATA ---------- */

const reservationHistory = [
  {
    lab: "Lab G301",
    seat: "PC-12",
    dateReserved: "2026-01-15 09:10",
    slot: "Jan 20, 10:00–11:00",
    anonymous: false
  },
  {
    lab: "Lab G304",
    seat: "PC-03",
    dateReserved: "2026-01-10 14:32",
    slot: "Jan 22, 13:00–13:30",
    anonymous: true
  }
];

/* ---------- RESERVATION HISTORY ---------- */

function loadHistory(data = reservationHistory) {
  const tbody = document.getElementById("history-body");
  if (!tbody) return;

  // Clear existing rows
  tbody.innerHTML = "";

  // If no data, show empty message
  if (data.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="5" class="empty_message">No reservations found.</td>
    `;
    tbody.appendChild(emptyRow);
    return;
  }

  // Populate table with reservation data
  data.forEach(r => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${r.lab}</td>
      <td>${r.seat}</td>
      <td>${r.slot}</td>
      <td>${r.dateReserved}</td>
      <td>${r.anonymous ? "Yes" : "No"}</td>
    `;

    tbody.appendChild(row);
  });
}

/* ---------- SEARCH FUNCTIONALITY (Admin Only) ---------- */

function searchStudentHistory() {
  const input = document.getElementById("student-id-input");
  if (!input) return;

  const studentId = input.value.trim();

  // Validate 8-digit student ID
  if (studentId.length !== 8 || !/^\d{8}$/.test(studentId)) {
    alert("Please enter a valid 8-digit Student ID.");
    return;
  }

  // TODO: Replace with actual API call to fetch student's reservation history
  // For now, using hard-coded data as placeholder
  console.log("Searching for student ID:", studentId);
  
  // Simulate loading student's history
  loadHistory(reservationHistory);
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Check if search button exists (admin page)
  const searchButton = document.querySelector(".search_button");
  
  if (searchButton) {
    // Admin page: Don't load history automatically, wait for search
    searchButton.addEventListener("click", searchStudentHistory);
    
    // Allow Enter key to trigger search
    const input = document.getElementById("student-id-input");
    if (input) {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          searchStudentHistory();
        }
      });
    }
  } else {
    // Student page: Load history automatically on page load
    loadHistory();
  }
});