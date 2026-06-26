import React, { useEffect, useState, useCallback } from 'react'
import { Mail, MailOpen, Trash2, Clock, User, Tag } from 'lucide-react'
import { formatDate } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [total, setTotal] = useState(0)
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | unread | read
  const [selected, setSelected] = useState(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter === 'unread') params.set('read', 'false')
      if (filter === 'read') params.set('read', 'true')
      const r = await api.get(`/admin/messages?${params}`)
      setMessages(r.data.messages || [])
      setTotal(r.data.total || 0)
      setUnread(r.data.unread || 0)
    } catch {}
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  const markRead = async (msg) => {
    if (msg.read) return
    try {
      await api.patch(`/admin/messages/${msg._id}/read`)
      setMessages(ms => ms.map(m => m._id === msg._id ? { ...m, read: true } : m))
      setUnread(u => Math.max(0, u - 1))
    } catch {}
  }

  const openMessage = (msg) => {
    setSelected(msg)
    markRead(msg)
  }

  const deleteMessage = async (id) => {
    try {
      await api.delete(`/admin/messages/${id}`)
      setMessages(ms => ms.filter(m => m._id !== id))
      if (selected?._id === id) setSelected(null)
      toast.success('Message deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-normal text-walnut">Messages</h1>
          <p className="text-stone text-sm mt-1">
            {total} message{total !== 1 ? 's' : ''}
            {unread > 0 && <span className="ml-2 text-xs font-semibold bg-gold text-white px-2 py-0.5 rounded-full">{unread} unread</span>}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[['all', 'All'], ['unread', 'Unread'], ['read', 'Read']].map(([val, label]) => (
          <button key={val} onClick={() => { setFilter(val); setSelected(null) }}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors ${filter === val ? 'bg-walnut text-white' : 'border border-bone text-stone hover:border-walnut'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Message list */}
        <div className="lg:col-span-2 bg-white border border-bone rounded-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-bone border-t-gold rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center">
              <Mail size={32} className="text-bone mx-auto mb-3" strokeWidth={1} />
              <p className="text-stone text-sm">No messages found.</p>
            </div>
          ) : (
            <div className="divide-y divide-bone">
              {messages.map(msg => (
                <div key={msg._id}
                  onClick={() => openMessage(msg)}
                  className={`px-4 py-4 cursor-pointer transition-colors hover:bg-ivory
                    ${selected?._id === msg._id ? 'bg-ivory border-l-2 border-l-gold' : ''}
                    ${!msg.read ? 'bg-amber-50/50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {msg.read
                        ? <MailOpen size={14} className="text-stone flex-shrink-0" />
                        : <Mail size={14} className="text-gold flex-shrink-0" />}
                      <p className={`text-sm truncate ${!msg.read ? 'font-semibold text-walnut' : 'text-stone'}`}>
                        {msg.name}
                      </p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteMessage(msg._id) }}
                      className="text-stone hover:text-red-600 transition-colors flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-stone mt-1 truncate pl-5">{msg.subject}</p>
                  <p className="text-xs text-stone/60 mt-1 pl-5">{formatDate(msg.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white border border-bone rounded-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-bone">
                <h2 className="font-semibold text-walnut text-base">{selected.subject}</h2>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-stone">
                  <span className="flex items-center gap-1.5"><User size={12} /> {selected.name}</span>
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 hover:text-gold transition-colors">
                    <Mail size={12} /> {selected.email}
                  </a>
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {formatDate(selected.createdAt)}</span>
                </div>
              </div>
              <div className="px-6 py-6">
                <p className="text-sm text-walnut leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="px-6 py-4 border-t border-bone flex gap-3">
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                  className="btn-primary py-2 text-xs">
                  Reply via Email
                </a>
                <button onClick={() => deleteMessage(selected._id)}
                  className="btn-danger py-2 text-xs">
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-bone rounded-sm h-64 flex items-center justify-center">
              <div className="text-center">
                <MailOpen size={32} className="text-bone mx-auto mb-3" strokeWidth={1} />
                <p className="text-stone text-sm">Select a message to read it</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
