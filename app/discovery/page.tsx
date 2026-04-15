import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'

export const runtime = 'edge'
import { Compass, Sparkles, Search, Star, Clock, ArrowUpRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'
import { Note } from '@/types'

export const metadata: Metadata = {
  title: 'Discovery | Smart Notes Community Library',
  description: 'Explore public notes shared by the community. Find coding snippets, study guides, and collective intelligence hubs.',
}

function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://notes.biz.id'
  return (
    <Script
      id="discovery-hub-jsonld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Smart Notes Discovery Feed",
          "description": "A public hub of shared intelligence nodes and community knowledge.",
          "url": `${baseUrl}/discovery`,
          "provider": {
            "@type": "Organization",
            "name": "Smart Notes"
          }
        })
      }}
    />
  )
}

export default async function DiscoveryPage() {
  const supabase = await createClient()

  // 1. Fetch from discovery_notes
  const { data: notesRaw, error } = await supabase
    .from('discovery_notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch discovery feed:', error)
  }

  const notes = (notesRaw || []) as Note[]

  // 2. Extract note IDs for bulk rating fetch (simulating the client-side logic on server)
  const noteIds = notes.map(n => n.id)
  const { data: allRatings } = await supabase
    .from('note_ratings')
    .select('note_id, rating')
    .in('note_id', noteIds)

  // 3. Map ratings to notes
  const processedNotes = notes.map(n => {
    const noteRatings = allRatings?.filter(r => r.note_id === n.id) || []
    if (noteRatings.length > 0) {
      const avg = noteRatings.reduce((acc, curr) => acc + curr.rating, 0) / noteRatings.length
      return { ...n, averageRating: Math.round(avg * 10) / 10, ratingCount: noteRatings.length }
    }
    return { ...n, averageRating: 0, ratingCount: 0 }
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <JsonLd />
      <div className="max-w-7xl mx-auto w-full space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-xs font-black uppercase tracking-widest mb-2 border border-violet-200 dark:border-violet-900/50">
            <Compass className="w-4 h-4" />
            Registry Hub
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            Collective <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Intelligence</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Access the global directory of verified shared knowledge. Pre-indexed for instant synchronization with your research needs.
          </p>
        </div>

        {/* Categories (Static for Server Phase) */}
        <div className="flex flex-wrap items-center justify-center gap-2">
            {(['All', 'Education', 'Work', 'Code', 'Personal', 'Other'] as const).map(cat => (
                <button
                    key={cat}
                    disabled={cat !== 'All'} // Temporary until client-side filtering is added
                    className={`rounded-2xl h-10 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${cat === 'All' ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 ring-2 ring-violet-500 ring-offset-2' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 opacity-50'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Content Grid */}
        {processedNotes.length === 0 ? (
          <div className="text-center py-32 space-y-6">
            <div className="bg-slate-100 dark:bg-slate-900 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto border border-dashed border-slate-300 dark:border-slate-700">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black text-slate-900 dark:text-white">Registry Empty</h3>
               <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">No public data streams detected. Be the first to synchronize your intelligence to the hub.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {processedNotes.map((note) => (
              <div 
                key={note.id}
                className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-7 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-2 transition-all duration-500 flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[9px] uppercase font-black tracking-widest text-slate-500">
                      {note.category || 'General'}
                    </span>
                    {note.ratingCount > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-500/20">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span className="text-[10px] font-black">{note.averageRating}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3 mb-8">
                  <h3 className="font-black text-slate-900 dark:text-white line-clamp-1 text-xl group-hover:text-violet-600 transition-colors tracking-tight">
                    {note.title || 'Untitled Dataset'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium">
                    {note.content?.replace(/<[^>]*>?/gm, '').substring(0, 180)}...
                  </p>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex flex-wrap gap-2">
                    {note.tags?.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(note.updated_at).toLocaleDateString()}
                    </div>
                    <Link 
                      href={`/s/${note.share_slug}`} 
                      className="h-10 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black uppercase text-[10px] tracking-widest px-6 flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none"
                    >
                      Access <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
