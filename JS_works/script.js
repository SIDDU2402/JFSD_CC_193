document.addEventListener('DOMContentLoaded', (event) => {
    const loginButton = document.getElementById('login');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            alert('user detail is successfully collected!');
        });
    }
});