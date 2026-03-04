const USERS = [
    { username: "dcheng", password: "dcheng123", firstName: "Danny", lastName: "Cheng", idNumber: "12512345"},
    { username: "jmajor", password: "jmajor123", firstName: "Justine", lastName: "Major", idNumber: "12112345"},
    { username: "ajsese", password: "ajsese123", firstName: "Alj", lastName: "Sese", idNumber: "12212345"},
    { username: "lpavino", password: "lpavino123", firstName: "Leon", lastName: "Pavino", idNumber: "12312345"},
    { username: "mcolcol", password: "mcolcol123", firstName: "Massi", lastName: "Colcol", idNumber: "12412345"}
];

function checkUserLogin() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function login(username, password) {
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('currentUser');
}

function signup(userData) {
    const exists = USERS.some(u => u.username === userData.username);
    if (exists) {
        return false;
    }

    USERS.push(userData);

    localStorage.setItem('currentUser', JSON.stringify(userData));
    return true;
}