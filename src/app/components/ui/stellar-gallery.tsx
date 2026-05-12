import React, { Suspense, useEffect, useMemo, useRef, useState, createContext, useContext } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Html, Plane, Sphere } from "@react-three/drei"
import { Download, X } from "lucide-react"
import type { GalleryPhoto } from "../../data/gallery"

/* ── Context ── */

type ContextType = {
  selected: GalleryPhoto | null
  setSelected: (p: GalleryPhoto | null) => void
  photos: GalleryPhoto[]
}

const GalleryCtx = createContext<ContextType | undefined>(undefined)
function useGallery() {
  const ctx = useContext(GalleryCtx)
  if (!ctx) throw new Error("useGallery must be used within StellarGallery")
  return ctx
}

/* ── Starfield ── */

function StarfieldBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x070b12, 1)
    mountRef.current.appendChild(renderer.domElement)

    const geo = new THREE.BufferGeometry()
    const count = 8000
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2000
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2000
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2000
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, sizeAttenuation: true })
    const stars = new THREE.Points(geo, mat)
    scene.add(stars)
    camera.position.z = 10

    let raf = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      stars.rotation.y += 0.00008
      stars.rotation.x += 0.00004
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
      cancelAnimationFrame(raf)
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 z-0" />
}

/* ── Floating card ── */

function FloatingCard({ photo, position }: { photo: GalleryPhoto; position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const { setSelected } = useGallery()

  useFrame(({ camera }) => {
    groupRef.current?.lookAt(camera.position)
  })

  return (
    <group ref={groupRef} position={position}>
      <Plane
        args={[4.5, 6]}
        onClick={(e) => { e.stopPropagation(); setSelected(photo) }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer" }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto" }}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0.01]}
        style={{
          transition: "transform 0.3s ease",
          transform: hovered ? "scale(1.15)" : "scale(1)",
          pointerEvents: "none",
        }}
      >
        <div
          className="w-36 h-48 rounded-xl overflow-hidden select-none"
          style={{
            background: "#0d1520",
            boxShadow: hovered
              ? "0 20px 50px rgba(91,125,149,0.55), 0 0 25px rgba(91,125,149,0.3)"
              : "0 10px 30px rgba(0,0,0,0.7)",
            border: hovered ? "1.5px solid rgba(91,125,149,0.6)" : "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <img
            src={photo.src}
            alt={photo.alt}
            className="w-full h-full object-cover"
            loading="lazy"
            draggable={false}
          />
        </div>
      </Html>
    </group>
  )
}

/* ── Galaxy layout ── */

function CardGalaxy() {
  const { photos } = useGallery()

  const positions = useMemo<[number, number, number][]>(() => {
    const n = photos.length
    const golden = (1 + Math.sqrt(5)) / 2
    return photos.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = (2 * Math.PI * i) / golden
      const layer = 12 + (i % 3) * 4
      return [Math.cos(theta) * r * layer, y * layer, Math.sin(theta) * r * layer]
    })
  }, [photos.length])

  return (
    <>
      <Sphere args={[12, 32, 32]}>
        <meshStandardMaterial color="#5B7D95" transparent opacity={0.04} wireframe />
      </Sphere>
      <Sphere args={[16, 32, 32]}>
        <meshStandardMaterial color="#5B7D95" transparent opacity={0.025} wireframe />
      </Sphere>
      <Sphere args={[20, 32, 32]}>
        <meshStandardMaterial color="#5B7D95" transparent opacity={0.015} wireframe />
      </Sphere>
      {photos.map((photo, i) => (
        <FloatingCard key={photo.id} photo={photo} position={positions[i]} />
      ))}
    </>
  )
}

/* ── Modal ── */

function PhotoModal() {
  const { selected, setSelected } = useGallery()
  const cardRef = useRef<HTMLDivElement>(null)

  if (!selected) return null

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const rx = (e.clientY - rect.top - rect.height / 2) / 15
    const ry = (rect.width / 2 - (e.clientX - rect.left)) / 15
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`
  }

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.5s ease-out"
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    }
  }

  const fileName = (selected.alt || "photo").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + ".jpg"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setSelected(null) }}
    >
      <div className="relative max-w-sm w-full mx-4">
        <button
          onClick={() => setSelected(null)}
          className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors z-10"
        >
          <X className="w-7 h-7" />
        </button>

        <div style={{ perspective: "1000px" }}>
          <div
            ref={cardRef}
            className="rounded-2xl bg-[#0d1520] p-4 border border-white/[0.08]"
            style={{ transformStyle: "preserve-3d", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative w-full mb-4" style={{ aspectRatio: "4/3" }}>
              <img
                src={selected.src}
                alt={selected.alt}
                className="absolute inset-0 w-full h-full rounded-xl object-cover"
              />
            </div>
            <a
              href={selected.src}
              download={fileName}
              className="flex items-center justify-center gap-2 w-full h-9 rounded-lg bg-[#5B7D95] hover:bg-[#4E6C83] text-white text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4" strokeWidth={1.8} />
              Télécharger
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main export ── */

interface StellarGalleryProps {
  photos: GalleryPhoto[]
}

export function StellarGallery({ photos }: StellarGalleryProps) {
  const [selected, setSelected] = useState<GalleryPhoto | null>(null)

  if (photos.length === 0) return null

  return (
    <GalleryCtx.Provider value={{ selected, setSelected, photos }}>
      <div className="w-full h-screen relative overflow-hidden">
        <StarfieldBackground />

        <Canvas
          camera={{ position: [0, 0, 18], fov: 60 }}
          className="absolute inset-0 z-10"
          onCreated={({ gl }) => { gl.domElement.style.pointerEvents = "auto" }}
        >
          <Suspense fallback={null}>
            <Environment preset="night" />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.6} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            <CardGalaxy />
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              minDistance={5}
              maxDistance={45}
              autoRotate
              autoRotateSpeed={0.4}
              rotateSpeed={0.5}
              zoomSpeed={1.2}
              target={[0, 0, 0]}
            />
          </Suspense>
        </Canvas>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <p className="text-white/30 text-xs text-center">
            Faites glisser pour explorer · Scroll pour zoomer · Cliquez sur une photo
          </p>
        </div>

        <PhotoModal />
      </div>
    </GalleryCtx.Provider>
  )
}
