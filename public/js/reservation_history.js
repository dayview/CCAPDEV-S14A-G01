const filterStatus = document.getElementById('filterStatus');
const rows = document.querySelectorAll('#history_body tr');
const noReservationsEl = document.getElementById('noReservations');
const historyTable = document.querySelector('.history_table');

function updateVisibility() {
    let visibleCount = 0;

    rows.forEach(row => {
        if (row.style.display !== 'none') {
            visibleCount++;
        }
    });

    if (visibleCount === 0) {
        historyTable.style.display = 'none';
        noReservationsEl.style.display = 'block';
    } else {
        historyTable.style.display = 'table';
        noReservationsEl.style.display = 'none';
    }
}

filterStatus.addEventListener('change', function () {
    const selected = this.value.toLowerCase();

    rows.forEach(row => {
        const statusCell = row.querySelector('.status-cell');
        const status = statusCell ? statusCell.textContent.trim().toLowerCase() : '';

        if (selected === 'all' || status === selected) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    updateVisibility();
});

updateVisibility();