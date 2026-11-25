const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const menuButton = $('.menu-button');
const megaMenu = $('.mega-menu');
const megaClose = $('.mega-close');
const setMega = open => {
  megaMenu.classList.toggle('open', open);
  megaMenu.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('locked', open);
  (open ? megaClose : menuButton).focus();
};
menuButton?.addEventListener('click', () => setMega(true));
megaClose?.addEventListener('click', () => setMega(false));
$$('.mega-menu a').forEach(link => link.addEventListener('click', () => setMega(false)));

const sliderButtons = (trackSelector, previousSelector, nextSelector, amount) => {
  const track = $(trackSelector);
  $(previousSelector)?.addEventListener('click', () => track?.scrollBy({left: -amount, behavior: 'smooth'}));
  $(nextSelector)?.addEventListener('click', () => track?.scrollBy({left: amount, behavior: 'smooth'}));
};
sliderButtons('.product-slider', '.product-prev', '.product-next', 420);
sliderButtons('.event-track', '.event-prev', '.event-next', 720);
sliderButtons('.instagram-track', '.insta-prev', '.insta-next', 380);

const eventImages = $$('.event-slide img');
const events = $('.events');
Promise.all(eventImages.map(image => image.complete ? Promise.resolve() : new Promise(resolve => {
  image.addEventListener('load', resolve, {once: true});
  image.addEventListener('error', resolve, {once: true});
}))).then(() => {
  events?.classList.remove('events-loading');
  events?.setAttribute('aria-busy', 'false');
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && megaMenu?.classList.contains('open')) setMega(false);
});
