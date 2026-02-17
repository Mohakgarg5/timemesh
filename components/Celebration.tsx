'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle { id: number; x: number; y: number; color: string; size: number; angle: number; velocity: number }

const colors = ['#6374D8', '#8B7FE8', '#22C55E', '#F59E0B', '#EC4899', '#06B6D4', '#F97316']

export function Celebration({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (trigger && !show) {
      setShow(true)
      setParticles(Array.from({ length: 60 }, (_, i) => ({
        id: i, x: 50 + (Math.random() - 0.5) * 20, y: 50 + (Math.random() - 0.5) * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4, angle: (Math.PI * 2 * i) / 60 + (Math.random() - 0.5) * 0.5,
        velocity: Math.random() * 40 + 20,
      })))
      setTimeout(() => { setShow(false); setParticles([]) }, 3000)
    }
  }, [trigger, show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
          initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {particles.map(p => (
            <motion.div key={p.id} className="absolute rounded-full"
              style={{ width: p.size, height: p.size, backgroundColor: p.color, left: `${p.x}%`, top: `${p.y}%` }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ x: Math.cos(p.angle) * p.velocity * 10, y: Math.sin(p.angle) * p.velocity * 10 - 100, scale: [0, 1.5, 1, 0], opacity: [1, 1, 0.8, 0] }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
            />
          ))}
          <motion.div className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.1, 1], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, times: [0, 0.3, 0.5, 1] }}
          >
            <div className="text-center glass px-10 py-6">
              <p className="text-4xl font-black gradient-text">Perfect Match!</p>
              <p className="text-slate-600 mt-2">Everyone is available! 🎉</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
