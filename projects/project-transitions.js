(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let navigating = false;

  const pageName = window.location.pathname.split('/').pop() || '';
  const movingIndexPage = 'in-good-company-light.html';
  const editorialPage = 'in-good-company.html';
  const isMovingIndex = pageName === movingIndexPage;
  const isEditorial = pageName === editorialPage;
  const isIgcEdition = isMovingIndex || isEditorial;
  const compactViewport = window.matchMedia('(max-width: 760px)');

  root.classList.add('jm-transitions');

  const createIgcTransitionProxy = (source, arriving = false) => {
    if (!source || reducedMotion.matches || !document.body) {
      return null;
    }

    const proxy = document.createElement('img');
    proxy.className = 'igc-transition-proxy';
    proxy.src = source;
    proxy.alt = '';
    proxy.setAttribute('aria-hidden', 'true');
    proxy.setAttribute('draggable', 'false');
    document.body.append(proxy);

    if (arriving) {
      window.setTimeout(() => proxy.remove(), 900);
    }

    return proxy;
  };

  if (isIgcEdition) {
    root.classList.add('igc-edition-page', isMovingIndex ? 'igc-moving-index' : 'igc-editorial');

    try {
      const direction = window.sessionStorage.getItem('igc-edition-direction');
      if (
        (direction === 'to-editorial' && isEditorial) ||
        (direction === 'to-index' && isMovingIndex)
      ) {
        root.classList.add(
          direction === 'to-editorial' ? 'igc-arriving-from-index' : 'igc-arriving-from-editorial'
        );
      }

      if (direction === 'to-editorial' && isEditorial && !compactViewport.matches) {
        const leadSource = window.sessionStorage.getItem('igc-lead-source');
        const heroImage = document.querySelector('.hero-placeholder img');
        if (leadSource && heroImage) {
          const compactSource = leadSource.replace(/\.webp(?:\?.*)?$/i, '-360.webp').replace('-360-360.webp', '-360.webp');
          const fullSource = leadSource.replace('-360.webp', '.webp');
          heroImage.src = compactSource;
          heroImage.srcset = `${compactSource} 360w, ${fullSource} 2400w`;

          const frameMatch = leadSource.match(/\/(sunpark|richelle)\/[^/]*-(\d{2})-/i);
          if (frameMatch) {
            const person = frameMatch[1].toLowerCase();
            const frameNumber = frameMatch[2];
            const isRichelleFrame = person === 'richelle';
            const kicker = document.querySelector('.hero-kicker');
            const meta = document.querySelector('.hero-meta');

            if (kicker) {
              kicker.textContent = `Portrait journal / Roll ${isRichelleFrame ? '002' : '001'} / Toronto`;
            }
            if (meta) {
              meta.textContent = `Frame ${frameNumber} of 09 / Selected edit`;
            }
          }
        }
      }

      if (direction === 'to-index' && isMovingIndex && !compactViewport.matches) {
        createIgcTransitionProxy(
          window.sessionStorage.getItem('igc-lead-source'),
          true
        );
      }

      window.sessionStorage.removeItem('igc-edition-direction');
      window.sessionStorage.removeItem('igc-lead-source');

      window.setTimeout(() => {
        root.classList.remove('igc-arriving-from-index', 'igc-arriving-from-editorial');
      }, 1100);
    } catch (_) {
      // The transition still works when storage is unavailable.
    }
  }

  const resetPage = (event) => {
    navigating = false;
    root.classList.remove('jm-page-leaving', 'igc-edition-leaving', 'igc-to-editorial', 'igc-to-index');

    const navigationEntry = window.performance?.getEntriesByType?.('navigation')?.[0];
    const restoredFromHistory = Boolean(event?.persisted || navigationEntry?.type === 'back_forward');
    if (!restoredFromHistory) return;

    root.classList.remove('igc-arriving-from-index', 'igc-arriving-from-editorial');
    document.querySelectorAll('.igc-transition-proxy').forEach((proxy) => proxy.remove());

    if (isMovingIndex) {
      const field = document.querySelector('.motion-field');
      const title = document.querySelector('.title-lockup');
      document.querySelectorAll('.motion-field img').forEach((image) => {
        image.style.removeProperty('view-transition-name');
      });

      window.requestAnimationFrame(() => {
        title?.classList.add('is-title-ready');
        if (!field) return;
        const rect = field.getBoundingClientRect();
        field.classList.add('is-ready', 'is-moving');
        field.classList.toggle(
          'is-in-view',
          !document.hidden && rect.bottom > -160 && rect.top < window.innerHeight + 160
        );
      });
    }
  };

  window.addEventListener('pageshow', resetPage);

  const getVisibleLeadImage = () => {
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    return [...document.querySelectorAll('.motion-field .photo-card:not([aria-hidden="true"]) img')]
      .map((image) => {
        const rect = image.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
        const distance = Math.hypot(
          rect.left + rect.width / 2 - viewportCenterX,
          rect.top + rect.height / 2 - viewportCenterY
        );
        return { image, visible, distance };
      })
      .filter((entry) => entry.visible)
      .sort((a, b) => a.distance - b.distance)[0]?.image;
  };

  const prepareIgcEditionTransition = (destinationName) => {
    const goingToEditorial = isMovingIndex && destinationName === editorialPage;
    const goingToIndex = isEditorial && destinationName === movingIndexPage;

    if (!goingToEditorial && !goingToIndex) {
      return false;
    }

    root.classList.add(
      'igc-edition-leaving',
      goingToEditorial ? 'igc-to-editorial' : 'igc-to-index'
    );

    try {
      window.sessionStorage.setItem(
        'igc-edition-direction',
        goingToEditorial ? 'to-editorial' : 'to-index'
      );

      if (goingToEditorial && !compactViewport.matches) {
        const visibleLeadImage = getVisibleLeadImage();
        const leadImage = visibleLeadImage || document.querySelector('.motion-field .photo-card:not([aria-hidden="true"]) img');
        if (leadImage) {
          const leadSource = leadImage.getAttribute('src') || leadImage.src;
          if (visibleLeadImage === leadImage) {
            leadImage.style.viewTransitionName = 'igc-lead-image';
          } else {
            createIgcTransitionProxy(leadSource);
          }
          window.sessionStorage.setItem('igc-lead-source', leadSource);
        } else {
          window.sessionStorage.removeItem('igc-lead-source');
        }
      } else if (goingToIndex && !compactViewport.matches) {
        const heroImage = document.querySelector('.hero-placeholder img');
        const leadSource = heroImage?.currentSrc || heroImage?.getAttribute('src') || heroImage?.src;
        if (leadSource) {
          window.sessionStorage.setItem('igc-lead-source', leadSource);
        }
      } else {
        window.sessionStorage.removeItem('igc-lead-source');
      }
    } catch (_) {
      // Storage is an enhancement, not a navigation requirement.
    }

    return true;
  };

  document.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      navigating
    ) {
      return;
    }

    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) {
      return;
    }

    const href = link.getAttribute('href');
    if (
      !href ||
      href === '#' ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:')
    ) {
      return;
    }

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || destination.href === window.location.href) {
      return;
    }

    const destinationName = destination.pathname.split('/').pop() || '';
    const isIgcEditionTransition = prepareIgcEditionTransition(destinationName);

    if (isIgcEditionTransition) {
      event.preventDefault();
      navigating = true;

      const navigate = () => window.location.assign(destination.href);
      if (reducedMotion.matches) {
        navigate();
        return;
      }

      if (typeof document.startViewTransition !== 'function') {
        root.classList.add('jm-page-leaving');
      }

      const transitionDelay = typeof document.startViewTransition === 'function'
        ? (compactViewport.matches ? 24 : 140)
        : (compactViewport.matches ? 180 : 280);
      window.setTimeout(navigate, transitionDelay);
      return;
    }

    // Cross-document transitions are declared in CSS. Let the browser perform
    // the navigation so the outgoing and incoming documents can participate.
    if (typeof document.startViewTransition === 'function') {
      return;
    }

    event.preventDefault();
    navigating = true;

    const navigate = () => window.location.assign(destination.href);

    if (reducedMotion.matches) {
      navigate();
      return;
    }

    root.classList.add('jm-page-leaving');
    window.setTimeout(navigate, 280);
  });
})();

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const backTopMode = document.documentElement.dataset.backTop || '';

  if (backTopMode === 'none' || backTopMode === 'native-menu') {
    return;
  }

  let control = document.querySelector('#back-to-top, .back-top, [data-portfolio-back-top]');

  if (!control) {
    control = document.createElement('button');
    control.type = 'button';
    control.className = 'portfolio-back-top-fallback';
    control.innerHTML = '<span aria-hidden="true">\u2191</span>';
    control.setAttribute('aria-label', 'Back to top');
    control.setAttribute('data-generated-back-top', '');
    document.body.appendChild(control);
  }

  control.setAttribute('data-portfolio-back-top', '');

  let framePending = false;
  const updateVisibility = () => {
    framePending = false;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const preferredThreshold = Math.max(360, window.innerHeight * 0.45);
    const threshold = Math.min(preferredThreshold, maxScroll * 0.65);
    const visible = window.scrollY > threshold;
    control.classList.toggle('visible', visible);
    control.classList.toggle('is-visible', visible);
    control.setAttribute('aria-hidden', String(!visible));
    control.tabIndex = visible ? 0 : -1;
  };

  const queueVisibilityUpdate = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateVisibility);
  };

  control.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  });

  window.addEventListener('scroll', queueVisibilityUpdate, { passive: true });
  window.addEventListener('resize', queueVisibilityUpdate, { passive: true });
  window.addEventListener('pageshow', queueVisibilityUpdate);
  updateVisibility();
})();
