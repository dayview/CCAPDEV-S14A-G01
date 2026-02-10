document.addEventListener('DOMContentLoaded', function(){
    const form = document.querySelector('form');
    const remember = document.getElementById('remember');
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const users = JSON.parse(localStorage.getItem("userAccounts")) || [];

        const foundUser = users.find(user => user.username === username && user.password === password);

        if (!foundUser) {
            alert("Error with account information.");
            return;
        }

        localStorage.setItem("currentUser", JSON.stringify(foundUser));

        if (remember.checked) {
            const expiry = Date.now() + (1000 * 60 * 60 * 24 * 21);
            localStorage.setItem("rememberUntil", JSON.stringify(expiry));
        }
        else {
            sessionStorage.setItem("isLoggedIn", "true");
        }
        window.location.href = "reservation.html";
    });
});
