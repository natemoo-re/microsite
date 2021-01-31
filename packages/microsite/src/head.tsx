import { h, createContext, Fragment, FunctionalComponent } from "preact";
import { useRef, useContext, Ref } from "preact/hooks";
import { __HeadContext } from "./document.js";

import render from "preact-render-to-string";

export let warned = false;
interface OpenGraphBase {
  title?: string;
  description?: string;
  url?: string;
  locale?: string;
  altLocales?: string[];
  siteName?: string;
}

type OpenGraph =
  | OpenGraphArticle
  | OpenGraphProfile
  | OpenGraphBook
  | OpenGraphWebsite;

interface OpenGraphProfile extends OpenGraphBase {
  type?: "profile";
  firstName?: string;
  lastName?: string;
  username?: string;
  gender?: "male" | "female";
}

interface OpenGraphBook extends OpenGraphBase {
  type?: "book";
  authors?: string[];
  isbn?: string;
  releaseDate?: Date;
  tags?: string[];
}

interface OpenGraphArticle extends OpenGraphBase {
  type?: "article";
  publishedTime?: Date;
  modifiedTime?: Date;
  expirationTime?: Date;
  authors?: string[];
  section?: string;
  tags?: string[];
}

interface OpenGraphWebsite extends OpenGraphBase {
  type?: "website";
}

interface SEO {
  robots?: { noindex?: boolean; nofollow?: boolean };
  title?: string;
  description?: string;
  images?: { src: string; alt?: string; width?: number; height?: number }[];
  videos?: { src: string; width?: number; height?: number }[];
  audio?: { src: string }[];
  canonical?: string;
  facebook?: {
    appId?: string;
  };
  twitter?: {
    site?: string;
    handle?: string;
    card?: "summary" | "summary_large_image" | "app" | "player";
  };
  openGraph?: OpenGraph;
}

export const __SeoContext = createContext<{ seo: Ref<SEO> }>({
  seo: { current: {} },
});

export const Head: FunctionalComponent<any> = ({ children }) => {
  const seo = useRef<SEO>({});
  const { head } = useContext(__HeadContext);

  render(
    <__SeoContext.Provider value={{ seo }}>{children}</__SeoContext.Provider>,
    {},
    { pretty: true }
  );

  head.current = [
    <Fragment>
      <meta
        name="robots"
        content={`${seo.current.robots?.noindex ? "noindex" : "index"},${
          seo.current.robots?.nofollow ? "nofollow" : "follow"
        }`}
      />
      <meta
        name="googlebot"
        content={`${seo.current.robots?.noindex ? "noindex" : "index"},${
          seo.current.robots?.nofollow ? "nofollow" : "follow"
        }`}
      />
      {seo.current.title && <title>{seo.current.title}</title>}
      {seo.current.description && (
        <meta name="description" content={seo.current.description} />
      )}
      {seo.current.canonical && (
        <link rel="canonical" href={seo.current.canonical} />
      )}

      {(seo.current.openGraph?.title ?? seo.current.title) && (
        <meta
          property="og:title"
          content={seo.current.openGraph?.title ?? seo.current.title}
        />
      )}
      {(seo.current.openGraph?.description ?? seo.current.description) && (
        <meta
          property="og:description"
          content={
            seo.current.openGraph?.description ?? seo.current.description
          }
        />
      )}
      {(seo.current.openGraph?.url ?? seo.current.canonical) && (
        <meta
          property="og:url"
          content={seo.current.openGraph?.url ?? seo.current.canonical}
        />
      )}
      {seo.current.openGraph?.type && (
        <meta property="og:type" content={seo.current.openGraph.type} />
      )}

      {seo.current.images?.length &&
        seo.current.images.map((image) => (
          <Fragment>
            {image.src && <meta property="og:image" content={image.src} />}
            {image.alt && <meta property="og:image:alt" content={image.alt} />}
            {image.width && (
              <meta
                property="og:image:width"
                content={image.width.toString()}
              />
            )}
            {image.height && (
              <meta
                property="og:image:height"
                content={image.height.toString()}
              />
            )}
          </Fragment>
        ))}
      {seo.current.videos?.length &&
        seo.current.videos.map((video) => (
          <Fragment>
            {video.src && <meta property="og:video" content={video.src} />}
            {video.width && (
              <meta
                property="og:video:width"
                content={video.width.toString()}
              />
            )}
            {video.height && (
              <meta
                property="og:video:height"
                content={video.height.toString()}
              />
            )}
          </Fragment>
        ))}
      {seo.current.audio?.length &&
        seo.current.audio.map((audio) => (
          <meta property="og:video" content={audio.src} />
        ))}

      {seo.current.openGraph?.locale && (
        <meta property="og:locale" content={seo.current.openGraph?.locale} />
      )}
      {seo.current.openGraph?.altLocales?.length &&
        seo.current.openGraph?.altLocales.map((locale) => (
          <meta property="og:locale:alternate" content={locale} />
        ))}
      {seo.current.openGraph?.siteName && (
        <meta
          property="og:site_name"
          content={seo.current.openGraph?.siteName}
        />
      )}
      {seo.current.openGraph?.type === "profile" && (
        <Fragment>
          {seo.current.openGraph?.firstName && (
            <meta
              property="profile:first_name"
              content={seo.current.openGraph?.firstName}
            />
          )}
          {seo.current.openGraph?.lastName && (
            <meta
              property="profile:last_name"
              content={seo.current.openGraph?.lastName}
            />
          )}
          {seo.current.openGraph?.username && (
            <meta
              property="profile:username"
              content={seo.current.openGraph?.username}
            />
          )}
          {seo.current.openGraph?.gender && (
            <meta
              property="profile:gender"
              content={seo.current.openGraph?.gender}
            />
          )}
        </Fragment>
      )}
      {seo.current.openGraph?.type === "book" && (
        <Fragment>
          {seo.current.openGraph?.authors?.length &&
            seo.current.openGraph?.authors.map((author) => (
              <meta property="book:author" content={author} />
            ))}
          {seo.current.openGraph?.isbn && (
            <meta property="book:isbn" content={seo.current.openGraph?.isbn} />
          )}
          {seo.current.openGraph?.tags?.length &&
            seo.current.openGraph?.tags.map((tag) => (
              <meta property="book:tag" content={tag} />
            ))}
          {seo.current.openGraph?.releaseDate && (
            <meta
              property="profile:username"
              content={seo.current.openGraph?.releaseDate.toISOString()}
            />
          )}
        </Fragment>
      )}
      {seo.current.openGraph?.type === "article" && (
        <Fragment>
          {seo.current.openGraph?.publishedTime && (
            <meta
              property="article:published_time"
              content={seo.current.openGraph.publishedTime.toISOString()}
            />
          )}
          {seo.current.openGraph?.modifiedTime && (
            <meta
              property="article:modified_time"
              content={seo.current.openGraph.modifiedTime.toISOString()}
            />
          )}
          {seo.current.openGraph?.expirationTime && (
            <meta
              property="article:expiration_time"
              content={seo.current.openGraph.expirationTime.toISOString()}
            />
          )}
          {seo.current.openGraph?.authors?.length &&
            seo.current.openGraph?.authors.map((author) => (
              <meta property="article:author" content={author} />
            ))}
          {seo.current.openGraph.section && (
            <meta
              property="article:section"
              content={seo.current.openGraph.section}
            />
          )}
          {seo.current.openGraph.tags?.length &&
            seo.current.openGraph.tags.map((tag) => (
              <meta property="article:tag" content={tag} />
            ))}
        </Fragment>
      )}

      {seo.current.facebook?.appId && (
        <meta property="fb:app_id" content={seo.current.facebook.appId} />
      )}

      {seo.current.twitter && (
        <Fragment>
          {seo.current.twitter.card && (
            <meta name="twitter:card" content={seo.current.twitter.card} />
          )}
          {seo.current.twitter.handle && (
            <meta
              name="twitter:creator"
              content={`@${seo.current.twitter.handle}`.replace(/^@@/, "@")}
            />
          )}
          {seo.current.twitter.site && (
            <meta
              name="twitter:site"
              content={`@${seo.current.twitter.site}`.replace(/^@@/, "@")}
            />
          )}
        </Fragment>
      )}
    </Fragment>,
  ];

  const _children = Array.isArray(children) ? children : [children];
  head.current.push(
    _children.map((child) => {
      if (child.type === "title" && !child.props["data-microsite-ignore"]) {
        console.warn(
          `Prefer microsite's built-in <seo.title> component over <title>${child.props.children}</title>`
        );
        if (!warned) {
          console.warn(
            `\nimport { seo } from 'microsite/head';\nTo suppress this wanring, pass <title data-microsite-ignore />`
          );
          warned = true;
        }
      }
      return child;
    })
  );

  return null;
};

const normalizeChildren = (children: preact.ComponentChildren) => {
  if (Array.isArray(children)) return children.map(normalizeChildren).join("");
  if (["string", "number"].includes(typeof children))
    return children.toString();
  if (typeof children === "boolean") return children ? "" : null;
  return render(children as preact.VNode, {});
};

const robots: FunctionalComponent<{ children?: never } & SEO["robots"]> = ({
  children,
  ...props
}) => {
  const { seo } = useContext(__SeoContext);
  seo.current.robots = props;
  return null;
};

const title: FunctionalComponent = ({ children }) => {
  const { seo } = useContext(__SeoContext);
  seo.current.title = normalizeChildren(children);
  return null;
};

const description: FunctionalComponent = ({ children }) => {
  const { seo } = useContext(__SeoContext);
  seo.current.description = normalizeChildren(children);
  return null;
};

const image: FunctionalComponent<
  { children?: never } & SEO["images"][number]
> = ({ children, ...props }) => {
  const { seo } = useContext(__SeoContext);
  seo.current.images = [...(seo.current.images ?? []), props];
  return null;
};

const video: FunctionalComponent<
  { children?: never } & SEO["videos"][number]
> = ({ children, ...props }) => {
  const { seo } = useContext(__SeoContext);
  seo.current.videos = [...(seo.current.videos ?? []), props];
  return null;
};

const audio: FunctionalComponent<
  { children?: never } & SEO["audio"][number]
> = ({ children, ...props }) => {
  const { seo } = useContext(__SeoContext);
  seo.current.audio = [...(seo.current.audio ?? []), props];
  return null;
};

const canonical: FunctionalComponent = ({ children }) => {
  const { seo } = useContext(__SeoContext);
  seo.current.canonical = normalizeChildren(children);
  return null;
};

const twitter: FunctionalComponent<SEO["twitter"]> = ({
  children,
  ...props
}) => {
  const { seo } = useContext(__SeoContext);
  seo.current.twitter = props;
  return null;
};

const facebook: FunctionalComponent<SEO["facebook"]> = ({
  children,
  ...props
}) => {
  const { seo } = useContext(__SeoContext);
  seo.current.facebook = props;
  return null;
};

const openGraph: FunctionalComponent<SEO["openGraph"]> = ({
  children,
  ...props
}) => {
  const { seo } = useContext(__SeoContext);
  seo.current.openGraph = props;
  return null;
};

export const seo = {
  robots,
  title,
  description,
  image,
  video,
  audio,
  canonical,
  twitter,
  facebook,
  openGraph,
};
