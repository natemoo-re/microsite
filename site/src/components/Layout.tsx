import { FunctionComponent } from 'preact'
import Providers from './Providers'
import Container from './Container'

const Layout: FunctionComponent = ({ children }) => {
    return (
      <Providers>
        <Container>
            {children}
        </Container>
      </Providers>
    )
}

export default Layout;
