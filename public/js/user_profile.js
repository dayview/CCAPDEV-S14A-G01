document.addEventListener("DOMContentLoaded", () => {
    const logoutUser = document.getElementById("logout_btn");

    if (!logoutUser) return;

    logoutUser.addEventListener("click", (e) => {
        e.preventDefault();

        localStorage.removeItem("currentUser");
        localStorage.removeItem("rememberUntil");
        sessionStorage.removeItem("isLoggedIn");

        window.location.href = "/auth/login";
    });
});