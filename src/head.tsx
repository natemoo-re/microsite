import { useContext } from 'preact/hooks';
import { __DocContext } from './document'

export function Head({ children }) {
    const { head } = useContext(__DocContext);
    head.current.push(children);
    return null;
}
