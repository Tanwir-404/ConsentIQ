'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Handshake, Plus, Trash2 } from 'lucide-react'

type Agreement = { agreement_id: string; agreement_name: string; created_at: string; policy_id: string; Policy: { policy_name: string } | null }
type Policy = { policy_id: string; policy_name: string }

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [policies,   setPolicies]   = useState<Policy[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [newName,    setNewName]    = useState('')
  const [policyId,   setPolicyId]   = useState('')
  const [adding,     setAdding]     = useState(false)

  async function fetchAgreements() {
    const { data: aData } = await supabase.from('Agreement').select('agreement_id, agreement_name, created_at, policy_id').order('created_at', { ascending: false })
    const { data: pData } = await supabase.from('Policy').select('policy_id, policy_name')
    const joined = (aData || []).map(a => ({ ...a, Policy: pData?.find(p => p.policy_id === a.policy_id) || null }))
    setAgreements(joined as any); setLoading(false)
  }

  async function fetchPolicies() {
    const { data } = await supabase.from('Policy').select('policy_id, policy_name')
    setPolicies(data || [])
  }

  async function addAgreement() {
    if (!newName.trim() || !policyId) return alert('Please fill all fields')
    setAdding(true)
    await supabase.from('Agreement').insert({ agreement_name: newName.trim(), policy_id: policyId })
    setNewName(''); setPolicyId(''); setShowForm(false); fetchAgreements(); setAdding(false)
  }

  async function deleteAgreement(id: string) {
    if (!confirm('Delete this agreement?')) return
    await supabase.from('Agreement').delete().eq('agreement_id', id)
    fetchAgreements()
  }

  useEffect(() => { fetchAgreements(); fetchPolicies() }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div><h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Agreements</h1><p style={{ color: '#64748b', marginTop: '4px' }}>Manage agreements linked to policies</p></div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 18px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
          <Plus size={16} /> Add Agreement
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '12px', color: '#0f172a' }}>New Agreement</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Agreement name..." style={{ flex: 2, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', minWidth: '200px' }} />
            <select value={policyId} onChange={e => setPolicyId(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', minWidth: '160px' }}>
              <option value="">Select Policy</option>
              {policies.map(p => <option key={p.policy_id} value={p.policy_id}>{p.policy_name}</option>)}
            </select>
            <button onClick={addAgreement} disabled={adding} style={{ background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px' }}>{adding ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {['#','Agreement Name','Linked Policy','Created At','Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
            : agreements.length === 0 ? <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No agreements yet.</td></tr>
            : agreements.map((a, i) => (
              <tr key={a.agreement_id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => (e.currentTarget.style.background='#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '14px' }}>{i+1}</td>
                <td style={{ padding: '14px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ background: '#f5f3ff', borderRadius: '6px', padding: '6px' }}><Handshake size={14} color="#8b5cf6" /></div><span style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{a.agreement_name}</span></div></td>
                <td style={{ padding: '14px 20px' }}><span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 }}>{a.Policy?.policy_name || 'No Policy'}</span></td>
                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>{new Date(a.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td style={{ padding: '14px 20px' }}><button onClick={() => deleteAgreement(a.agreement_id)} style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' }}><Trash2 size={14} color="#dc2626" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
