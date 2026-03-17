'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
import { nowIST } from '@/lib/formatDate'

type ConsentRecord = {
  consent_id: string; consent_status: string; created_at: string
  user_id: string; agreement_id: string
  User: { name: string; email: string } | null
  Agreement: { agreement_name: string } | null
}
type User      = { id: string; name: string }
type Agreement = { agreement_id: string; agreement_name: string }

async function writeAuditLog(action: string, userEmail: string, details: string) {
  await supabase.from('audit_log').insert({
    action,
    user_email: userEmail,
    details,
    created_at: nowIST(),
  })
}

export default function ConsentPage() {
  const [consents,    setConsents]    = useState<ConsentRecord[]>([])
  const [users,       setUsers]       = useState<User[]>([])
  const [agreements,  setAgreements]  = useState<Agreement[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [userId,      setUserId]      = useState('')
  const [agreementId, setAgreementId] = useState('')
  const [status,      setStatus]      = useState('Opt-in')
  const [adding,      setAdding]      = useState(false)
  const [updatingId,  setUpdatingId]  = useState<string | null>(null)

  async function fetchConsents() {
    const { data: cData } = await supabase
      .from('Consent_Record')
      .select('consent_id, consent_status, created_at, user_id, agreement_id')
      .order('created_at', { ascending: false })
    const { data: uData } = await supabase.from('User').select('id, name, email')
    const { data: aData } = await supabase.from('Agreement').select('agreement_id, agreement_name')
    const joined = (cData || []).map(c => ({
      ...c,
      User:      uData?.find(u => u.id === c.user_id) || null,
      Agreement: aData?.find(a => a.agreement_id === c.agreement_id) || null,
    }))
    setConsents(joined as any); setLoading(false)
  }

  async function toggleConsent(id: string, current: string) {
    setUpdatingId(id)
    const newStatus = current?.toLowerCase().includes('in') ? 'Opt-out' : 'Opt-in'
    const record    = consents.find(c => c.consent_id === id)
    const userEmail = record?.User?.email || 'unknown'
    const agreement = record?.Agreement?.agreement_name || 'Unknown'
    await supabase.from('Consent_Record').update({ consent_status: newStatus }).eq('consent_id', id)
    await writeAuditLog('UPDATE', userEmail, `Consent toggled: ${agreement} → ${newStatus}`)
    setConsents(prev => prev.map(c => c.consent_id === id ? { ...c, consent_status: newStatus } : c))
    setUpdatingId(null)
  }

  async function revokeConsent(id: string) {
    if (!confirm('Revoke this consent? This will block data access.')) return
    setUpdatingId(id)
    const record    = consents.find(c => c.consent_id === id)
    const userEmail = record?.User?.email || 'unknown'
    const agreement = record?.Agreement?.agreement_name || 'Unknown'
    await supabase.from('Consent_Record').update({ consent_status: 'Opt-out' }).eq('consent_id', id)
    await writeAuditLog('REVOKE', userEmail, `Consent revoked: ${agreement} → Opt-out`)
    setConsents(prev => prev.map(c => c.consent_id === id ? { ...c, consent_status: 'Opt-out' } : c))
    setUpdatingId(null)
  }

  async function addConsent() {
    if (!userId || !agreementId) return alert('Please fill all fields')
    setAdding(true)
    const selectedUser      = users.find(u => u.id === userId)
    const selectedAgreement = agreements.find(a => a.agreement_id === agreementId)
    await supabase.from('Consent_Record').insert({ user_id: userId, agreement_id: agreementId, consent_status: status })
    await writeAuditLog('INSERT', selectedUser?.name || 'unknown', `Consent added: ${status} for ${selectedAgreement?.agreement_name || 'Unknown'} by ${selectedUser?.name || 'Unknown'}`)
    setUserId(''); setAgreementId(''); setStatus('Opt-in'); setShowForm(false); fetchConsents(); setAdding(false)
  }

  async function deleteConsent(id: string) {
    if (!confirm('Delete this record?')) return
    const record    = consents.find(c => c.consent_id === id)
    const userEmail = record?.User?.email || 'unknown'
    const agreement = record?.Agreement?.agreement_name || 'Unknown'
    await supabase.from('Consent_Record').delete().eq('consent_id', id)
    await writeAuditLog('DELETE', userEmail, `Consent record deleted: ${agreement} for ${record?.User?.name || 'Unknown'}`)
    fetchConsents()
  }

  useEffect(() => {
    fetchConsents()
    supabase.from('User').select('id, name').then(({ data }) => setUsers(data || []))
    supabase.from('Agreement').select('agreement_id, agreement_name').then(({ data }) => setAgreements(data || []))
  }, [])

  // Stat counts
  const optInCount  = consents.filter(c => c.consent_status?.toLowerCase().includes('in')).length
  const optOutCount = consents.filter(c => c.consent_status?.toLowerCase().includes('out')).length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Consent Records</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>View, update and revoke user consent decisions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#f59e0b', color: 'white', border: 'none',
          borderRadius: '8px', padding: '10px 18px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
        }}>
          <Plus size={16} /> Add Consent
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{consents.length}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Total Records</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #10b981' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{optInCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Opt-in (Allowed)</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{optOutCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Opt-out (Blocked)</div>
        </div>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '12px', color: '#0f172a' }}>New Consent Record</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select value={userId} onChange={e => setUserId(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', minWidth: '160px' }}>
              <option value="">Select User</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select value={agreementId} onChange={e => setAgreementId(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', minWidth: '180px' }}>
              <option value="">Select Agreement</option>
              {agreements.map(a => <option key={a.agreement_id} value={a.agreement_id}>{a.agreement_name}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}>
              <option value="Opt-in">Opt-in</option>
              <option value="Opt-out">Opt-out</option>
            </select>
            <button onClick={addConsent} disabled={adding}
              style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px' }}>
              {adding ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['#', 'User', 'Agreement', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
            ) : consents.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No consent records yet.</td></tr>
            ) : consents.map((c, i) => (
              <tr key={c.consent_id} style={{ borderBottom: '1px solid #f1f5f9' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '14px' }}>{i+1}</td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{c.User?.name || '—'}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{c.User?.email || ''}</div>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>
                  {c.Agreement?.agreement_name || '—'}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                    background: c.consent_status?.toLowerCase().includes('in') ? '#dcfce7' : '#fee2e2',
                    color:      c.consent_status?.toLowerCase().includes('in') ? '#16a34a' : '#dc2626',
                  }}>
                    {c.consent_status?.toLowerCase().includes('in') ? '✅ Opt-in' : '🚫 Opt-out'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => toggleConsent(c.consent_id, c.consent_status)}
                      disabled={updatingId === c.consent_id}
                      style={{ background: '#eff6ff', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RefreshCw size={12} />
                      {updatingId === c.consent_id ? '...' : 'Toggle'}
                    </button>
                    {c.consent_status?.toLowerCase().includes('in') && (
                      <button onClick={() => revokeConsent(c.consent_id)}
                        disabled={updatingId === c.consent_id}
                        style={{ background: '#fff7ed', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#ea580c' }}>
                        Revoke
                      </button>
                    )}
                    <button onClick={() => deleteConsent(c.consent_id)}
                      style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' }}>
                      <Trash2 size={14} color="#dc2626" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}