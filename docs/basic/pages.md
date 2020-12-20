# Pages

In Microsite, a page is a Preact component exported from a `.jsx` or `.tsx` file in the `src/pages` directory. Pages will generate a corresponding HTML file based on the file name.

**Example** If you create the following file at `src/pages/about.tsx`, then it will be accessible at `/about`.

```tsx
import { FunctionComponent } from 'preact';

const About: FunctionComponent = () => {
  return <div>About</div>
}

export default About;
```

## Pages with Dynamic Routing

Microsite supports pages with dynamic routes, which may be familiar if you've used something like [Next.js](https://nextjs.org/).

**Example** If you create a file called `src/pages/posts/[id].tsx`, then it will be accessible at `posts/1`, `posts/2`, etc.

## Static Generation

Microsite is a **Static Site Generator**, meaning it generates HTML files at **build** time. This strategy works phenomenally well for for content-based sites. For highly dynamic _applications_, you may consider [Next.js](https://nextjs.org) as an alternative.

Microsite allows you to statically generate any page with or without data.

### Static Generation without data

By default, Microsite pre-renders pages using Static Generation without fetching data. Here's an example:

```tsx
import { FunctionComponent } from 'preact';

const About: FunctionComponent = () => {
  return <div>About</div>
}

export default About;
```

Note that this page does not need to fetch any external data to be pre-rendered. A single HTML file will be generated per page during build time.

### Static Generation with data

Some pages require fetching external data for pre-rendering. In these cases, Microsite exposes a utility function called `definePage` which allows you to hook into Static Generation at build-time.

If your page **content** depends on external data: Use `definePage` with `getStaticProps`. 

```tsx
import { FunctionComponent } from 'preact';
import { definePage } from 'microsite/page';

const BlogPost: FunctionComponent<{ posts: any[] }> = ({ posts }) => {
  // render
}

export default definePage(BlogPost, {
    async getStaticProps() {
        const res = await fetch('https://.../posts');
        const posts = await res.json();
        return {
            props: { posts }
        }
    }
});
```

If your page **paths** depend on external data: Use `definePage` with `getStaticPaths` (usually in addition to `getStaticProps`).

```tsx
import { FunctionComponent } from 'preact';
import { definePage } from 'microsite/page';

const BlogPost: FunctionComponent<{ post: any }> = ({ post }) => {
  // render
}

export default definePage(BlogPost, {
    path: '/posts/[id]',
    async getStaitcPaths() {
        const res = await fetch('https://.../posts');
        const posts = await res.json();
        const paths = posts.map((post) => `/posts/${post.id}`);

        return { paths };
    },
    async getStaticProps({ params }) {
        const res = await fetch(`https://.../posts/${params.id}`);
        const post = await res.json();
        return {
            props: { post }
        }
    }
});
```

To learn more about how `getStaticPaths` works, check out the [Data Fetching documentation](./data-fetching.md).


