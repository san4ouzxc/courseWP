function showNotification(message) {
  const notif = document.getElementById('notification');
  notif.textContent = message;
  notif.style.display = 'block';
  setTimeout(() => {
    notif.style.display = 'none';
  }, 3000); // уведомление пропадает через 3 секунды
}

document.querySelector('.ticket-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const from = document.getElementById('from').value.trim();
  const to = document.getElementById('to').value.trim();
  const date = document.getElementById('date').value;
  const passengers = +document.getElementById('passengers').value;

  if (!from || !to || !date || !passengers) {
    alert('Будь ласка, заповніть всі поля');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ from, to, date, passengers })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Помилка додавання поїздки');
      return;
    }
    showNotification('Поїздку додано!');
    e.target.reset();
  } catch (err) {
    alert('Помилка з’єднання з сервером');
  }
});


