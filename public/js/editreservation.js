const infoDate = document.getElementById("infoDate");
const infoTimeIn = document.getElementById("infoTimeIn");
const infoTimeOut = document.getElementById("infoTimeOut");
const infoRoom = document.getElementById("infoRoom");
const infoSeat = document.getElementById("infoSeat");

const inputDate = document.getElementById("reserve_date");
const inputTime = document.getElementById("reserve_time");
const reservationSelect = document.getElementById("reservationSelect");
const editForm = document.getElementById("editReservation");
const submitBtn = document.querySelector(".reserve-btn");

const today = new Date();
const maxDate = new Date();
maxDate.setDate(today.getDate() + 6);

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

if (inputDate) {
    inputDate.min = formatDate(today);
    inputDate.max = formatDate(maxDate);
}

function updateInfoPanel() {
    const selectedOpt = reservationSelect.options[reservationSelect.selectedIndex];
    
    if (selectedOpt && selectedOpt.value) {
        infoRoom.textContent = selectedOpt.getAttribute("data-room") || "--";
        infoSeat.textContent = selectedOpt.getAttribute("data-seat") || "--";
    } else {
        infoRoom.textContent = "--";
        infoSeat.textContent = "--";
    }

    infoDate.textContent = inputDate.value || "--";
    infoTimeIn.textContent = inputTime.value || "--";

    if (inputTime.value) {
        const [hours, minutes] = inputTime.value.split(":").map(Number);
        const d = new Date();
        d.setHours(hours, minutes + 30);
        infoTimeOut.textContent = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } else {
        infoTimeOut.textContent = "--";
    }
}

async function checkAvailability() {
    const selectedOpt = reservationSelect.options[reservationSelect.selectedIndex];
    if (!selectedOpt || !selectedOpt.value) return;

    const room = selectedOpt.getAttribute("data-room");
    const seat = Number(selectedOpt.getAttribute("data-seat"));
    
    let rawDate = selectedOpt.getAttribute("data-date");
    const originalDate = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
    const originalTime = selectedOpt.getAttribute("data-timein");

    const newDate = inputDate.value;
    const newTime = inputTime.value;

    
    if (newDate === originalDate && newTime === originalTime) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Save Changes";
            submitBtn.style.backgroundColor = ""; 
        }
        return;
    }

    if (!newDate || !newTime || !room) return;

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Checking...";
    }

    try {
        const params = new URLSearchParams({ date: newDate, time: newTime, room: room });
        const response = await fetch(`/reservation/search-availability?${params.toString()}`);
        const data = await response.json();
        
        const occupiedSeats = Array.isArray(data.occupiedSeats) ? data.occupiedSeats : [];
        
        if (occupiedSeats.includes(seat)) {
            const seatInfo = data.occupiedSeatDetails.find(s => Number(s.seatNum) === seat);
            const booker = seatInfo ? seatInfo.reservedBy : "someone else";
            
            
            alert(`Seat ${seat} in ${room} is already booked on this date and time by ${booker}. Please change the time/date.`);
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Slot Taken";
                submitBtn.style.backgroundColor = "#dc3545"; 
            }
        } else {
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Save Changes";
                submitBtn.style.backgroundColor = ""; 
            }
        }
    } catch (err) {
        console.error("Error checking availability:", err);
    }
}


reservationSelect?.addEventListener("change", (e) => {
    const selectedOpt = e.target.options[e.target.selectedIndex];
    
    if (selectedOpt && selectedOpt.value) {
        let rawDate = selectedOpt.getAttribute("data-date");
        inputDate.value = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
        inputTime.value = selectedOpt.getAttribute("data-timein");
        editForm.action = `/reservation/edit/${selectedOpt.value}`;
        
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Save Changes";
            submitBtn.style.backgroundColor = "";
        }
    } else {
        inputDate.value = "";
        inputTime.value = "";
        editForm.action = "";
        if (submitBtn) submitBtn.disabled = true;
    }
    
    updateInfoPanel();
});

inputDate?.addEventListener("input", () => {
    updateInfoPanel();
    checkAvailability();
});
inputTime?.addEventListener("change", () => {
    updateInfoPanel();
    checkAvailability();
});

updateInfoPanel();