'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toISTDate } from '@/lib/formatDate'

type ConsentRecord = {
  consent_id: string
  consent_status: string
  created_at: string
  user_id: string
  agreement_id: string
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
    setConsents(joined as any)
    setLoading(false)
  }

  useEffect(() => { fetchConsents() }, [])

  // ── Consent status color ──────────────────────────────────
  function statusStyle(status: string) {
    const isOptIn = status?.toLowerCase().includes('in')
    return {
      padding: '4px 12px', borderRadius: '999px',
      fontSize: '12px', fontWeight: 600,
      background: isOptIn ? '#dcfce7' : '#fee2e2',
      color:      isOptIn ? '#16a34a' : '#dc2626',
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Consent Records</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>View all user consent decisions</p>
      </div>

      {/* Info notice */}
      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: '12px', padding: '16px', marginBottom: '24px',
        display: 'flex', gap: '12px', alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '20px' }}>ℹ️</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d4ed8' }}>
            Read-Only View
          </div>
          <div style={{ fontSize: '13px', color: '#3b82f6', marginTop: '2px' }}>
            Consent records are managed by users through their Privacy Preference Center.
            Admin can only view consent status for monitoring and compliance purposes.
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{consents.length}</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Total Records</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #10b981' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>
            {consents.filter(c => c.consent_status?.toLowerCase().includes('in')).length}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Opt-in (Allowed)</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444' }}>
            {consents.filter(c => c.consent_status?.toLowerCase().includes('out')).length}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Opt-out (Blocked)</div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['#', 'User', 'Agreement', 'Status', 'Date'].map(h => (
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
                <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '14px' }}>{i + 1}</td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{c.User?.name || '—'}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{c.User?.email || ''}</div>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>
                  {c.Agreement?.agreement_name || '—'}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={statusStyle(c.consent_status)}>
                    {c.consent_status?.toLowerCase().includes('in') ? '✅ Opt-in' : '🚫 Opt-out'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>
                  {toISTDate(c.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}