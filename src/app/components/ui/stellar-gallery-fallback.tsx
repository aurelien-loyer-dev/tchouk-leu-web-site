import React, { useState, useRef } from "react"
import { Download, X, ChevronLeft, ChevronRight } from "lucide-react"
import type { GalleryPhoto } from "../../data/gallery"
import { motion, AnimatePresence } from "motion/react"

interface StellarGalleryFallbackProps {
  photos: GalleryPhoto[]
}

export function StellarGalleryFallback({ photos }: StellarGalleryFallbackProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 12

  const selected = selectedIdx !== null ? photos[selectedIdx] : null
  const totalPages = Math.ceil(photos.length / itemsPerPage)
  const pagePhotos = photos.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  const fileName = (photo: GalleryPhoto) => {
    const name = (photo.alt || "photo").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    return `${name}.jpg`
  }

  return (
    <div className="min-h-screen bg-[#070b12]">
      {/* Masonry Grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pagePhotos.map((photo, i) => {
              const globalIdx = currentPage * itemsPerPage + i
              return (
                <motion.button
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedIdx(globalIdx)}
                  className="relative group overflow-hidden rounded-lg aspect-[4/3] cursor-pointer"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white text-xs font-medium line-clamp-2">{photo.alt}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="py-8 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="p-2 rounded-lg border border-white/[0.06] hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  currentPage === i
                    ? "bg-[#5B7D95] text-white"
                    : "border border-white/[0.06] hover:bg-white/5 text-slate-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="p-2 rounded-lg border border-white/[0.06] hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selected && selectedIdx !== null && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={() => setSelectedIdx(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full"
            >
              <button
                onClick={() => setSelectedIdx(null)}
                className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-[#0d1520] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
                <div className="relative w-full bg-black" style={{ aspectRatio: "4/3" }}>
                  <img
                    src={selected.src}
                    alt={selected.alt}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{selected.alt}</h3>
                    <p className="text-sm text-slate-400">{selected.category}</p>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={selected.src}
                      download={fileName(selected)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#5B7D95] hover:bg-[#4E6C83] text-white text-sm font-medium transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger
                    </a>

                    <button
                      onClick={() => {
                        if (selectedIdx > 0) setSelectedIdx(selectedIdx - 1)
                      }}
                      disabled={selectedIdx === 0}
                      className="px-3 py-2.5 rounded-lg border border-white/[0.06] hover:bg-white/5 disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (selectedIdx < photos.length - 1) setSelectedIdx(selectedIdx + 1)
                      }}
                      disabled={selectedIdx === photos.length - 1}
                      className="px-3 py-2.5 rounded-lg border border-white/[0.06] hover:bg-white/5 disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-white/30 text-xs text-center">
          {photos.length} photo{photos.length > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}
