document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout_btn");
    if (!logoutBtn) return;
    logoutBtn.addEventListener("click", function () {
        window.location.assign("/auth/logout");
    })
})

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout_btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            window.location.assign("/auth/logout");
        });
    }
    const profileInput = document.getElementById("profilePicture");
    const profilePreview = document.querySelector(".profile-pic-preview");
    if (profileInput && profilePreview) {
        profileInput.addEventListener("change", function(event) {
            const file = event.target.files[0];        
            if (file) {   
                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePreview.src = e.target.result; 
                }
                reader.readAsDataURL(file);
            }
        });
    }
});