'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2 } from 'lucide-react'

type User = { id: string; name: string; email: string; created_at: string }

function toIST(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444']
  const color = colors[name.charCodeAt(0) % colors.length]
  return <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>{initials}</div>
}

export default function UsersPage() {
  const [users,    setUsers]    = useState<User[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName,  setNewName]  = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [adding,   setAdding]   = useState(false)

  async function fetchUsers() {
    const { data } = await supabase.from('User').select('*').order('created_at', { ascending: false })
    setUsers(data || []); setLoading(false)
  }

  async function addUser() {
    if (!newName.trim() || !newEmail.trim()) return alert('Please fill all fields')
    setAdding(true)
    await supabase.from('User').insert({ name: newName.trim(), email: newEmail.trim() })
    setNewName(''); setNewEmail(''); setShowForm(false); fetchUsers(); setAdding(false)
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user?')) return
    await supabase.from('User').delete().eq('id', id)
    fetchUsers()
  }

  useEffect(() => { fetchUsers() }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div><h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Users</h1><p style={{ color: '#64748b', marginTop: '4px' }}>Manage registered users</p></div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 18px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
          <Plus size={16} /> Add User
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '12px', color: '#0f172a' }}>New User</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', minWidth: '160px' }} />
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email address..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', minWidth: '200px' }} />
            <button onClick={addUser} disabled={adding} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px' }}>{adding ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {['#','User','Email','Joined (IST)','Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
            : users.length === 0 ? <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No users yet.</td></tr>
            : users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '14px' }}>{i+1}</td>
                <td style={{ padding: '14px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Avatar name={u.name} /><span style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{u.name}</span></div></td>
                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>{u.email}</td>
                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>{toIST(u.created_at)}</td>
                <td style={{ padding: '14px 20px' }}><button onClick={() => deleteUser(u.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' }}><Trash2 size={14} color="#dc2626" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}