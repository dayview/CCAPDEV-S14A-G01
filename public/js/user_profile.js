document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout_btn");
    if (!logoutBtn) return;
    logoutBtn.addEventListener("click", function () {
        window.location.assign("/auth/logout");
    })
})