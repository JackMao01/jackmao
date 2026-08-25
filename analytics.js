(() => {
  'use strict';

  const config = Object.freeze({
    endpoint: '',
    site: 'hellojackmao.com'
  });

  const isLiveSite = /^(?:www\.)?hellojackmao\.com$/i.test(location.hostname);
  const privacyOptOut = navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  if (!config.endpoint || !isLiveSite || privacyOptOut) return;

  const cleanPath = value => {
    try {
      const url = new URL(value, location.href);
      return url.origin === location.origin ? url.pathname : url.hostname;
    } catch (_) {
      return '';
    }
  };

  const send = (event, details = {}) => {
    const payload = JSON.stringify({
      site: config.site,
      event,
      path: location.pathname,
      ...details
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(config.endpoint, new Blob([payload], { type: 'application/json' }));
      return;
    }

    fetch(config.endpoint, {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    }).catch(() => {});
  };

  const classifyLink = link => {
    const href = link.getAttribute('href') || '';
    const label = `${link.id} ${link.className} ${link.textContent}`.toLowerCase();
    if (/resume/.test(label) || /canva\.link/i.test(href)) return 'resume';
    if (/share/.test(label) || /share\.html/i.test(href)) return 'share';
    if (/next-project|next project/.test(label)) return 'next_project';
    if (/projects?[\\/]/i.test(href)) return 'project';
    if (/^(?:mailto:|tel:)/i.test(href) || /linkedin|instagram|behance/i.test(href)) return 'contact';
    return /^https?:/i.test(href) ? 'outbound' : '';
  };

  send('pageview');

  document.addEventListener('click', event => {
    const intentButton = event.target.closest('#intent-toggle');
    if (intentButton) {
      send('intent_toggle', { state: intentButton.getAttribute('aria-pressed') === 'true' ? 'off' : 'on' });
      return;
    }

    const link = event.target.closest('a[href]');
    if (!link) return;
    const action = classifyLink(link);
    if (action) send(action, { target: cleanPath(link.href) });
  }, { passive: true });
})();
