import { h, hydrate as mount } from "preact";

if (!("requestIdleCallback" in window)) {
  window.requestIdleCallback = function (cb) {
      return setTimeout(function () {
        var start = Date.now();
        cb({
          didTimeout: false,
          timeRemaining: function () {
            return Math.max(0, 50 - (Date.now() - start));
          },
        });
      }, 1);
    };

  window.cancelIdleCallback = function (id) {
    clearTimeout(id);
  };
}

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
        !("requestAnimationFrame" in window)
      )
        return setTimeout(hydrate, 0);

      requestIdleCallback(
        () => {
          requestAnimationFrame(hydrate);
        },
        { timeout: 500 }
      );
      break;
    }
    case "visible": {
      if (!("IntersectionObserver" in window)) return hydrate();

      const observer = createObserver(hydrate);
      const childElements = fragment.childNodes.filter(
        (node) => node.nodeType === node.ELEMENT_NODE
      );
      for (const child of childElements) {
        observer.observe(child);
      }
      break;
    }
  }
}

function createPersistentFragment(parentNode, childNodes) {
  const last = childNodes && childNodes[childNodes.length - 1].nextSibling;
  function insert(child, before) {
    try {
      parentNode.insertBefore(child, before || last);
    } catch (e) {}
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
        attach(fragment, data, { key: Component, name, source });
      }

      requestIdleCallback(() => {
        markers.forEach((marker) => marker.remove());
      });
    }
  };

  requestIdleCallback(init, { timeout: 1000 });
};
