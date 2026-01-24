(() => {
  const link = document.getElementById('mainLink');
  if (!link) return;

  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const wrapper = document.getElementById('phoenixWrapper');
    const title = document.getElementById('titleArea');
    const linkUrl = link.getAttribute('href');

    if (wrapper) wrapper.classList.add('is-flying');
    if (title) title.classList.add('is-fading-out');

    window.setTimeout(() => {
      window.location.href = linkUrl;
    }, 1100);
  });
})();
