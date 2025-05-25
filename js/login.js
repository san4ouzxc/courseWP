document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const loginOrEmail = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!loginOrEmail || !password) {
      alert('Будь ласка, заповніть всі поля');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginOrEmail, password })
      });

      const data = await res.json();
      localStorage.setItem('username', data.username);

if (res.ok) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('email', data.email);
  localStorage.setItem('username', data.username);
  localStorage.setItem('avatarUrl', data.avatarUrl || 'img/default-avatar.png');
  window.location.href = 'profile.html';
} else {
  alert(data.message || 'Помилка входу'); 
}
    } catch (err) {
      console.error(err);
      alert('Помилка сервера');
    }
  });
});
