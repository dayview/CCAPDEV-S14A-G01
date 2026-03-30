const form = document.getElementById("edit_profile");
const newUsername = document.getElementById("newUsername");
const newEmail = document.getElementById("newEmail");
const password = document.getElementById("password");
const oldUsername = document.getElementById("oldUsername");
const oldEmail = document.getElementById("oldEmail");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const updatedData = {
        username: newUsername.value.trim(),
        email: newEmail.value.trim(),
        password: password.value.trim()
    };

    Object.keys(updatedData).forEach((key) => {
        if (!updatedData[key]) delete updatedData[key];
    });

    try {
        const response = await fetch("/edit_profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Failed to update profile.");
            return;
        }

        if (result.user) {
            oldUsername.textContent = result.user.username || "";
            oldEmail.textContent = result.user.email || "";
        }

        newUsername.value = "";
        newEmail.value = "";
        password.value = "";

        alert("The changes made have been saved.");
    } catch (error) {
        alert("Something went wrong while updating your profile.");
    }
});
