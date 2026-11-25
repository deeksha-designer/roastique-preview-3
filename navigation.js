document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-button');
  const megaMenu = document.querySelector('#mega-menu');
  const megaClose = document.querySelector('.mega-close');
  const search = document.querySelector('.command-search');
  const megaImage = document.querySelector('.mega-visual img');
  const megaCaption = document.querySelector('.mega-visual figcaption');
  const menuLinks = [...document.querySelectorAll('.mega-primary a')];
  let returnFocus = null;
  let imageSwapTimer = 0;

  if (!menuButton || !megaMenu || !megaClose) return;

  const setMenu = open => {
    megaMenu.classList.toggle('open', open);
    megaMenu.setAttribute('aria-hidden', String(!open));
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('locked', open);
    search?.setAttribute('aria-hidden', String(open));

    if (open) {
      returnFocus = document.activeElement;
      window.requestAnimationFrame(() => megaClose.focus());
    } else if (returnFocus instanceof HTMLElement) {
      returnFocus.focus();
    }
  };

  const updateVisual = link => {
    if (!megaImage) return;
    window.clearTimeout(imageSwapTimer);
    megaImage.classList.add('is-changing');
    imageSwapTimer = window.setTimeout(() => {
      megaImage.src = link.dataset.image;
      megaImage.alt = link.querySelector('strong')?.textContent || 'Roastique';
      if (megaCaption) megaCaption.textContent = link.dataset.caption || '';
      megaImage.classList.remove('is-changing');
    }, 140);
  };

  menuButton.addEventListener('click', event => {
    event.preventDefault();
    setMenu(!megaMenu.classList.contains('open'));
  });
  megaClose.addEventListener('click', () => setMenu(false));
  menuLinks.forEach(link => {
    link.addEventListener('mouseenter', () => updateVisual(link));
    link.addEventListener('focus', () => updateVisual(link));
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', event => {
    if (!megaMenu.classList.contains('open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...megaMenu.querySelectorAll('a[href], button:not([disabled])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
});
