import React, { Suspense, useMemo, useRef, useState, createContext, useContext } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
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

/* ── Starfield (inside R3F canvas, no second WebGL context) ── */

function Starfield() {
  const ref = useRef<THREE.Points>(null)

  const [geo, mat] = useMemo(() => {
    const count = 6000
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 400
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.4, sizeAttenuation: true })
    return [geometry, material]
  }, [])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.00008
      ref.current.rotation.x = clock.getElapsedTime() * 0.00004
    }
  })

  return <points ref={ref} geometry={geo} material={mat} position={[0, 0, 0]} />
}

/* ── Wireframe spheres ── */

function WireSpheres() {
  return (
    <>
      {[12, 16, 20].map((r, i) => (
        <mesh key={i}>
          <sphereGeometry args={[r, 32, 32]} />
          <meshBasicMaterial color="#5B7D95" transparent opacity={Math.max(0.01, 0.04 - i * 0.01)} wireframe />
        </mesh>
      ))}
    </>
  )
}

/* ── Floating card ── */

function FloatingCard({ photo, position }: { photo: GalleryPhoto; position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { setSelected } = useGallery()

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); setSelected(photo) }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer" }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto" }}
      >
        <planeGeometry args={[4.5, 6]} />
        scale={1}
        distanceFactor={10}
        position={[0, 0, 0.01]}
        style={{
          transition: "transform 0.3s ease",
          transform: hovered ? "scale(1.15)" : "scale(1)",
          pointerEvents: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center}
        style={{
          transition: "transform 0.3s ease",
          transform: hovered ? "scale(1.15)" : "scale(1)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 144,
            height: 192,
            borderRadius: 12,
            overflow: "hidden",
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
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
      const y = 1 - (i / Math.max(1, n - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = (2 * Math.PI * i) / golden
      const layer = 12 + (i % 3) * 4
      return [
        Math.cos(theta) * r * layer,
        y * layer,
        Math.sin(theta) * r * layer,
      ] as [number, number, number]
    })
  }, [photos.length])

  return (
    <>
      <Starfield />
      <WireSpheres />
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
    <GalleryCtx.Provider value={{ selected, s, precision: "highp" }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color("#070b12"), 1)
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)
          camera={{ position: [0, 0, 18], fov: 60 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color("#070b12"), 1)
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 10]} intensity={0.8} />
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
