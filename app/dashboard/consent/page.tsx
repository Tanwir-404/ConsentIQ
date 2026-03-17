'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type ConsentRecord = {
  consent_id: string; consent_status: string; created_at: string
  user_id: string; agreement_id: string
  User: { name: string; email: string } | null
  Agreement: { agreement_name: string } | null
}

export default function ConsentPage() {
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [loading,  setLoading]  = useState(true)

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

  useEffect(() => { fetchConsents() }, [])

  const optInCount  = consents.filter(c => c.consent_status?.toLowerCase().includes('in')).length
  const optOutCount = consents.filter(c => c.consent_status?.toLowerCase().includes('out')).length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Consent Records</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>View all user consent decisions</p>
      </div>

      {/* Stat cards */}
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

      {/* Table — VIEW ONLY */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['#', 'User', 'Agreement', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
            ) : consents.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No consent records yet.</td></tr>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}