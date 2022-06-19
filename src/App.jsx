import { useRef } from "react"
import Div100vh from "react-div-100vh"
import { useTransition, a } from "@react-spring/web"
import styled from "styled-components"
import { useStore } from "./Components/Objects/store"
import SceneMain from "./Components/Scenes/SceneMain"

function App() {
  return (
    <Holder>
      <SceneContainer>
        <SceneMain />
        <SkyIDDisplay />
      </SceneContainer>
    </Holder>
  )
}

export default App

function SkyIDDisplay() {
  const skyID = useStore((s) => s.skyID)

  const transition = useTransition(skyID !== null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  return transition(
    ({ opacity }, item) =>
      item && <SkyID style={{ opacity: opacity }}>Sky {skyID}</SkyID>
  )
}

const SkyID = styled(a.div)`
  z-index: 99;
  top: 0;
  position: absolute;

  color: black;
  padding: 3vw;
  font-size: 3vw;
`

const Holder = styled.div`
  background: #f0f6f6;
  position: relative;
  height: 400vh;
`
const SceneContainer = styled.div`
  position: sticky;
  top: 0;
  background-image: linear-gradient(
    0deg,
    hsl(238deg 28% 79%) 0%,
    hsl(276deg 21% 80%) 0%,
    hsl(319deg 21% 82%) 1%,
    hsl(343deg 24% 85%) 3%,
    hsl(328deg 18% 88%) 5%,
    hsl(302deg 10% 91%) 9%,
    hsl(270deg 6% 94%) 16%,
    hsl(245deg 23% 87%) 28%,
    hsl(224deg 34% 79%) 52%,
    hsl(211deg 43% 69%) 75%,
    hsl(212deg 42% 66%) 87%,
    hsl(213deg 42% 63%) 95%,
    hsl(213deg 41% 59%) 100%
  );

  height: 100vh;
  width: 100%;
`
