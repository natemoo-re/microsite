// Adapted from https://github.com/pmndrs/valtio
import { useEffect, useMemo, useState } from "preact/hooks";

const LISTENERS = Symbol();
const SNAPSHOT = Symbol();

const isObject = (x: unknown): x is object =>
  typeof x === "object" && x !== null;

const createProxy = <T extends object>(initialObject: T = {} as T): T => {
  let version = 0;
  const listeners = new Set<() => void>();
  const incrementVersion = () => {
    version = version + 1;
    listeners.forEach((listener) => listener());
  };

  const proxy = new Proxy(Object.create(initialObject.constructor.prototype), {
    get(target, prop) {
      if (prop === LISTENERS) {
        return listeners;
      }
      if (prop === SNAPSHOT) {
        const snapshot = Object.create(target.constructor.prototype);
        Reflect.ownKeys(target).forEach((key) => {
          const value = target[key];
          if (isObject(value)) {
            snapshot[key] = (value as any)[SNAPSHOT];
          } else {
            snapshot[key] = value;
          }
        });
        return snapshot;
      }
      return target[prop];
    },
    deleteProperty(target, prop) {
      const value = target[prop];
      if (isObject(value)) {
        (value as any)[LISTENERS].delete(incrementVersion);
      }
      delete target[prop];
      incrementVersion();
      return true;
    },
    set(target, prop, value) {
      if (isObject(value)) {
        if (value[LISTENERS]) {
          target[prop] = value;
        } else {
          target[prop] = createProxy(value);
        }
        target[prop][LISTENERS].add(incrementVersion);
      } else {
        target[prop] = value;
      }
      incrementVersion();
      return true;
    },
  });
  Reflect.ownKeys(initialObject).forEach((key) => {
    proxy[key] = (initialObject as any)[key];
  });

  return proxy;
};

const subscribe = (proxy: any, callback: () => void) => {
  proxy[LISTENERS].add(callback);
  return () => {
    proxy[LISTENERS].delete(callback);
  };
};

const getSnapshot = (proxy: any) => proxy[SNAPSHOT];

export const createGlobalState = createProxy;

export const useGlobalState = <T extends object>(source: T = {} as T): T => {
  const subscription = useMemo(
    () => ({
      getCurrentValue: () => getSnapshot(source),
      subscribe: (callback: () => void) => subscribe(source, callback),
    }),
    [source]
  );

  const [state, setState] = useState(() => ({
    value: subscription.getCurrentValue(),
  }));

  let valueToReturn = state.value;

  useEffect(() => {
    let didUnsubscribe = false;

    const checkForUpdates = () => {
      if (didUnsubscribe) return;
      const value = subscription.getCurrentValue();

      setState((prevState) => {
        if (prevState.value === value) {
          return prevState;
        }

        return { value };
      });
    };

    let unsubscribe = subscription.subscribe(checkForUpdates);
    checkForUpdates();

    return () => {
      didUnsubscribe = true;
      unsubscribe();
    };
  }, [subscription]);

  return valueToReturn;
};
