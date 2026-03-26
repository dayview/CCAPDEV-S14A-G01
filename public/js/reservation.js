document.addEventListener("DOMContentLoaded", () => {
    const infoDate = document.getElementById("infoDate");
    const infoTimeIn = document.getElementById("infoTimeIn");
    const infoTimeOut = document.getElementById("infoTimeOut");
    const infoRoom = document.getElementById("infoRoom");
    const infoSeat = document.getElementById("infoSeat");

    const inputDate = document.getElementById("reserve_date");
    const inputTime = document.getElementById("reserve_time");
    const inputRoom = document.getElementById("room_num");

    const reserveBtn = document.querySelector(".reserve-btn");
    const seatMap = document.getElementById("seat_map");
    const reservationForm = document.getElementById("reservationForm");

    const hiddenLab = document.getElementById("hiddenLab");
    const hiddenDate = document.getElementById("hiddenDate");
    const hiddenTimeIn = document.getElementById("hiddenTimeIn");
    const hiddenTimeOut = document.getElementById("hiddenTimeOut");
    const hiddenSeat = document.getElementById("hiddenSeat");

    let selectedSeat = null;

    function formatDate(date) {
        return date.toISOString().split("T")[0];
    }

    function formatTime(time) {
        return (
            time.getHours().toString().padStart(2, "0") +
            ":" +
            time.getMinutes().toString().padStart(2, "0")
        );
    }

    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 6);

    if (inputDate) {
        inputDate.min = formatDate(today);
        inputDate.max = formatDate(maxDate);
        inputDate.value = formatDate(today);
        infoDate.textContent = inputDate.value;
    }

    function updateTimeInfo() {
        if (!inputTime || !inputTime.value) return;

        const [hours, minutes] = inputTime.value.split(":").map(Number);

        const timeIn = new Date();
        timeIn.setHours(hours);
        timeIn.setMinutes(minutes);
        timeIn.setSeconds(0);
        timeIn.setMilliseconds(0);

        const timeOut = new Date(timeIn);
        timeOut.setMinutes(timeOut.getMinutes() + 30);

        infoTimeIn.textContent = formatTime(timeIn);
        infoTimeOut.textContent = formatTime(timeOut);
    }

    function clearSelection() {
        selectedSeat = null;
        infoSeat.textContent = "--";
        if (reserveBtn && reserveBtn.tagName === "BUTTON") reserveBtn.disabled = true;
        if (hiddenSeat) hiddenSeat.value = "";
    }

    async function renderSeats() {

        if (!seatMap) return;

        seatMap.innerHTML = "";
        clearSelection();

        if (!inputRoom.value || !inputDate.value || !inputTime.value) {
            return;
        }

        try {
            const params = new URLSearchParams({
                date: inputDate.value,
                time: inputTime.value,
                room: inputRoom.value
            });

            const res = await fetch(`/reservation/search-availability?${params.toString()}`);
            const data = await res.json();
            const capacity = data.capacity | 20;
            const occupiedSeatDetails = Array.isArray(data.occupiedSeatDetails) ? data.occupiedSeatDetails : [];
            const occupiedSeatMap = {};

            occupiedSeatDetails.forEach(seat => {
                occupiedSeatMap[Number(seat.seatNum)] = seat;
            })

            const occupiedSeats = Array.isArray(data.occupiedSeats) ? data.occupiedSeats : [];

            if (!res.ok) {
                throw new Error(data.error || "Could not load seat availability.");
            }

            for (let i = 1; i <= capacity; i++) {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.textContent = i;
                btn.dataset.seat = String(i);
                btn.classList.add("seat");

                if (occupiedSeats.includes(i)) {
                    btn.classList.add("occupied");
                    btn.disabled = true;
                    btn.addEventListener("click", () => {
                        alert(`Not available. This seat has been reserved by: ${occupiedInfo.reservedBy}`);
                    });
                } else {
                    btn.classList.add("available");
                    btn.disabled = false;

                    btn.addEventListener("click", () => {
                        document.querySelectorAll(".seat.selected").forEach(el => {
                            el.classList.remove("selected");
                            el.classList.add("available");
                        });

                        btn.classList.remove("available");
                        btn.classList.add("selected");

                        selectedSeat = String(i);
                        infoSeat.textContent = selectedSeat;
                        infoRoom.textContent = inputRoom.value;

                        if (reserveBtn && reserveBtn.tagName === "BUTTON") {
                            reserveBtn.disabled = false;
                        }

                        if (hiddenSeat) hiddenSeat.value = selectedSeat;
                    });
                }

                seatMap.appendChild(btn);

            }
        } catch (err) {
            seatMap.innerHTML = `<p class="text-danger">Could not load seats.</p>`;
        }
    }

    inputDate?.addEventListener("input", () => {
        infoDate.textContent = inputDate.value;
        renderSeats();
    });

    inputTime?.addEventListener("change", () => {
        updateTimeInfo();
        renderSeats();
    });

    inputRoom?.addEventListener("change", () => {
        infoRoom.textContent = inputRoom.value;
        renderSeats();
    });

    reservationForm?.addEventListener("submit", (e) => {
        if (!inputRoom.value) {
            e.preventDefault();
            alert("Please select a room first.");
            return;
        }

        if (!inputDate.value) {
            e.preventDefault();
            alert("Please select a date.");
            return;
        }

        if (!inputTime.value) {
            e.preventDefault();
            alert("Please select a time.");
            return;
        }

        if (!selectedSeat) {
            e.preventDefault();
            alert("Please select a seat first.");
            return;
        }

        if (hiddenLab) hiddenLab.value = inputRoom.value;
        if (hiddenDate) hiddenDate.value = inputDate.value;
        if (hiddenTimeIn) hiddenTimeIn.value = infoTimeIn.textContent;
        if (hiddenTimeOut) hiddenTimeOut.value = infoTimeOut.textContent;
        if (hiddenSeat) hiddenSeat.value = selectedSeat;
    });

    updateTimeInfo();
    infoRoom.textContent = inputRoom ? inputRoom.value : "";
    renderSeats();
});