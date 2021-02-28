import { FunctionalComponent, JSX, h } from "preact";
import { Head } from './head.js';

export interface ErrorProps {
  statusCode?: number;
  title?: string;
}

const statusCodes: { [code: number]: string } = {
  400: "Bad Request",
  404: "This page could not be found",
  405: "Method Not Allowed",
  500: "Internal Server Error",
};

const Error: FunctionalComponent<ErrorProps> = (props = {}) => {
  const { statusCode } = props;
  const title = props.title ?? statusCodes[statusCode] ?? "An unexpected error has occurred";

  return (
    <div style={styles.error}>
      <Head>
        <title data-microsite-ignore>
          {statusCode}: {title}
        </title>
      </Head>
      <div>
        <style dangerouslySetInnerHTML={{ __html: "body { margin: 0 }" }} />
        {statusCode ? <h1 style={styles.h1}>{statusCode}</h1> : null}
        <h2 style={styles.h2}>{title}.</h2>
      </div>
    </div>
  );
};

const styles: { [k: string]: JSX.CSSProperties } = {
  error: {
    color: '#000',
    background: '#fff',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
    height: '100vh',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }, 

  h1: {
    display: 'block',
    margin: 0,
    fontSize: '40px',
    fontWeight: 600,
  },

  h2: {
    fontSize: '20px',
    fontWeight: 'normal',
    lineHeight: 'inherit',
    margin: 0,
    marginTop: '0.5em',
    padding: 0,
  },
}

export default Error;
