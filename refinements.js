document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuButton = $('.menu-button');
  const megaMenu = $('#mega-menu');
  const megaClose = $('.mega-close');
  let menuWasOpenedBy = null;
  const setMegaMenu = open => {
    if (!menuButton || !megaMenu) return;
    megaMenu.classList.toggle('open', open);
    megaMenu.setAttribute('aria-hidden', String(!open));
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('locked', open);
    if (open) {
      menuWasOpenedBy = document.activeElement;
      window.setTimeout(() => megaClose?.focus(), 180);
    } else if (menuWasOpenedBy instanceof HTMLElement) {
      menuWasOpenedBy.focus();
    }
  };
  menuButton?.addEventListener('click', () => setMegaMenu(!megaMenu?.classList.contains('open')));
  megaClose?.addEventListener('click', () => setMegaMenu(false));
  $$('.mega-menu a').forEach(link => link.addEventListener('click', () => setMegaMenu(false)));
  document.addEventListener('keydown', event => {
    if (!megaMenu?.classList.contains('open')) return;
    if (event.key === 'Escape') setMegaMenu(false);
    if (event.key !== 'Tab') return;
    const focusable = $$('a[href], button:not([disabled])', megaMenu);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  $$('.hero-side video').forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    const startVideo = () => video.play().catch(() => {});
    video.addEventListener('loadeddata', startVideo, {once: true});
    startVideo();
  });
  $('.footer-brand p')?.remove();
  const loopTimers = new WeakMap();
  const makeInfinite = (track, interval = 4200) => {
    if (!track || reduceMotion || track.dataset.loopReady === 'true') return;
    const originals = [...track.children];
    if (originals.length < 2) return;
    originals.forEach(item => { const clone = item.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); track.appendChild(clone); });
    track.dataset.loopReady = 'true';
    let paused = false;
    const advance = () => {
      if (paused || !document.contains(track)) return;
      const item = track.children[0];
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const step = item.getBoundingClientRect().width + gap;
      if (track.scrollLeft >= track.scrollWidth / 2 - step) track.scrollLeft -= track.scrollWidth / 2;
      track.scrollBy({left: step, behavior: 'smooth'});
    };
    const timer = window.setInterval(advance, interval);
    loopTimers.set(track, timer);
    ['mouseenter','focusin','pointerdown'].forEach(type => track.addEventListener(type, () => { paused = true; }));
    ['mouseleave','focusout','pointerup'].forEach(type => track.addEventListener(type, () => { paused = false; }));
    new IntersectionObserver(([entry]) => { paused = !entry.isIntersecting; }, {threshold: .15}).observe(track);
  };

  const menuData = {
    coffee: [
      ['House espresso', 'Balanced, articulate and dialled throughout the day.', '₹190', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=900&q=88'],
      ['Flat white', 'Double espresso with finely textured milk.', '₹240', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=88'],
      ['Seasonal filter', 'A changing origin brewed for clarity and character.', '₹290', 'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=900&q=88'],
      ['Cold brew', 'Slow-steeped for a clean, rounded finish.', '₹280', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=900&q=88']
    ],
    bakery: [
      ['Butter croissant', 'Deeply layered, delicately crisp and served warm.', '₹220', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=88'],
      ['Almond croissant', 'Fragrant almond cream in a twice-baked shell.', '₹280', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=88'],
      ['Pain au chocolat', 'Dark chocolate folded through buttery pastry.', '₹260', 'https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=900&q=88'],
      ['Pistachio cruffin', 'Flaky pastry with softly roasted pistachio cream.', '₹340', 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=88']
    ],
    dining: [
      ['Eggs on sourdough', 'Soft eggs, bakery sourdough and seasonal greens.', '₹420', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=88'],
      ['Mushroom tartine', 'Roasted mushrooms, cultured butter and herbs.', '₹460', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=88'],
      ['Burrata toast', 'Creamy burrata, tomatoes and crisp house bread.', '₹520', 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=900&q=88'],
      ['Seasonal bowl', 'Grains, greens and bright kitchen pickles.', '₹480', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=88']
    ]
  };

  const menuTrack = $('#featured-menu-track');
  const renderMenu = (key, tab) => {
    if (!menuTrack) return;
    menuTrack.classList.add('switching');
    window.setTimeout(() => {
      menuTrack.innerHTML = menuData[key].map(([name, description, price, image]) => `
        <article class="featured-menu-card">
          <img src="${image}" alt="${name}" loading="lazy">
          <div><h3>${name}</h3><p>${description}</p><strong>${price}</strong></div>
        </article>`).join('');
      menuTrack.scrollLeft = 0;
      menuTrack.dataset.loopReady = 'false';
      makeInfinite(menuTrack, 4400);
      menuTrack.classList.remove('switching');
    }, 150);
    $$('.menu-tabs button').forEach(button => button.setAttribute('aria-selected', String(button === tab)));
    $('#menu-panel')?.setAttribute('aria-labelledby', tab.id);
  };
  $$('.menu-tabs button').forEach(tab => tab.addEventListener('click', () => renderMenu(tab.dataset.menu, tab)));
  renderMenu('coffee', $('#tab-coffee'));
  $('.menu-prev')?.addEventListener('click', () => menuTrack.scrollBy({left: -760, behavior: 'smooth'}));
  $('.menu-next')?.addEventListener('click', () => menuTrack.scrollBy({left: 760, behavior: 'smooth'}));

  const guestSlides = [
    ['Ananya Mehta', 'Approved guest stories will live here — shared with care, and always in the guest’s own words.', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=88', 'Guest enjoying a quiet café moment'],
    ['Rohan Kapoor', 'A considered space for real guest experiences, from first cups to long conversations.', 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=1400&q=88', 'Friends sharing a table in a café'],
    ['Meera Khanna', 'Every published note will be verified before it becomes part of the Roastique story.', 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1400&q=88', 'Guest seated in a warm coffee house']
  ];
  let guestIndex = 0;
  const showGuest = index => {
    guestIndex = (index + guestSlides.length) % guestSlides.length;
    const [name, quote, source, alt] = guestSlides[guestIndex];
    const content = $('.guest-content');
    const image = $('.guest-image img');
    content.classList.add('switching'); image.classList.add('switching');
    window.setTimeout(() => {
      image.src = source; image.alt = alt;
      $('.guest-copy blockquote p').textContent = quote;
      $('.guest-copy footer').textContent = name;
      $$('.guest-dot').forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === guestIndex));
      content.classList.remove('switching'); image.classList.remove('switching');
    }, 180);
  };
  $$('.guest-dot').forEach((dot, index) => dot.addEventListener('click', () => showGuest(index)));
  $('.guest-next')?.addEventListener('click', () => showGuest(guestIndex + 1));
  $('.guest-prev')?.addEventListener('click', () => showGuest(guestIndex - 1));

  const searchData = [
    ['Coffee', 'Explore the coffee menu', '#menu', 'coffee espresso filter flat white', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=180&q=82'],
    ['Bakery', 'Step inside the live bakery', '#bakery-coffee', 'bakery pastry croissant warm', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=180&q=82'],
    ['Events', 'Discover Roastique gatherings', '#events', 'events tasting workshop gathering', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=180&q=82'],
    ['Creations', 'See signature creations', '#creations', 'signature creations products food', 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=180&q=82'],
    ['Roastique', 'Read guest notes', '#guest-notes', 'guest notes stories', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=180&q=82']
  ];
  const command = $('.command-search');
  const trigger = $('.command-trigger');
  const panel = $('.command-panel');
  const input = $('#search-input');
  const results = $('#search-results');
  const renderResults = query => {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const matches = words.length ? searchData.filter(item => words.some(word => item.join(' ').toLowerCase().includes(word))) : searchData.slice(0, 4);
    results.innerHTML = matches.length ? matches.map(([type, title, target, , image]) => `<button class="command-result" type="button" data-target="${target}"><img src="${image}" alt=""><span><small>${type}</small><strong>${title}</strong></span></button>`).join('') : '<p class="search-empty">Try coffee, bakery, events, menu or guest notes.</p>';
    $$('.command-result', results).forEach(button => button.addEventListener('click', () => { closeSearch(); $(button.dataset.target)?.scrollIntoView({behavior: 'smooth'}); }));
  };
  const openSearch = () => { command.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); panel.setAttribute('aria-hidden', 'false'); renderResults(''); window.setTimeout(() => input.focus(), 180); };
  const closeSearch = () => { command.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); panel.setAttribute('aria-hidden', 'true'); input.value = ''; };
  trigger?.addEventListener('click', openSearch);
  $('.search-close')?.addEventListener('click', closeSearch);
  input?.addEventListener('input', () => renderResults(input.value));
  $$('.quick-chips button').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.query; renderResults(input.value); input.focus(); }));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && command?.classList.contains('open')) closeSearch(); });

  $('.footer-newsletter')?.addEventListener('submit', event => {
    event.preventDefault();
    const status = $('.footer-newsletter small');
    status.textContent = 'Thank you — updates will begin when the house opens.';
    event.currentTarget.reset();
  });

  window.setTimeout(() => {
    makeInfinite($('.product-slider'), 3800);
    makeInfinite($('.event-track'), 5200);
    makeInfinite($('.instagram-track'), 3400);
  }, 350);

  if (!reduceMotion) {
    let guestPaused = false;
    const guestTimer = window.setInterval(() => { if (!guestPaused) showGuest(guestIndex + 1); }, 5600);
    const guest = $('.guest-notes');
    guest?.addEventListener('mouseenter', () => { guestPaused = true; });
    guest?.addEventListener('mouseleave', () => { guestPaused = false; });
    guest?.addEventListener('focusin', () => { guestPaused = true; });
    guest?.addEventListener('focusout', () => { guestPaused = false; });
  }

  const revealTargets = $$('.section-heading, .together-copy, .guest-copy, .footer-intro, .footer-directory > *, .product-slide, .featured-menu-card');
  const maskTargets = $$('.craft-card img, .event-slide img, .guest-image, .instagram-track img');
  revealTargets.forEach((target, index) => { target.classList.add('motion-reveal'); target.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`; });
  maskTargets.forEach(target => target.classList.add('motion-mask'));
  const motionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); motionObserver.unobserve(entry.target); }
  }), {threshold: .14, rootMargin: '0px 0px -8%'});
  [...revealTargets, ...maskTargets].forEach(target => motionObserver.observe(target));
  $$('.together-section > video, .event-slide img, .guest-image img').forEach(media => media.classList.add('parallax-media'));

  $$('.pill-cta span, .primary-cta span, .instagram .section-heading > a span').forEach(icon => { icon.className = 'fa-solid fa-arrow-up-right-from-square'; icon.textContent = ''; icon.setAttribute('aria-hidden', 'true'); });
  $$('.arrow').forEach(button => {
    const previous = /prev/i.test(button.className);
    button.innerHTML = `<i class="fa-solid fa-arrow-${previous ? 'left' : 'right'}" aria-hidden="true"></i>`;
  });
  const megaImage = $('.mega-visual img');
  const megaCaption = $('.mega-visual figcaption');
  const updateMegaVisual = link => {
    if (!megaImage) return;
    megaImage.classList.add('is-changing');
    window.setTimeout(() => {
      megaImage.src = link.dataset.image;
      megaImage.alt = link.querySelector('strong')?.textContent || 'Roastique';
      if (megaCaption) megaCaption.textContent = link.dataset.caption || '';
      megaImage.classList.remove('is-changing');
    }, 140);
  };
  $$('.mega-primary a').forEach(link => {
    link.addEventListener('mouseenter', () => updateMegaVisual(link));
    link.addEventListener('focus', () => updateMegaVisual(link));
  });
  const triggerIcon = $('.command-trigger i');
  if (triggerIcon) triggerIcon.outerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';
  const closeIcon = $('.search-close');
  if (closeIcon) closeIcon.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
});
