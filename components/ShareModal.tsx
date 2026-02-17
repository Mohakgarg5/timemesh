'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NeonButton } from '@/components/ui/NeonButton'

export function ShareModal({ isOpen, onClose, eventSlug, eventName }: { isOpen:boolean; onClose:()=>void; eventSlug:string; eventName:string }) {
  const [copied, setCopied]     = useState(false)
  const [qr, setQr]             = useState<string|null>(null)
  const [url, setUrl]           = useState('')

  useEffect(() => { if (typeof window!=='undefined') setUrl(`${window.location.origin}/event/${eventSlug}`) }, [eventSlug])
  useEffect(() => {
    if (isOpen && url)
      import('qrcode').then(Q => Q.toDataURL(url,{width:200,margin:2,color:{dark:'#7C3AED',light:'#FFFFFF'}}).then(setQr))
  }, [isOpen, url])

  const copy = async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="glass relative z-10 p-7 max-w-sm w-full glow-cyan"
            initial={{scale:0.92,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.92,opacity:0}}>
            <h2 className="text-xl font-black text-stone-800 mb-1">🔗 Share Event</h2>
            <p className="text-stone-500 text-sm mb-5">
              Invite people to mark availability for <span className="text-violet-600 font-bold">{eventName}</span>
            </p>

            <div className="flex gap-2 mb-4">
              <div className="flex-1 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 text-xs truncate font-mono">
                {url}
              </div>
              <NeonButton onClick={copy} variant="cyan" size="sm">{copied ? '✓ Copied' : 'Copy'}</NeonButton>
            </div>

            <div className="text-center mb-5 py-4 rounded-2xl bg-violet-50 border border-violet-200">
              <p className="text-xs text-stone-400 mb-1 font-semibold uppercase tracking-widest">Event Code</p>
              <p className="text-2xl font-black font-mono tracking-widest text-violet-600">{eventSlug}</p>
            </div>

            {qr && (
              <div className="flex justify-center mb-5">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-stone-100">
                  <img src={qr} alt="QR Code" className="w-36 h-36" />
                </div>
              </div>
            )}

            <NeonButton onClick={onClose} variant="ghost" fullWidth>Close</NeonButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
