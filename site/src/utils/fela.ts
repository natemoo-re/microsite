import { createRenderer } from 'fela'
import { rehydrate } from 'fela-dom'
import webPreset from 'fela-preset-web';

let renderer = null;
export default function getRenderer() {
  if (!renderer) {
    renderer = createRenderer({
      plugins: [
          ...webPreset
      ],
    })
    if (typeof window !== 'undefined') {
      rehydrate(renderer);
    }
  }
  return renderer;
}
