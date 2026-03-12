document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector("form");
    const remember = document.getElementById("remember");

    const ADMIN = {
        username: "admin",
        password: "admin123"
    }; 

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        const isAdmin = (username === ADMIN.username && password === ADMIN.password);

        if (!isAdmin) {
            alert("Incorrect admin credentials. Please try again.");
            return;
        }

        localStorage.setItem("currentAdmin", JSON.stringify({username: ADMIN.username}));

        if (remember.checked) {
            const expiry = Date.now() + (1000 * 60 * 60 * 24 * 21);
            localStorage.setItem("adminRememberUntil", String(expiry));
        } else {
            sessionStorage.setItem("isAdminLoggedIn", "true");
        }

        window.location.href = "admin_homepage.html";
    });
});