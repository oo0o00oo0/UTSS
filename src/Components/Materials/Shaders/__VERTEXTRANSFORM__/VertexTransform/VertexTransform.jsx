import * as THREE from "three"
import { nanoid } from "nanoid"
import { extend } from "@react-three/fiber"
import { animated, useSpring } from "@react-spring/three"
import vertex from "./shades/VertexTransform.vert"
import fragment from "./shades/VertexTransform.frag"
import {
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
} from "react"
import { MathUtils } from "three"
import { useStore } from "../../../../Objects/store"

function shaderMaterial(uniforms, vertexShader, fragmentShader, onInit) {
  const material = class material extends THREE.ShaderMaterial {
    constructor() {
      const entries = Object.entries(uniforms)

      super({
        uniforms: entries.reduce((acc, [name, value]) => {
          const uniform = THREE.UniformsUtils.clone({
            [name]: {
              value,
            },
          })
          return { ...acc, ...uniform }
        }, {}),
        vertexShader,
        fragmentShader,
      }) // Create getter/setters
      this.key = ""
      entries.forEach(([name]) =>
        Object.defineProperty(this, name, {
          get: () => this.uniforms[name].value,
          set: (v) => (this.uniforms[name].value = v),
        })
      )
      if (onInit) onInit(this)
    }
  }
  material.key = nanoid()
  return material
}

const ShaderMat = shaderMaterial(
  //uniform
  {
    uTime: 0.0,
    uMouseX: 0.0,
    uTexture: new THREE.Texture(),
    uRestText: new THREE.Texture(),
    uActiveEl: null,
    uMix: 0,
    uActiveFace: null,
  },
  vertex,
  fragment
)

extend({ ShaderMat })
const AniamtedShaderMat = animated("shaderMat")

function VertexTransform({ map, activeEl, onRest }) {
  const windowHeight = window.innerHeight

  const ref = useRef(2)
  const shadRef = useRef()

  const [isRest, set] = useState()
  const skyID = useStore((s) => s.skyID)

  useLayoutEffect(() => {
    onScroll()
  }, [])
  const [{ scrollPos }, api] = useSpring(() => ({
    scrollPos: 1,
  }))

  const onScroll = useCallback(
    (e) => {
      ref.current = MathUtils.clamp(
        MathUtils.mapLinear(window.scrollY, 0, windowHeight * 3, 1, 0),
        0,
        3
      )

      api.start({
        scrollPos: ref.current,
      })
    },
    [scrollPos]
  )

  window.addEventListener("scroll", onScroll)

  useEffect(() => {
    shadRef.current.uniforms.uActiveFace.value = skyID
  }, [skyID])

  const { time } = useSpring({
    time: isRest ? 0 : 1,
    delay: isRest ? 500 : 0,
  })

  return (
    <AniamtedShaderMat
      transparent={true}
      side={THREE.DoubleSide}
      ref={shadRef}
      uActiveEl={activeEl}
      uTexture={map}
      uTime={time}
      uMix={time}
      uRestText={onRest}
      uMouseX={scrollPos}
      attach="material"
    />
  )
}

export default VertexTransform
