
loginBtn = document.querySelector('.login-btn');

loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = users.find(
        (user) => user.username === username && user.password === password
    );

    if (!foundUser) {
        alert("Username/Password is incorrect. Please try again.");
        return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", JSON.stringify(foundUser));
    window.location.href = "reservation.html";
})