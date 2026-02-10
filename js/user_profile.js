document.addEventListener('DOMContentLoaded', () => {
    const rememberUntil = Number(localStorage.getItem("rememberUntil"));
    const sessionLogin = sessionStorage.getItem("isLoggedIn");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    let authenticated = false;

    if (rememberUntil && Date.now() <= rememberUntil) {
        authenticated = true;
    } else if (sessionLogin) {
        authenticated = true;
    }

    if (!authenticated || !currentUser) {
        localStorage.removeItem("rememberUntil");
        localStorage.removeItem("currentUser");
        sessionStorage.removeItem("isLoggedIn");
        window.location.href = "login.html";
    }

    function logout() {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("rememberUntil");
        sessionStorage.removeItem("isLoggedIn");
    }
        const logoutUser = document.getElementById("logout_btn");

        if (!logoutUser) return;

        logoutUser.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
            window.location.replace("landing.html");
    });
})

