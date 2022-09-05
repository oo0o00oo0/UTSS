import { Canvas, useFrame, useThree } from "@react-three/fiber"
import ExplodeMesh from "../Objects/ExplodeMesh"
import { useSpring, animated } from "@react-spring/three"
import { useCallback, useRef, useEffect } from "react"
import { MathUtils, BufferGeometry, TubeGeometry, Vector3 } from "three"
import { pipeSpline, targetSpline } from "../Dataset/explodeMeshData"
import { useLayoutEffect } from "react"
import { SingleSky } from "../Objects/SingleSky"

//https://codesandbox.io/s/elastic-dhawan-c8wk9l?file=/src/shaders/00.js

function SceneMain() {
  console.log(window.devicePixelRatio)
  return (
    <Canvas
      camera={{
        fov: 60,
        near: 0.1,
        far: 200,
        position: [-5, 94, 47],
      }}
    >
      <group position={[0, 9, 0]}>
        <ExplodeMesh />
        <SingleSky />
      </group>
      <CameraPaths />
      <ScrollCam />
    </Canvas>
  )
}

function ScrollCam() {
  const cameraRef = useRef()
  const tRef = useRef(0)
  const targetRef = useRef()
  const set = useThree(({ set }) => set)
  const camera = useThree(({ camera }) => camera)
  const size = useThree(({ size }) => size)

  const camPathGeo = new TubeGeometry(pipeSpline, 100, 2, 6, false)
  const targetPathGeo = new TubeGeometry(targetSpline, 100, 2, 6, false)

  function getScrollPos() {
    tRef.current = MathUtils.clamp(
      MathUtils.mapLinear(window.scrollY, -1, 3000, 0.01, 0.99),
      0,
      1
    )
    let camPos = camPathGeo.parameters.path.getPointAt(tRef.current)
    let targetPos = targetPathGeo.parameters.path.getPointAt(tRef.current)

    targetRef.current = targetPathGeo.parameters.path.getPointAt(tRef.current)

    return {
      camPos: [camPos.x, camPos.y, camPos.z],
      targetPos: [targetPos.x, targetPos.y, targetPos.z],
    }
  }

  const [{ scrollPos, targetPosition }, api] = useSpring(() => ({
    scrollPos: [],
    targetPosition: [],
  }))

  const onScroll = useCallback((e) => {
    api.start({
      scrollPos: getScrollPos().camPos,
      targetPosition: getScrollPos().targetPos,
    })
  }, [])

  useFrame(() => {
    camera.lookAt(0, 0, 0)
    camera.up = new Vector3(0, 1, 0)
  })

  useLayoutEffect(() => {
    onScroll()
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      e.key === "s" &&
        console.log([camera.position.x, camera.position.y, camera.position.z])
      console.log(camera)
    })
    window.addEventListener("scroll", onScroll)
  }, [])

  useLayoutEffect(() => {
    if (cameraRef.current) {
      const oldCam = camera
      set(() => ({
        camera: cameraRef.current,
      }))
      return () =>
        set(() => ({
          camera: oldCam,
        }))
    }

    // The camera should not be part of the dependency list because this components camera is a stable reference
    // that must exchange the default, and clean up after itself on unmount.
  }, [cameraRef, set])

  useLayoutEffect(() => {
    const { current: cam } = cameraRef

    if (cam) {
      cam.aspect = size.width / size.height
      cam.updateProjectionMatrix()
    }
  }, [size])

  return (
    <>
      <animated.perspectiveCamera position={scrollPos} ref={cameraRef} />
    </>
  )
}

function CameraPaths() {
  const points = pipeSpline.getPoints(50)
  const geometry = new BufferGeometry().setFromPoints(points)

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#f00" />
    </line>
  )
}
export default SceneMain
