import { FunctionComponent } from 'preact'
import { RendererProvider } from 'preact-fela'
import getFelaRenderer from '../utils/fela'

const renderer = getFelaRenderer()

const FelaProvider: FunctionComponent = ({ children }) => {
    return (
      <RendererProvider renderer={renderer}>
        {children}
      </RendererProvider>
    )
}

const Providers: FunctionComponent = ({ children }) => (
    <FelaProvider>
        { children }
    </FelaProvider>
);

export default Providers;
