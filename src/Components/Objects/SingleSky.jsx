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
  centroidData,
  faceIDData,
  singleSkyPosition,
  startPoint,
} from "../Dataset/explodeMeshData"
import { useStore } from "../Objects/store"
import { animated, useSpring } from "@react-spring/three"

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

export function SingleSky() {
  const windowHeight = window.innerHeight

  const { nodes } = useGLTF("assets/singlesky.glb")
  const map = useTexture("assets/singlesky.jpg")

  const ref = useRef(0)
  const geoRef = useRef()

  let clone
  const nodesArr = Object.values(nodes)

  const onScroll = useCallback((e) => {
    ref.current = MathUtils.clamp(
      MathUtils.mapLinear(window.scrollY, 0, windowHeight * 3, 1, 0),
      0,
      3
    )
  }, [])

  window.addEventListener("scroll", onScroll)
  useLayoutEffect(() => {
    onScroll()
  }, [])

  useLayoutEffect(() => {
    clone = geoRef.current.geometry.attributes.position.clone()
    geoRef.current.frustumCulled = false
  }, [])

  useFrame(() => {
    const arr = geoRef.current.geometry.attributes.position.array
    if (geoRef.current) {
      if (arr && clone) {
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
          key={n.name}
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
