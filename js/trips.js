document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const unauthorizedMessage = document.getElementById('unauthorizedMessage');
  const authorizedContent = document.getElementById('authorizedContent');
  const tripsContainer = document.getElementById('tripsContainer');

  if (!token) {
    unauthorizedMessage.style.display = 'flex';
    return;
  }

  authorizedContent.style.display = 'block';

  fetch('http://localhost:5000/api/trips', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(async (res) => {
      if (!res.ok) throw new Error('Помилка завантаження подорожей');
      return res.json();
    })
    .then(data => {
      if (!data.trips || data.trips.length === 0) {
        tripsContainer.textContent = 'У вас ще немає доданих подорожей.';
        return;
      }

      tripsContainer.innerHTML = '';

      data.trips.forEach(trip => {
        const tripCard = document.createElement('div');
        tripCard.classList.add('trip-card');
        tripCard.innerHTML = `
          <p><strong>Звідки:</strong> ${trip.from}</p>
          <p><strong>Куди:</strong> ${trip.to}</p>
          <p><strong>Дата:</strong> ${new Date(trip.date).toLocaleDateString()}</p>
          <p><strong>Пасажири:</strong> ${trip.passengers}</p>
        `;
        tripsContainer.appendChild(tripCard);
      });
    })
    .catch(err => {
      console.error(err);
      tripsContainer.textContent = 'Помилка при завантаженні подорожей.';
    });
});
