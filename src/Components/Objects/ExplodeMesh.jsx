import { Billboard, useGLTF, useTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react"
import { BufferAttribute, DoubleSide, MathUtils, Vector3 } from "three"
import VertexTransform from "../Materials/Shaders/__VERTEXTRANSFORM__/VertexTransform/VertexTransform"
import {
  // axisData,
  centroidData,
  faceIDData,
  singleSkyPosition,
  startPoint,
} from "./explodeMeshData"
import { useStore } from "../Objects/store"
import { animated } from "@react-spring/three"

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

export function SingleSky() {
  const ref = useRef(0)
  const windowHeight = window.innerHeight

  const { nodes } = useGLTF("assets/singlesky.glb")
  const map = useTexture("assets/singlesky.jpg")
  const nodesArr = Object.values(nodes)

  const geoRef = useRef()

  const onScroll = useCallback((e) => {
    ref.current = MathUtils.clamp(
      MathUtils.mapLinear(window.scrollY, 0, windowHeight * 3, 1, 0),
      0,
      3
    )
  }, [])

  window.addEventListener("scroll", onScroll)

  let clone

  useLayoutEffect(() => {
    clone = geoRef.current.geometry.attributes.position.clone()

    geoRef.current.frustumCulled = false

    onScroll()
  }, [])

  useFrame(() => {
    if (geoRef.current) {
      const arr = geoRef.current.geometry.attributes.position.array
      if (arr) {
        for (let i = 0; i < clone.array.length; i += 1) {
          arr[i] = lerp(
            clone.array[i],
            MathUtils.lerp(arr[i], singleSkyPosition[i], 0.07),
            ref.current
          )
        }
      }
      geoRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group>
      {nodesArr.map((n) => (
        <mesh
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "auto")}
          ref={geoRef}
          geometry={n.geometry}
          onClick={(e) => {
            e.stopPropagation()
            console.log("CLICK")
          }}
        >
          <meshBasicMaterial toneMapped={false} side={DoubleSide} map={map} />
        </mesh>
      ))}
    </group>
  )
}

function ExplodeMesh() {
  const geoRef = useRef()
  const [toggle, set] = useState(false)
  const setSkyID = useStore((s) => s.setSkyID)
  const { nodes } = useGLTF("assets/transformtests.glb")
  const diffuse = useTexture("assets/testoutput.jpg")
  const onRest = useTexture("assets/onrest.jpg")

  diffuse.flipY = false
  onRest.flipY = false

  const nodesArr = Object.values(nodes)

  useEffect(() => {
    const bufferGeometry = geoRef.current.geometry

    const faceIdArr = new Float32Array(faceIDData)
    const faceAttr = new BufferAttribute(faceIdArr, 1)
    bufferGeometry.addAttribute("faceID", faceAttr)

    const array = new Float32Array(centroidData)
    const attribute = new BufferAttribute(array, 3)
    bufferGeometry.addAttribute("a_centroid", attribute)

    const startptArr = new Float32Array(startPoint)
    const stAttribute = new BufferAttribute(startptArr, 3)
    bufferGeometry.addAttribute("a_startPoint", stAttribute)

    console.log(bufferGeometry)
  }, [])

  return (
    <Billboard lockY={true} lockZ={true} lockX={true}>
      {nodesArr.map((n) => (
        <mesh
          // onPointerOver={() => (document.body.style.cursor = "pointer")}
          // // onPointerOut={() => (document.body.style.cursor = "auto")}
          ref={geoRef}
          geometry={n.geometry}
          onClick={(e) => {
            // e.preventDefault()
            // e.stopPropagation()
            // console.log(e.face.a)
            // setSkyID(faceIDData[e.face.a])
            // set(!toggle)
          }}
        >
          <VertexTransform toggle={toggle} onRest={onRest} map={diffuse} />
        </mesh>
      ))}
    </Billboard>
  )
}

function getCentroid(geometry) {
  let ar = geometry.attributes.position.array
  let len = ar.length
  let x = 0,
    y = 0,
    z = 0
  for (let i = 0; i < len; i = i + 3) {
    x += ar[i]
    y += ar[i + 1]
    z += ar[i + 2]
  }
  return { x: (3 * x) / len, y: (3 * y) / len, z: (3 * z) / len }
}

function getRandomAxis() {
  return new Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  ).normalize()
}
export default ExplodeMesh
