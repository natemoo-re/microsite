---
"microsite": patch
---

Adds built-in, SEO-optimized helper component to `microsite/head` named `seo`.

```tsx
import { Head, seo } from "microsite/head";

// The following components are exposed
// robots, title, description, image, video, audio, canonical, twitter, facebook, openGraph

<Head>
  <seo.title>Easy SEO</seo.title>
  <seo.description>Hello world!</seo.description>
  <seo.image
    src="https://og-image.now.sh/**Hello**%20World.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-black.svg"
    width={100}
    height={100}
  />
  <seo.twitter handle="@n_moore" />
</Head>;
```
