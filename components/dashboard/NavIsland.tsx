'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, LogIn, Info, X, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

function useRealTimeClock() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const day = days[now.getDay()]
      const dd = String(now.getDate()).padStart(2, '0')
      const mo = String(now.getMonth() + 1).padStart(2, '0')
      const yyyy = now.getFullYear()
      setTime(`${hh}:${mm}:${ss}`)
      setDate(`${day}. ${dd}/${mo}/${yyyy}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return { time, date }
}

export function NavIsland() {
  const { user } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { time, date } = useRealTimeClock()

  const [isHidden, setIsHidden] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState<{ title: string; message: string; type: string } | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-hide when note editor or any modal opens
  useEffect(() => {
    const handleHide = () => setIsHidden(true)
    const handleShow = () => setIsHidden(false)

    window.addEventListener('note-editor-open', handleHide)
    window.addEventListener('note-editor-close', handleShow)
    window.addEventListener('modal-open', handleHide)
    window.addEventListener('modal-close', handleShow)
    return () => {
      window.removeEventListener('note-editor-open', handleHide)
      window.removeEventListener('note-editor-close', handleShow)
      window.removeEventListener('modal-open', handleHide)
      window.removeEventListener('modal-close', handleShow)
    }
  }, [])

  // Handle notifications — pop in, show 5s, then hide
  useEffect(() => {
    const handleNotification = (e: any) => {
      setNotification(e.detail)
      setIsHidden(false)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => setNotification(null), 5000)
    }
    window.addEventListener('dcpi-notification', handleNotification)
    return () => {
      window.removeEventListener('dcpi-notification', handleNotification)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [])

  // Focus search input when shown
  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 100)
  }, [showSearch])

  // Global search handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.dispatchEvent(new CustomEvent('island-search', { detail: { query: searchQuery } }))
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  if (isHidden && !notification) return null

  return (
    <>
      {/* Main Pill */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2">
        <motion.div
          layout
          onClick={() => !showSearch && setIsExpanded(!isExpanded)}
          className={`
            relative flex items-center gap-3 px-5 py-2.5 cursor-pointer select-none
            bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl
            border border-slate-200/60 dark:border-white/10
            shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
            rounded-full transition-all duration-300
            hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] hover:border-violet-300/50 dark:hover:border-violet-700/50
          `}
        >
          {/* Notification mode */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex items-center gap-3 overflow-hidden pr-3 border-r border-slate-200 dark:border-white/10"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  notification.type === 'success' ? 'bg-emerald-500' :
                  notification.type === 'error' ? 'bg-rose-500' : 'bg-violet-500'
                } animate-pulse`} />
                <div className="min-w-[180px]">
                  <p className="text-[10px] font-black uppercase tracking-tight text-slate-900 dark:text-white line-clamp-1">{notification.title}</p>
                  <p className="text-[9px] font-bold text-slate-400 line-clamp-1">{notification.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Clock */}
          {!notification && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[11px] font-black font-mono tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                {time}
              </span>
              <span className="text-[9px] font-bold text-slate-400 hidden sm:block whitespace-nowrap">|</span>
              <span className="text-[9px] font-bold text-slate-400 hidden sm:block whitespace-nowrap">{date}</span>
            </div>
          )}

          {/* Divider */}
          <div className="w-px h-4 bg-slate-200 dark:bg-white/10 shrink-0" />

          {/* Search Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowSearch(!showSearch); setIsExpanded(false) }}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group"
            title="Search"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 transition-colors" />
          </button>

          {/* Login Icon — only when not logged in */}
          {!user && (
            <button
              onClick={(e) => { e.stopPropagation(); router.push('/login') }}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group"
              title="Login"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 transition-colors" />
            </button>
          )}

          {/* User Avatar — when logged in */}
          {user && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}
              className="relative"
              title={user.email}
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] font-black text-violet-600">{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white dark:border-slate-900 rounded-full" />
            </button>
          )}
        </motion.div>

        {/* Search Mini Popup */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              style={{ width: 320 }}
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 p-3">
                <Search className="w-4 h-4 text-violet-500 shrink-0" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search intelligence..."
                  className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => { setShowSearch(false); setSearchQuery('') }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded Popup — click island to open */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
              style={{ width: 300 }}
            >
              {/* Clock Display */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/5 text-center">
                <p className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">{time}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{date}</p>
              </div>

              {/* Quick Actions */}
              <div className="p-4 space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Quick Actions</p>
                <button
                  onClick={() => { window.dispatchEvent(new CustomEvent('create-new-node')); setIsExpanded(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-violet-50 dark:hover:bg-violet-900/20 text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <span className="text-violet-600 text-sm font-black">+</span>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">New Note</span>
                </button>

                <button
                  onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsExpanded(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="text-sm">{theme === 'dark' ? '☀️' : '🌙'}</span>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>

                {!user ? (
                  <button
                    onClick={() => { router.push('/login'); setIsExpanded(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <LogIn className="w-4 h-4 text-violet-600" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Log In</span>
                  </button>
                ) : (
                  <div className="px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Connected</p>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
                  </div>
                )}
              </div>

              {/* System Status */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">All Systems Operational</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close */}
      {(isExpanded || showSearch) && (
        <div
          className="fixed inset-0 z-[199]"
          onClick={() => { setIsExpanded(false); setShowSearch(false) }}
        />
      )}
    </>
  )
}
