
const ham = document.getElementById('hamburger');
const nav = document.getElementById('navMenu');

if (ham && nav) {
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      ham.classList.remove('open');
      nav.classList.remove('open');
    });
  });
}
