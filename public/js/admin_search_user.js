const searchBtn = document.getElementById('search_btn');
const userIdInput = document.getElementById('user_id_input');
const errorMessage = document.getElementById('error_message');
const userProfileCard = document.getElementById('user_profile_card');
const editProfileCard = document.getElementById('edit_profile_card');
const editProfileBtn = document.getElementById('edit_profile_btn');
const adminNote = document.getElementById('admin_note');
const cancelEditBtn = document.getElementById('cancel_edit_btn');
const finishEditBtn = document.getElementById('finish_edit_btn');
const deleteAccountBtn = document.getElementById('delete_account_btn');
const editError = document.getElementById('edit_error');
const editSuccess = document.getElementById('edit_success');

let currentUser = null;

function resetUI() {
    errorMessage.style.display = 'none';
    userProfileCard.style.display = 'none';
    editProfileCard.style.display = 'none';
    editError.style.display = 'none';
    editSuccess.style.display = 'none';
    currentUser = null;
}

function displayUser(user) {
    currentUser = user;

    const initials = (user.firstName[0] || '') + (user.lastName[0] || '');
    document.getElementById('profile_avatar').textContent = initials.toUpperCase();
    document.getElementById('display_name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('display_idnum').textContent = user.idNum;
    document.getElementById('display_email').textContent = user.email;
    document.getElementById('display_username').textContent = user.username;
    document.getElementById('display_role').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('display_description').textContent = user.description || '(No description)';

    const isAdmin = user.role === 'admin';
    editProfileBtn.disabled = isAdmin;
    adminNote.style.display = isAdmin ? 'inline' : 'none';

    userProfileCard.style.display = 'flex';
}

async function searchUser() {
    const idNum = userIdInput.value.trim();
    resetUI();

    if (!idNum) {
        alert('Please enter a User ID.');
        return;
    }
    if (idNum.length !== 8 || isNaN(idNum)) {
        alert('Please enter a valid 8-digit User ID.');
        return;
    }

    try {
        const res = await fetch(`/admin/search-user/lookup?idNum=${encodeURIComponent(idNum)}`, {
            headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();

        if (data.notFound) {
            errorMessage.style.display = 'block';
            return;
        }

        displayUser(data.user);
    } catch (err) {
        console.error('Search error:', err);
        alert('Something went wrong. Please try again.');
    }
}

searchBtn.addEventListener('click', searchUser);
userIdInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') searchUser();
});

editProfileBtn.addEventListener('click', () => {
    if (!currentUser || currentUser.role === 'admin') return;

    document.getElementById('edit_username').value = currentUser.username;
    document.getElementById('edit_description').value = currentUser.description || '';
    document.getElementById('edit_password').value = '';
    document.getElementById('edit_confirm_password').value = '';
    editError.style.display = 'none';
    editSuccess.style.display = 'none';

    editProfileCard.style.display = 'block';
    editProfileCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

cancelEditBtn.addEventListener('click', () => {
    editProfileCard.style.display = 'none';
    editError.style.display = 'none';
    editSuccess.style.display = 'none';
});

finishEditBtn.addEventListener('click', async () => {
    const username = document.getElementById('edit_username').value.trim();
    const description = document.getElementById('edit_description').value.trim();
    const password = document.getElementById('edit_password').value;
    const confirmPassword = document.getElementById('edit_confirm_password').value;

    editError.style.display = 'none';
    editSuccess.style.display = 'none';

    if (!username) {
        editError.textContent = 'Username cannot be empty.';
        editError.style.display = 'block';
        return;
    }

    if (password && password !== confirmPassword) {
        editError.textContent = 'Passwords do not match.';
        editError.style.display = 'block';
        return;
    }

    try {
        const body = { username, description };
        if (password) body.password = password;

        const res = await fetch(`/admin/search-user/edit/${currentUser._id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            editError.textContent = data.error || 'Update failed. Please try again.';
            editError.style.display = 'block';
            return;
        }

        // Update local currentUser and re-render profile
        currentUser = { ...currentUser, username, description };
        displayUser(currentUser);

        editSuccess.style.display = 'block';
        document.getElementById('edit_username').value = username;
        document.getElementById('edit_description').value = description;
        document.getElementById('edit_password').value = '';
        document.getElementById('edit_confirm_password').value = '';

    } catch (err) {
        console.error('Edit error:', err);
        editError.textContent = 'Something went wrong. Please try again.';
        editError.style.display = 'block';
    }
});

deleteAccountBtn.addEventListener('click', async () => {
    if (!currentUser) return;

    const deletedName = `${currentUser.firstName} ${currentUser.lastName}`;
    const deletedId   = currentUser.idNum;

    const confirmed = confirm(`Are you sure you want to delete the account of ${deletedName} (${deletedId})? This will cancel all their pending reservations and cannot be undone.`);
    if (!confirmed) return;

    try {
        const res = await fetch(`/admin/search-user/delete/${currentUser._id}`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();

        if (!res.ok || data.error) {
            alert(data.error || 'Delete failed. Please try again.');
            return;
        }

        resetUI();
        userIdInput.value = '';
        alert(`Account for ${deletedName} has been deleted successfully.`);
    } catch (err) {
        console.error('Delete error:', err);
        alert('Something went wrong. Please try again.');
    }
});
