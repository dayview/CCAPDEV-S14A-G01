document.addEventListener('DOMContentLoaded', function(){
    const form = document.querySelector('form');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const user = JSON.parse(localStorage.getItem("userAccount"));

        if (!user) {
            alert("No account found.");
            return;
        }

        if (username !== user.username && password !== user.password) {
            alert("Username or password is incorrect.");
            return;
        }

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(user));

        window.location.href = "reservation.html";
    });
});
