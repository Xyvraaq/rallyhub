let channels = {};

const video = document.querySelector('#stream-player');
const statusNode = document.querySelector('#player-status');
const channelTitle = document.querySelector('#channel-title');
const channelDescription = document.querySelector('#channel-description');
const guideToggle = document.querySelector('#guide-toggle');
const guideSection = document.querySelector('#guide-section');
const channelButtons = document.querySelectorAll('[data-channel]');

let hlsInstance;
let statusTimeout = null;

function setStatus(message, autoHide = false) {
  statusNode.textContent = message;

  if (statusTimeout) {
    clearTimeout(statusTimeout);
    statusTimeout = null;
  }

  if (autoHide) {
    statusTimeout = setTimeout(() => {
      if (statusNode.textContent === message) {
        statusNode.textContent = '';
      }
    }, 3000);
  }
}

async function loadChannels() {
  try {
    const response = await fetch(
      'https://rallyhub-api.onrender.com/api/channels',
      {
        headers: {
          "x-api-key": "scemochilegge"
        }
      }
    );

    if (!response.ok) {
      throw new Error('Errore caricamento canali');
    }

    channels = await response.json();

    loadStream('global');

  } catch (error) {
    console.error(error);
    setStatus('Errore nel caricamento dei canali.');
  }
}

function destroyHls() {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
}

function loadStream(channelKey) {
  const channel = channels[channelKey];
  if (!channel) return;

  destroyHls();
  video.pause();
  video.removeAttribute('src');
  video.load();

  channelTitle.textContent = channel.title;
  channelDescription.textContent = channel.description;

  guideToggle.hidden = !channel.showGuide;

  if (!channel.showGuide) {
    guideSection.hidden = true;
    guideToggle.textContent = 'APRI GUIDA TV';
  }

  channelButtons.forEach((button) => {
    const isCurrent = button.dataset.channel === channelKey;
    button.classList.toggle('is-active', isCurrent);
    button.setAttribute('aria-pressed', String(isCurrent));
  });

  setStatus('Caricamento ' + channel.title + '...');

  if (window.Hls && Hls.isSupported()) {
    hlsInstance = new Hls({ lowLatencyMode: true });

    hlsInstance.loadSource(channel.url);
    hlsInstance.attachMedia(video);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      setStatus(
        'Canale pronto.',
        true
      );
    });

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        setStatus('Il canale non è disponibile in questo momento. Riprova tra poco.');
      }
    });

    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = channel.url;

    setStatus(
      'Canale pronto.',
      true
    );

    return;
  }

  setStatus('Questo browser non supporta la riproduzione HLS.');
}

channelButtons.forEach((button) => {
  button.addEventListener('click', () => {
    loadStream(button.dataset.channel);
  });
});

guideToggle.addEventListener('click', () => {
  const isHidden = guideSection.hidden;
  guideSection.hidden = !isHidden;

  guideToggle.textContent = isHidden
    ? 'CHIUDI GUIDA TV'
    : 'APRI GUIDA TV';

  if (isHidden) {
    guideSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// init
loadChannels();
