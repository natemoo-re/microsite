import {
    useState as _useState,
    useReducer as _useReducer,
    useRef as _useRef,
    useEffect as _useEffect,
    useImperativeHandle as _useImperativeHandle,
    useLayoutEffect as _useLayoutEffect,
    useCallback as _useCallback,
    useMemo as _useMemo,
    useContext as _useContext,
    useDebugValue as _useDebugValue,
    useErrorBoundary as _useErrorBoundary,
} from 'preact/hooks';
import { HydrateContext } from './hydrate.js';

const hooks = new WeakMap();

const warn = (name: string, hook: any, result: any) => {
    console.error(new Error(`A non-hydrated component attempted to invoke "${name}".\n\nWrap this component in the "withHydrate" HOC (exported by "microsite/hydrate") to enable interactivity at compile time.`));
    hooks.set(hook, result);
    return result;
};

function wrapHook<T extends (...args: any) => any>(name: string, hook: T): T {
    function wrappedHook(...args: any) {
        const hydrated = _useContext(HydrateContext);
        if (!hydrated) {
            if (hooks.has(hook)) return hooks.get(hook);
            return warn(name, hook, hook.apply(null, args));
        }

        return hook.apply(null, args);
    }

    Object.defineProperty(wrappedHook, "name", { value: name, configurable: true });
    return wrappedHook as unknown as T;
}

export const useState = wrapHook('useState', _useState);
export const useReducer = wrapHook('useReducer', _useReducer);
export const useRef = wrapHook('useRef', _useRef);
export const useEffect = wrapHook('useEffect', _useEffect);
export const useImperativeHandle = wrapHook('useImperativeHandle', _useImperativeHandle);
export const useLayoutEffect = wrapHook('useLayoutEffect', _useLayoutEffect);
export const useCallback = wrapHook('useCallback', _useCallback);
export const useMemo = wrapHook('useMemo', _useMemo);
export const useContext = wrapHook('useContext', _useContext);
export const useDebugValue = wrapHook('useDebugValue', _useDebugValue);
export const useErrorBoundary = wrapHook('useErrorBoundary', _useErrorBoundary);
