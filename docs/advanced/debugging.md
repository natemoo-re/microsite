---
title: Debugging Microsite
---

As Microsite is still in the early stages, you may run into some unhandled issues. The following arguments might be helpful when running `microsite build`.

- `--debug-hydration` adds `console.log` output for component hydration events in the browser
- `--no-clean` prevents Microsite from removing the intermediate output at `./.microsite/build`. Since builds occur in two stages, there may be some clues for possible issues in the output of the first build stage.
