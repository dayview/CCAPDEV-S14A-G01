console.log("signup.js loaded");

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signup");

    if (!form) {
        console.error("Form not found!");
        return;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const userData = {
            idNumber: document.getElementById("idnumber").value,
            username: document.getElementById("user").value,
            password: document.getElementById("password").value,
            email: document.getElementById("email").value
        };

        localStorage.setItem("userAccount", JSON.stringify(userData));

        alert("Sign-up successful!");

        window.location.href = "login.html";
    });
});