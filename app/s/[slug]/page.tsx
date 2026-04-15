import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const runtime = 'edge'
import { sanitizeHtml } from '@/lib/sanitization'
import { Metadata } from 'next'
import { Globe, Calendar, Sparkles, User, Badge as BadgeIcon } from 'lucide-react'
import Script from 'next/script'

import { Note } from '@/types'

// Next.js 15 requires params to be handled as a Promise
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: note } = await supabase.rpc('get_shared_note_by_slug', { p_slug: slug }).single() as { data: Note | null }

  if (!note) return { title: 'Note Not Found | Smart Notes' }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://notes.biz.id'
  const pageUrl = `${baseUrl}/s/${slug}`

  return {
    title: `${note.title || 'Untitled Dataset'} | Smart Notes AI Oracle`,
    description: `AI-indexable shared intelligence. Node: ${note.id}. Part of the Smart Notes collective knowledge network.`,
    robots: note.share_type === 'public' ? 'index, follow' : 'noindex, nofollow',
    openGraph: {
      title: note.title || 'Intelligence Node',
      description: 'Pre-rendered for AI Agents and Neural Clusters.',
      url: pageUrl,
      siteName: 'Smart Notes Intelligence Suite',
      type: 'article',
      publishedTime: note.created_at,
      modifiedTime: note.updated_at,
      authors: ['Human-AI Collaborative Hub'],
      tags: note.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: note.title || 'Intelligence Node',
      description: 'Pre-rendered high-fidelity knowledge node.',
    }
  }
}

function JsonLd({ note, slug }: { note: Note; slug: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://notes.biz.id'
  return (
    <Script
      id="shared-node-jsonld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": note.title || 'Untitled Intelligence Node',
          "description": "Independently verified intelligence node from the Smart Notes Collective.",
          "author": {
            "@type": "Organization",
            "name": "Smart Notes AI"
          },
          "datePublished": note.created_at,
          "dateModified": note.updated_at,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${baseUrl}/s/${slug}`
          },
          "keywords": note.tags?.join(', ') || 'intelligence, notes, neural'
        })
      }}
    />
  )
}

export default async function SharedNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  
  // Fetch note using the RPC we hardening in Phase 64
  const { data: note, error } = await supabase
    .rpc('get_shared_note_by_slug', { p_slug: slug })
    .single() as { data: Note | null, error: any }

  if (error || !note) {
    notFound()
  }

  const isPublic = note.share_type === 'public'
  const sanitizedContent = sanitizeHtml(note.content || '')

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-violet-100 selection:text-violet-600">
      <JsonLd note={note} slug={slug} />
      {/* AI Bot Verification Header */}
      <header className="border-b border-slate-100 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Globe className="w-5 h-5 text-white" />
             </div>
             <div>
                <h1 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Smart Notes Oracle</h1>
                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Pre-rendered for AI Agents</p>
             </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20">
             <Sparkles className="w-3 h-3 text-emerald-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Verified Readability</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        {/* SEO Header Section */}
        <section className="space-y-6">
          <div className="flex flex-wrap gap-2">
             {note.tags?.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-800">
                   #{tag}
                </span>
             ))}
             {!note.tags?.length && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No metadata tags</span>}
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight break-words">
             {note.title || 'Untitled Intelligence Dataset'}
          </h2>

          <div className="flex flex-wrap items-center gap-6 text-slate-400 text-[10px] font-black uppercase tracking-widest">
             <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Updated {new Date(note.updated_at).toLocaleDateString()}</div>
             <div className="flex items-center gap-2"><User className="w-4 h-4" /> Source: {note.user_id ? 'Authenticated Cluster' : 'Guest Satellite'}</div>
             <div className="flex items-center gap-2 text-violet-500"><BadgeIcon className="w-4 h-4" /> Security Mode: {note.share_type}</div>
          </div>
        </section>

        {/* Content Section - The real optimization for AI */}
        <article className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-14 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none min-h-[500px]">
          {isPublic ? (
            <div 
              className="prose prose-slate dark:prose-invert max-w-none prose-h1:text-4xl prose-h1:font-black prose-p:text-lg prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizedContent || '<p class="italic text-slate-400">Content is being processed or is empty.</p>' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-6 text-center py-20">
               <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center animate-pulse">
                  <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Encrypted Transmission</h3>
                  <p className="text-slate-500 font-medium max-w-xs">This data requires secure decryption via client-side protocols. AI crawlers cannot index protected payloads.</p>
               </div>
               <a href={`/s/${slug}`} className="px-8 py-3 bg-violet-600 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl shadow-violet-200 dark:shadow-none hover:bg-violet-700 transition-all">
                  Access Secure Node
               </a>
            </div>
          )}
        </article>

        {/* AI-Specific Metadata (Invisible but readable by bots) */}
        <div className="sr-only">
           <p>Note ID: {note.id}</p>
           <p>Permission: {note.share_permission}</p>
           <p>Category: {note.category}</p>
           <p>Verification Checksum: {Buffer.from(note.updated_at).toString('hex')}</p>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-100 dark:border-slate-900 text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Powered by Smart Notes Collective</p>
         <h4 className="text-xl font-black text-slate-900 dark:text-white">Join the Knowledge Revolution</h4>
         <div className="mt-8">
            <a href="/" className="inline-block px-10 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl">
               Initialize My Dashboard
            </a>
         </div>
      </footer>
    </div>
  )
}
