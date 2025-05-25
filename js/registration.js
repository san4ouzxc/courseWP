document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
      alert("Паролі не співпадають");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Помилка при реєстрації");
        return;
      }

      // После регистрации — авторизация
      const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ identifier: email, password })
      });

      const loginData = await loginResponse.json();

      console.log('Login after registration:', loginResponse.status, loginData);
      if (!loginResponse.ok) {
        alert("Реєстрація пройшла, але помилка при вході");
        return;
      }

      // Сохраняем токен и переходим в профиль
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("email", loginData.email);
      localStorage.setItem("username", loginData.username);  // не забудь
      localStorage.setItem("avatarUrl", loginData.avatarUrl || '/uploads/default-avatar.png');

      window.location.href = "profile.html";
    } catch (err) {
      console.error("Помилка:", err);
      alert("Помилка з'єднання з сервером");
    }
  });
});
