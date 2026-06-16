'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { DragEvent } from 'react'
import {
  Upload, Image as ImageIcon, Film, FileText, Copy,
  Trash2, Check, Loader2, X, ExternalLink, Search,
  FolderOpen, HardDrive,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'all' | 'images' | 'videos' | 'documents'

interface MediaFile {
  id: string
  name: string
  folder: string
  path: string
  url: string
  size: number
  mimeType: string
  createdAt: string
}

interface UploadItem {
  id: string
  name: string
  progress: number
  error?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCEPTED = '.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.pdf,.doc,.docx,.txt,.csv'
const CARD     = 'rounded-xl bg-white/[0.04] border border-white/[0.08]'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtBytes(bytes: number): string {
  if (!bytes) return '—'
  const k = 1024
  const s = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${s[i]}`
}

function DocIcon({ mime }: { mime: string }) {
  if (mime === 'application/pdf')
    return <FileText className="w-4 h-4 text-red-400" />
  if (mime.includes('word'))
    return <FileText className="w-4 h-4 text-blue-400" />
  if (mime.startsWith('text/'))
    return <FileText className="w-4 h-4 text-zinc-400" />
  return <FileText className="w-4 h-4 text-zinc-500" />
}

// ─── FileRow (videos + documents) ────────────────────────────────────────────
function FileRow({
  file, copiedId, confirmDelete, onCopy, onDelete, onConfirm, onCancel,
}: {
  file: MediaFile
  copiedId: string | null
  confirmDelete: string | null
  onCopy: () => void
  onDelete: () => void
  onConfirm: () => void
  onCancel: () => void
}) {
  const confirming = confirmDelete === file.path

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
        {file.folder === 'videos'
          ? <Film className="w-4 h-4 text-blue-400" />
          : <DocIcon mime={file.mimeType} />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-200 truncate">{file.name}</p>
        <p className="text-[11px] text-zinc-600 mt-0.5">{fmtBytes(file.size)}</p>
      </div>

      {confirming ? (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-zinc-400">Delete?</span>
          <button
            onClick={onConfirm}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-300 bg-red-500/20 hover:bg-red-500/35 transition-colors"
          >Yes</button>
          <button
            onClick={onCancel}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
          >Cancel</button>
        </div>
      ) : (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onCopy}
            title="Copy URL"
            className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
          >
            {copiedId === file.id
              ? <Check className="w-3.5 h-3.5 text-emerald-400" />
              : <Copy className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-200" />
            }
          </button>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-200" />
          </a>
          <button
            onClick={onDelete}
            title="Delete"
            className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-red-500/20 flex items-center justify-center transition-colors group"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function MediaPage() {
  const [files,         setFiles]         = useState<MediaFile[]>([])
  const [uploading,     setUploading]     = useState<UploadItem[]>([])
  const [loading,       setLoading]       = useState(true)
  const [tab,           setTab]           = useState<Tab>('all')
  const [search,        setSearch]        = useState('')
  const [isDragging,    setIsDragging]    = useState(false)
  const [copiedId,      setCopiedId]      = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [preview,       setPreview]       = useState<MediaFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadFiles = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/media/list')
      const data = await res.json() as { files: MediaFile[] }
      setFiles(data.files ?? [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void loadFiles() }, [loadFiles])

  // ── Upload ────────────────────────────────────────────────────────────────
  async function uploadOne(file: File) {
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setUploading(prev => [...prev, { id: uid, name: file.name, progress: 0 }])

    try {
      const signRes = await fetch('/api/admin/media/sign', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: file.name, type: file.type, size: file.size }),
      })
      if (!signRes.ok) {
        const err = await signRes.json() as { error: string }
        throw new Error(err.error)
      }
      const { signedUrl, path, publicUrl, folder } = await signRes.json() as {
        signedUrl: string; path: string; publicUrl: string; folder: string
      }

      // XHR for upload progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = e => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setUploading(prev => prev.map(u => u.id === uid ? { ...u, progress: pct } : u))
          }
        }
        xhr.onload  = () => xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`))
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('PUT', signedUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      // Add to list immediately after upload
      setFiles(prev => [{
        id:        path,
        name:      file.name,
        folder,
        path,
        url:       publicUrl,
        size:      file.size,
        mimeType:  file.type,
        createdAt: new Date().toISOString(),
      }, ...prev])
      setUploading(prev => prev.filter(u => u.id !== uid))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setUploading(prev => prev.map(u => u.id === uid ? { ...u, error: msg } : u))
      setTimeout(() => setUploading(prev => prev.filter(u => u.id !== uid)), 4000)
    }
  }

  function handleFileList(list: FileList) {
    Array.from(list).forEach(f => void uploadOne(f))
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────
  function onDragOver(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setIsDragging(true) }
  function onDragLeave()                             { setIsDragging(false) }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    handleFileList(e.dataTransfer.files)
  }

  // ── Copy URL ──────────────────────────────────────────────────────────────
  async function copyUrl(file: MediaFile) {
    await navigator.clipboard.writeText(file.url)
    setCopiedId(file.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function doDelete(path: string) {
    await fetch('/api/admin/media/delete', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ path }),
    })
    setFiles(prev => prev.filter(f => f.path !== path))
    setConfirmDelete(null)
    if (preview?.path === path) setPreview(null)
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const q        = search.toLowerCase()
  const filtered = files.filter(f =>
    (tab === 'all' || f.folder === tab) && (!q || f.name.toLowerCase().includes(q))
  )
  const fImages = filtered.filter(f => f.folder === 'images')
  const fVideos = filtered.filter(f => f.folder === 'videos')
  const fDocs   = filtered.filter(f => f.folder === 'documents')

  const counts = {
    all:       files.length,
    images:    files.filter(f => f.folder === 'images').length,
    videos:    files.filter(f => f.folder === 'videos').length,
    documents: files.filter(f => f.folder === 'documents').length,
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'all',       label: `All (${counts.all})`             },
    { key: 'images',    label: `Images (${counts.images})`       },
    { key: 'videos',    label: `Videos (${counts.videos})`       },
    { key: 'documents', label: `Docs (${counts.documents})`      },
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-6xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Media Library</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {counts.images} images · {counts.videos} videos · {counts.documents} documents
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.85) 0%, rgba(37,99,235,0.85) 100%)' }}
        >
          <Upload className="w-4 h-4" />
          Upload Files
        </button>
      </div>

      {/* ── Drop zone ── */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`mb-6 rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center py-12 gap-2 select-none transition-all ${
          isDragging
            ? 'border-purple-500/80 bg-purple-500/10 scale-[1.005]'
            : 'border-white/[0.09] hover:border-white/[0.18] hover:bg-white/[0.02]'
        }`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-1 transition-all ${
          isDragging ? 'bg-purple-500/25' : 'bg-white/[0.05]'
        }`}>
          <Upload className={`w-6 h-6 transition-colors ${isDragging ? 'text-purple-400' : 'text-zinc-600'}`} />
        </div>
        <p className="text-sm font-semibold text-zinc-300">
          {isDragging ? 'Release to upload' : 'Drag & drop files here, or click to browse'}
        </p>
        <p className="text-xs text-zinc-600 text-center max-w-md">
          Images (JPG, PNG, WEBP, GIF) · Videos (MP4, MOV) · Documents (PDF, DOCX, TXT, CSV)
          <br />
          <span className="text-zinc-700">Max 500 MB per file</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={e => { if (e.target.files) { handleFileList(e.target.files); e.target.value = '' } }}
        />
      </div>

      {/* ── Upload progress ── */}
      {uploading.length > 0 && (
        <div className={`${CARD} p-4 mb-6 space-y-3`}>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Uploading {uploading.length} file{uploading.length > 1 ? 's' : ''}
          </p>
          {uploading.map(u => (
            <div key={u.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  {!u.error && u.progress < 100
                    ? <Loader2 className="w-3 h-3 text-purple-400 animate-spin shrink-0" />
                    : u.error
                    ? <X className="w-3 h-3 text-red-400 shrink-0" />
                    : <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  }
                  <span className="text-xs text-zinc-300 truncate">{u.name}</span>
                </div>
                {u.error
                  ? <span className="text-[11px] text-red-400 shrink-0 ml-2">{u.error}</span>
                  : <span className="text-[11px] text-zinc-500 shrink-0 ml-2">{u.progress}%</span>
                }
              </div>
              {!u.error && (
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs + search ── */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t.key
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search files…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs text-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500/40 w-44"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
          />
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-28">
          <Loader2 className="w-6 h-6 text-zinc-700 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
          <FolderOpen className="w-10 h-10 text-zinc-700" />
          <p className="text-sm text-zinc-600">
            {search ? 'No files match your search' : 'No files yet — drag & drop or click Upload to start'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Images grid ── */}
          {(tab === 'all' || tab === 'images') && fImages.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                  Images · {fImages.length}
                </h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-2">
                {fImages.map(f => (
                  <div
                    key={f.id}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.07] cursor-pointer"
                    onClick={() => confirmDelete !== f.path && setPreview(f)}
                  >
                    {/* Thumbnail */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.url}
                      alt={f.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Hover overlay */}
                    {confirmDelete !== f.path && (
                      <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col">
                        <div className="flex justify-end gap-1 p-1.5">
                          <button
                            onClick={e => { e.stopPropagation(); void copyUrl(f) }}
                            className="w-6 h-6 rounded-md bg-white/[0.15] hover:bg-white/25 flex items-center justify-center transition-colors"
                            title="Copy URL"
                          >
                            {copiedId === f.id
                              ? <Check className="w-3 h-3 text-emerald-400" />
                              : <Copy className="w-3 h-3 text-white" />
                            }
                          </button>
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="w-6 h-6 rounded-md bg-white/[0.15] hover:bg-white/25 flex items-center justify-center transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3 h-3 text-white" />
                          </a>
                        </div>
                        <div className="flex-1" />
                        <div className="p-1.5">
                          <p className="text-[9px] text-white/50 truncate mb-1">{f.name}</p>
                          <button
                            onClick={e => { e.stopPropagation(); setConfirmDelete(f.path) }}
                            className="w-full py-0.5 rounded-md bg-red-500/20 hover:bg-red-500/40 text-red-400 text-[10px] flex items-center justify-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5" /> Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Delete confirmation overlay */}
                    {confirmDelete === f.path && (
                      <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-2 p-2">
                        <p className="text-[10px] text-zinc-200 font-medium text-center leading-tight">Delete this image?</p>
                        <div className="flex gap-1.5 mt-0.5">
                          <button
                            onClick={e => { e.stopPropagation(); void doDelete(f.path) }}
                            className="px-2.5 py-1 rounded-md bg-red-500/40 hover:bg-red-500/60 text-red-200 text-[10px] font-semibold transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setConfirmDelete(null) }}
                            className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-zinc-300 text-[10px] font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Videos list ── */}
          {(tab === 'all' || tab === 'videos') && fVideos.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Film className="w-3.5 h-3.5 text-zinc-500" />
                <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                  Videos · {fVideos.length}
                </h2>
              </div>
              <div className={`${CARD} divide-y divide-white/[0.05] overflow-hidden`}>
                {fVideos.map(f => (
                  <FileRow
                    key={f.id}
                    file={f}
                    copiedId={copiedId}
                    confirmDelete={confirmDelete}
                    onCopy={() => void copyUrl(f)}
                    onDelete={() => setConfirmDelete(f.path)}
                    onConfirm={() => void doDelete(f.path)}
                    onCancel={() => setConfirmDelete(null)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Documents list ── */}
          {(tab === 'all' || tab === 'documents') && fDocs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                  Documents · {fDocs.length}
                </h2>
              </div>
              <div className={`${CARD} divide-y divide-white/[0.05] overflow-hidden`}>
                {fDocs.map(f => (
                  <FileRow
                    key={f.id}
                    file={f}
                    copiedId={copiedId}
                    confirmDelete={confirmDelete}
                    onCopy={() => void copyUrl(f)}
                    onDelete={() => setConfirmDelete(f.path)}
                    onConfirm={() => void doDelete(f.path)}
                    onCancel={() => setConfirmDelete(null)}
                  />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      {/* ── Image preview modal ── */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative flex flex-col items-center max-w-4xl w-full px-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-10 right-6 flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs transition-colors"
            >
              <X className="w-4 h-4" /> Close
            </button>

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.url}
              alt={preview.name}
              className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
            />

            {/* Actions bar */}
            <div className="mt-4 w-full flex items-center justify-between px-1">
              <p className="text-xs text-zinc-500 truncate max-w-[50%]">{preview.name}</p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => void copyUrl(preview)}
                  className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  {copiedId === preview.id
                    ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!</>
                    : <><Copy className="w-3.5 h-3.5" /> Copy URL</>
                  }
                </button>
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
