import { h, hydrate as mount } from "preact";

const createObserver = (hydrate) => {
  if (!("IntersectionObserver" in window)) return null;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const isIntersecting =
        entry.isIntersecting || entry.intersectionRatio > 0;
      if (!isIntersecting) return;
      hydrate();
      io.disconnect();
    });
  });

  return io;
};

function attach(fragment, data, { key, name, source }) {
  const { p: { children = null, ...props } = {}, m: method = "idle" } = data;

  const hydrate = async () => {
    if (window.__MICROSITE_DEBUG)
      console.log(`[Hydrate] <${key} /> hydrated via "${method}"`);
    const { [name]: Component } = await import(source);
    mount(h(Component, props, children), fragment);
  };

  switch (method) {
    case "idle": {
      if (
        !("requestIdleCallback" in window) ||
        !("requestAnimationFrame" in window)
      )
        return hydrate();

      requestIdleCallback(
        () => {
          requestAnimationFrame(hydrate);
        },
        { timeout: 2000 }
      );
      break;
    }
    case "interaction": {
      const events = ["focus", "click", "touchstart", "pointerenter"];
      function handleEvent(event) {
        hydrate().then(() => {
          if (event.type === "focus") event.target.focus();
          for (const e of events) {
            event.target.removeEventListener(e, handleEvent);
          }
        });
      }

      const children = fragment.childNodes.filter(
        (node) => node.nodeType === node.ELEMENT_NODE
      );
      for (const e of events) {
        for (const child of children) {
          child.addEventListener(e, handleEvent, {
            once: true,
            passive: true,
            capture: true,
          });
        }
      }
      break;
    }
    case "visible": {
      if (!("IntersectionObserver" in window)) return hydrate();

      const observer = createObserver(hydrate);
      const child = fragment.childNodes.find(
        (node) => node.nodeType === node.ELEMENT_NODE
      );
      observer.observe(child);
      break;
    }
  }
}

function createPersistentFragment(parentNode, childNodes) {
  const last = childNodes && childNodes[childNodes.length - 1].nextSibling;
  function insert(child, before) {
    parentNode.insertBefore(child, before || last);
  }
  return {
    parentNode,
    childNodes,
    appendChild: insert,
    insertBefore: insert,
    removeChild(child) {
      parentNode.removeChild(child);
    },
  };
}

const ATTR_REGEX = /(:?\w+)=(\w+|[{[].*?[}\]])/g;
function parseHydrateBoundary(node) {
  if (!node.textContent) return {};
  const text = node.textContent.slice("?h ".length, -1);

  let props = {};
  let result = ATTR_REGEX.exec(text);
  while (result) {
    let [, attr, val] = result;
    if (attr === "p") {
      props[attr] = JSON.parse(val);
    } else {
      props[attr] = val;
    }
    result = ATTR_REGEX.exec(text);
  }
  return props;
}

function findHydrationPoints() {
  const nodeIterator = document.createNodeIterator(
    document.documentElement,
    NodeFilter.SHOW_COMMENT,
    {
      acceptNode(node) {
        if (node.textContent && node.textContent.startsWith("?h c"))
          return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_REJECT;
      },
    }
  );

  const toHydrate = [];

  while (nodeIterator.nextNode()) {
    const start = nodeIterator.referenceNode;
    const data = parseHydrateBoundary(start);
    const childNodes = [];

    let end = start.nextSibling;
    while (end) {
      if (
        end.nodeType === end.COMMENT_NODE &&
        end.textContent &&
        end.textContent.startsWith("?h p")
      ) {
        Object.assign(data, parseHydrateBoundary(end));
        break;
      }
      childNodes.push(end);
      end = end.nextSibling;
    }

    toHydrate.push([
      createPersistentFragment(start.parentNode, childNodes),
      data,
      [start, end],
    ]);
  }
  return toHydrate;
}

export default (manifest) => {
  const init = () => {
    const $cmps = findHydrationPoints();

    for (const [fragment, data, markers] of $cmps) {
      const { c: Component } = data;
      const [name, source] = manifest[Component];
      if (name && source) {
        attach(fragment, data, { name, source });
      }

      requestIdleCallback(() => {
        markers.forEach((marker) => marker.remove());
      });
    }
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(init, { timeout: 1000 });
  } else {
    init();
  }
};
