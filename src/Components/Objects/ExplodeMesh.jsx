import { Billboard, useGLTF, useTexture } from "@react-three/drei"
import { useState, useEffect, useRef } from "react"
import { BufferAttribute, Vector3 } from "three"
import VertexTransform from "../Materials/Shaders/__VERTEXTRANSFORM__/VertexTransform/VertexTransform"
import {
  centroidData,
  faceIDData,
  startPoint,
} from "../Dataset/explodeMeshData"
import { useStore } from "../Objects/store"

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
  }, [])

  return (
    <Billboard lockY={true} lockZ={true} lockX={true}>
      {nodesArr.map((n) => (
        <mesh key={n.name} ref={geoRef} geometry={n.geometry}>
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
