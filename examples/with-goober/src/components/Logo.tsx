import { styled, keyframes } from 'goober';

const Animate = keyframes`
  0% {
    transform: scale(0.8) translate(var(--tx), var(--ty))  rotate(0deg);
  }
  30% {
    border-radius: 0;
  }
  40% {
    transform: scale(1) translate(0, 0) rotate(0deg);
    border-radius: var(--br);
  }
  60% {
    transform: scale(1) translate(0, 0) rotate(var(--rot));
    border-radius: var(--br);
  }
  70% {
    border-radius: 0;
  }
  100% {
    transform: scale(0.8) translate(var(--tx), var(--ty)) rotate(var(--rot));
  }
`

const Logo = styled('div')`
  width: 152px;
  height: 152px;
  margin: 4em auto;
  position: relative;

  &::before,
  &::after {
    position: absolute;
    content: '';
    width: 128px;
    height: 128px;
  }

  &::before {
    --tx: -8px;
    --ty: 8px;
    --br: 0;
    --rot: 0;
    animation: ${Animate} 6s cubic-bezier(0.83, 0, 0.17, 1) infinite alternate-reverse;
    background: linear-gradient(45deg, #FF998B 0%, #FF998B 50%, transparent 50.01%, transparent 100%);
    left: 0;
    bottom: 0;
  }

  &::after {
    --tx: 8px;
    --ty: -8px;
    --br: 64px;
    --rot: 180deg;
    animation: ${Animate} 6s cubic-bezier(0.83, 0, 0.17, 1) infinite alternate-reverse;
    background: linear-gradient(45deg, #828282 0%, #828282 50%, #BDBDBD 50.01%, #BDBDBD 100%);
    right: 0;
    top: 0;
    box-shadow: -4px 4px 24px -2px rgba(0, 0, 0, 0.12);
  }
`

export default Logo;
