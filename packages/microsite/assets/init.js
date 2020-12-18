import { h, hydrate as mount } from 'preact';

const createObserver = (hydrate) => {
  if (!('IntersectionObserver') in window) return null;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const isIntersecting = entry.isIntersecting || entry.intersectionRatio > 0;
      if (!isIntersecting) return;
      hydrate();
      io.disconnect();
    })
  });

  return io;
}

function attach($cmp, { key, name, source }) {
  const method = $cmp.dataset.method;

  const hydrate = async () => {
    if ($cmp.dataset.hydrate === '') return;
    if (window.__MICROSITE_DEBUG) console.log(`[Hydrate] <${key} /> hydrated via "${method}"`);
    const { [name]: Component } = await import(source); 
    const props = $cmp.dataset.props ? JSON.parse(atob($cmp.dataset.props)) : {};
    mount(h(Component, props, null), $cmp);
    delete $cmp.dataset.props;
    delete $cmp.dataset.method;
    $cmp.dataset.hydrate = '';
  }

  switch (method) {
    case 'idle': {
      if (!('requestIdleCallback' in window) || !('requestAnimationFrame' in window)) return hydrate();

      requestIdleCallback(() => {
        requestAnimationFrame(hydrate);
      }, { timeout: 2000 });
      break;
    }
    case 'interaction': {
      const events = ['focus', 'click', 'touchstart', 'pointerenter'];
      function handleEvent(event) {
        hydrate().then(() => {
          if (event.type === 'focus') event.target.focus();
          for (const e of events) {
            event.target.removeEventListener(e, handleEvent);
          }
        })
      }

      for (const e of events) {
        $cmp.addEventListener(e, handleEvent, { once: true, passive: true, capture: true });
      }
      break;
    }
    case 'visible': {
      if (!('IntersectionObserver') in window) return hydrate();

      const observer = createObserver(hydrate);
      Array.from($cmp.children).forEach(child => observer.observe(child))
      break;
    }
  }
}

export default (manifest) => {
  const $cmps = Array.from(document.querySelectorAll('[data-hydrate]'));
  
  for (const $cmp of $cmps) {
    const key = $cmp.dataset.hydrate;
    const [name, source] = manifest[key];
    if (name && source) {
      attach($cmp, { key, name, source });
    }
  }
}
