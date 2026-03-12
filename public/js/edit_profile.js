
const rememberUntil = Number(localStorage.getItem("rememberUntil"));
const sessionLogin = sessionStorage.getItem("isLoggedIn");
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

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

const form = document.getElementById("edit_profile");
const id = document.getElementById("idNumber");
const oldUsername = document.getElementById("oldUsername");
const newUsername = document.getElementById("newUsername");
const oldEmail = document.getElementById("oldEmail");
const newEmail = document.getElementById("newEmail");
const password = document.getElementById("password");

id.textContent = currentUser.idNumber ?? currentUser.id ?? "";
oldUsername.textContent = currentUser.username ?? "";
oldEmail.textContent = currentUser.email ?? "";

function saveUpdated(updateUser) {
    localStorage.setitem("currentUser", JSON.stringify(updateUser));
    currentUser = updatedUser;

    oldUsername.textContent = currentUser.username;
    oldEmail.textContent = currentUser.email;
}

function updateUsername(newUsername) {
        const updated = {...currentUser, username: newUsername};
        saveUpdated(updated);
        return true;
}

function updateEmail(newEmail) {
        const updated = {...currentUser, email: newEmail};
        saveUpdated(updated);
        return true;
}

function updatePassword(newPassword) {
        const updated = {...currentUser, password: newPassword};
        saveUpdated(updated);
        return true;
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const Username = newUsername.value.trim();
    const Email = newEmail.value.trim();
    const Password = password.value.trim();

    if (Username !== "") updateUsername(Username);
    if (Email !== "") updateEmail(Email);
    if (Password !== "") updatePassword(Password);

    newUsername.value = "";
    newEmail.value = "";
    newEmail.value = "";

    alert("The changes made have been saved.");
});