const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.site-nav');
const shareUrl = 'https://radiostudio.altervista.org/rallyhub/';
const shareTitle = 'Rally Hub';
const shareText = 'Vivi il rally con emozione su Rally Hub.';
const shareImage = 'https://radiostudio.altervista.org/rallyhub/rallyhub.png';

function closeMenu() {
  toggle.classList.remove('is-open');
  menu.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Apri menu');
}

toggle.addEventListener('click', () => {
  const isOpen = toggle.classList.toggle('is-open');
  menu.classList.toggle('is-open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Chiudi menu' : 'Apri menu');
});

menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    closeMenu();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

const shareLinks = {
  facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl),
  x: 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(shareUrl) + '&text=' + encodeURIComponent(shareText),
  whatsapp: 'https://api.whatsapp.com/send?text=' + encodeURIComponent(shareText + ' ' + shareUrl),
  linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl),
  pinterest: 'https://pinterest.com/pin/create/button/?url=' + encodeURIComponent(shareUrl) + '&media=' + encodeURIComponent(shareImage) + '&description=' + encodeURIComponent(shareText)
};

function showCopyFeedback(message) {
  const feedback = document.querySelector('.copy-feedback');
  if (!feedback) return;
  feedback.textContent = message;
  window.clearTimeout(showCopyFeedback.timeoutId);
  showCopyFeedback.timeoutId = window.setTimeout(() => {
    feedback.textContent = '';
  }, 2200);
}

async function copyShareLink() {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareUrl);
    } else {
      const input = document.createElement('input');
      input.value = shareUrl;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.append(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    showCopyFeedback('Link copiato');
  } catch (error) {
    showCopyFeedback('Copia non riuscita');
  }
}

document.querySelectorAll('[data-share]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.share;
    if (target === 'copy') {
      copyShareLink();
      return;
    }

    const url = shareLinks[target];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer,width=720,height=620');
    }
  });
});
