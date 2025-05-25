document.addEventListener('DOMContentLoaded', () => {
  const email = localStorage.getItem('email');
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');



  if (!token) {
    window.location.href = 'login.html';
    return;
  }

const savedAvatar = localStorage.getItem('avatarUrl') || '/uploads/default-avatar.png';
document.getElementById('avatarPreview').src = savedAvatar;
  document.getElementById('userEmail').textContent = email || 'Невідомо';
  document.getElementById('userName').textContent = username || 'Невідомо';

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('avatarUrl');  // Удаляем аватар при выходе
    window.location.href = 'login.html';
  });

  attachEditHandler(); // Прикрепляем обработчик редактирования логина
});

function attachEditHandler() {
  const editBtn = document.getElementById('editUsernameBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      enableEdit();
    });
  }
}

function enableEdit() {
  const userNameSpan = document.getElementById('userName');
  const currentUsername = userNameSpan.textContent;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentUsername;
  input.id = 'editUsernameInput';
  input.style.marginRight = '10px';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Зберегти';
  saveBtn.style.marginLeft = '10px';

  const container = userNameSpan.parentElement;
  container.innerHTML = '';
  container.appendChild(input);
  container.appendChild(saveBtn);

  saveBtn.addEventListener('click', async () => {
    const newUsername = input.value.trim();
    if (!newUsername) {
      alert('Логін не може бути порожнім');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/users/update-username', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Помилка оновлення логіна');
        return;
      }

      localStorage.setItem('username', newUsername);

      container.innerHTML = `
        <span id="userName">${newUsername}</span>
        <img src="img/edit.png" alt="Редагувати" class="edit-icon" id="editUsernameBtn" />
      `;

      attachEditHandler();
    } catch (err) {
      console.error('Помилка при оновленні логіна:', err);
      alert('Помилка з\'єднання з сервером');
    }
  });
}

document.getElementById('avatarInput').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('avatar', file);

  const token = localStorage.getItem('token');

  fetch('http://localhost:5000/api/auth/avatar', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.avatarUrl) {
        document.getElementById('avatarPreview').src = data.avatarUrl;
        localStorage.setItem('avatarUrl', data.avatarUrl);
      }
    })
    .catch(err => {
      console.error('Помилка при завантаженні аватара:', err);
    });
});
