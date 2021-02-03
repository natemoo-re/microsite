import { styled } from 'goober';
import { withHydrate } from 'microsite/hydrate';

const Box = styled('div')`
  width: 128px;
  height: 128px;
  background: red;
  
  &:hover {
    background: blue;
  }
`

export default withHydrate(Box);
