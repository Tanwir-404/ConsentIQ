'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Plus, Trash2 } from 'lucide-react'

type Policy = { policy_id: string; policy_name: string; created_at: string }

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading,  setLoading]  = useState(true)
  const [newName,  setNewName]  = useState('')
  const [showForm, setShowForm] = useState(false)
  const [adding,   setAdding]   = useState(false)

  async function fetchPolicies() {
    const { data } = await supabase.from('Policy').select('*').order('created_at', { ascending: false })
    setPolicies(data || []); setLoading(false)
  }

  async function addPolicy() {
    if (!newName.trim()) return
    setAdding(true)
    await supabase.from('Policy').insert({ policy_name: newName.trim() })
    setNewName(''); setShowForm(false); fetchPolicies(); setAdding(false)
  }

  async function deletePolicy(id: string) {
    if (!confirm('Delete this policy?')) return
    await supabase.from('Policy').delete().eq('policy_id', id)
    fetchPolicies()
  }

  useEffect(() => { fetchPolicies() }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Policies</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Manage data privacy policies</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 18px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
          <Plus size={16} /> Add Policy
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '12px', color: '#0f172a' }}>New Policy</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter policy name..." onKeyDown={e => e.key === 'Enter' && addPolicy()}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
            <button onClick={addPolicy} disabled={adding} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px' }}>{adding ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {['#','Policy Name','Created At','Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
            : policies.length === 0 ? <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No policies yet.</td></tr>
            : policies.map((p, i) => (
              <tr key={p.policy_id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background='#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '14px' }}>{i+1}</td>
                <td style={{ padding: '14px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ background: '#eff6ff', borderRadius: '6px', padding: '6px' }}><FileText size={14} color="#3b82f6" /></div><span style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{p.policy_name}</span></div></td>
                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>{new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td style={{ padding: '14px 20px' }}><button onClick={() => deletePolicy(p.policy_id)} style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' }}><Trash2 size={14} color="#dc2626" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
