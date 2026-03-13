const searchButton = document.getElementById('search_btn');
const studentIdInput = document.getElementById('student_id_input');
const studentInfo = document.getElementById('student_info');
const displayStudentId = document.getElementById('displayStudentId');
const errorMessage = document.getElementById('error_message');
const filterSection = document.getElementById('filter_section');
const tableContainer = document.getElementById('table_container');
const historyBody = document.getElementById('history_body');
const noReservations = document.getElementById('noReservations');
const filterStatus = document.getElementById('filterStatus');

let allReservations = [];

function categorize(res) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(res.slot.date) >= today ? 'upcoming' : 'past';
}

function renderReservations(filter = 'all') {
    const filtered = filter === 'all'
        ? allReservations
        : allReservations.filter(r => categorize(r) === filter);

    historyBody.innerHTML = '';

    if (filtered.length === 0) {
        tableContainer.style.display = 'none';
        noReservations.style.display = 'block';
        noReservations.innerHTML = `<p>No ${filter === 'all' ? '' : filter} reservations found for this student.</p>`;
        return;
    }

    tableContainer.style.display = 'block';
    noReservations.style.display = 'none';

    filtered.forEach(res => {
        const row = document.createElement('tr');
        const date = new Date(res.slot.date).toLocaleDateString();
        row.innerHTML = `
            <td>${res.slot.lab ? res.slot.lab.labName : 'N/A'}</td>
            <td>${res.slot.seatNum}</td>
            <td>${date}</td>
            <td>${res.slot.startTime}</td>
            <td>${res.slot.endTime}</td>
            <td>${res.status}</td>
            <td>${res.isAnonymous ? 'Yes' : 'No'}</td>
        `;
        historyBody.appendChild(row);
    });
}

async function searchStudent() {
    const idNum = studentIdInput.value.trim();

    studentInfo.style.display = 'none';
    errorMessage.style.display = 'none';
    filterSection.style.display = 'none';
    tableContainer.style.display = 'none';
    noReservations.style.display = 'none';

    if (!idNum) {
        alert('Please enter a Student ID');
        return;
    }

    if (idNum.length !== 8 || isNaN(idNum)) {
        alert('Please enter a valid 8-digit Student ID');
        return;
    }

    try {
        const res = await fetch(`/admin/student-reservations/search?idNum=${encodeURIComponent(idNum)}`);
        const html = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Check if the server returned notFound
        const rows = doc.querySelectorAll('#history_body tr');
        const notFound = doc.getElementById('error_message') &&
            doc.getElementById('error_message').style.display !== 'none';

        if (notFound) {
            errorMessage.style.display = 'block';
            return;
        }

        // Fetch as JSON instead for cleaner data handling
        const jsonRes = await fetch(`/admin/student-reservations/search?idNum=${encodeURIComponent(idNum)}`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!jsonRes.ok) throw new Error('Server error');
        const data = await jsonRes.json();

        if (data.notFound) {
            errorMessage.style.display = 'block';
            return;
        }

        allReservations = data.reservations || [];
        displayStudentId.textContent = idNum;
        studentInfo.style.display = 'block';
        filterSection.style.display = 'flex';
        renderReservations('all');

    } catch (err) {
        console.error('Search error:', err);
        alert('Something went wrong. Please try again.');
    }
}

searchButton.addEventListener('click', searchStudent);
studentIdInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') searchStudent();
});
filterStatus.addEventListener('change', function () {
    renderReservations(this.value);
});