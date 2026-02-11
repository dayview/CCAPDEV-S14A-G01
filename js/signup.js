    document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signup");

    if (!form) {
        console.error("Form not found!");
        return;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

    
        const idNumber =  document.getElementById("idnumber").value.trim();
        const username = document.getElementById("user").value.trim();
        const password = document.getElementById("password").value;
        const email = document.getElementById("email").value.trim();

        let users = JSON.parse(localStorage.getItem("userAccounts")) || [];

        const duplicate = users.find(user => user.idNumber === idNumber || user.username === username || user.email === email);
        
        if(duplicate){
            alert("User already exists. Please try again.");
            return;
        }

        const newUser = {
            idNumber, username, password, email
        };

        users.push(newUser);
        localStorage.setItem("userAccounts", JSON.stringify(users));

        alert("Sign-up successful!");

        window.location.href = "login.html";
    });
});
