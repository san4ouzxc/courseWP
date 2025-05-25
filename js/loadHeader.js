document.addEventListener('DOMContentLoaded', () => {
  fetch('header.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load header');
      }
      return response.text();
    })
    .then(data => {
      const headerContainer = document.getElementById('header-container');
      headerContainer.innerHTML = data;

      // Навешиваем обработчики на ссылки
      const navLinks = headerContainer.querySelectorAll('.nav-links a, .logo-link');
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (!href) return;
          if (/^https?:\/\//.test(href)) return;

          const currentPage = window.location.pathname.split('/').pop();
          if (href === currentPage || (href === '' && currentPage === 'index.html')) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log('Вы уже на этой странице');
          }
        });
      });

      // 👉 ПОКАЗЫВАЕМ/СКРЫВАЕМ КНОПКИ ПОСЛЕ ЗАГРУЗКИ ХЕДЕРА
      const token = localStorage.getItem('token');
      const loginLink = headerContainer.querySelector('a[href="login.html"]');
      const accountLink = headerContainer.querySelector('#accountLink');

      if (token) {
        loginLink.style.display = 'none';
        accountLink.style.display = 'inline-block';
      } else {
        loginLink.style.display = 'inline-block';
        accountLink.style.display = 'none';
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById('header-container').innerHTML = '<p>Не вдалося завантажити хедер</p>';
    });
});
