'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Clock } from 'lucide-react'

type HistoryItem = { consent_id: string; consent_status: string; created_at: string; agreement_name: string; policy_name: string }

function toIST(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const name = localStorage.getItem('ciq_name') || ''
    async function fetchHistory() {
      const { data: users } = await supabase.from('User').select('id').ilike('name', `%${name.split(' ')[0]}%`)
      const uid = users?.[0]?.id
      if (!uid) { setLoading(false); return }
      const { data: consents } = await supabase.from('Consent_Record').select('consent_id, consent_status, created_at, agreement_id').eq('user_id', uid).order('created_at', { ascending: false })
      const { data: agreements } = await supabase.from('Agreement').select('agreement_id, agreement_name, policy_id')
      const { data: policies }   = await supabase.from('Policy').select('policy_id, policy_name')
      const merged = (consents || []).map(c => {
        const agreement = agreements?.find(a => a.agreement_id === c.agreement_id)
        const policy    = policies?.find(p => p.policy_id === agreement?.policy_id)
        return { consent_id: c.consent_id, consent_status: c.consent_status, created_at: c.created_at, agreement_name: agreement?.agreement_name || 'Unknown', policy_name: policy?.policy_name || 'Unknown' }
      })
      setHistory(merged); setLoading(false)
    }
    fetchHistory()
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Consent History</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Complete record of all your consent decisions</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{history.length}</div><div style={{ fontSize: '12px', color: '#64748b' }}>Total Responses</div></div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{history.filter(h => h.consent_status?.toLowerCase().includes('in')).length}</div><div style={{ fontSize: '12px', color: '#64748b' }}>Accepted (Opt-in)</div></div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{history.filter(h => h.consent_status?.toLowerCase().includes('out')).length}</div><div style={{ fontSize: '12px', color: '#64748b' }}>Denied / Revoked</div></div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {['#','Agreement','Policy','Decision','Date & Time (IST)'].map(h => <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
            : history.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                <Clock size={40} color="#cbd5e1" style={{ margin: '0 auto 12px', display: 'block' }} />
                <div style={{ color: '#94a3b8' }}>No consent history yet</div>
              </td></tr>
            ) : history.map((h, i) => (
              <tr key={h.consent_id} style={{ borderBottom: '1px solid #f1f5f9' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '14px' }}>{i+1}</td>
                <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{h.agreement_name}</td>
                <td style={{ padding: '14px 20px' }}><span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 }}>{h.policy_name}</span></td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: h.consent_status?.toLowerCase().includes('in') ? '#dcfce7' : '#fee2e2', color: h.consent_status?.toLowerCase().includes('in') ? '#16a34a' : '#dc2626' }}>
                    {h.consent_status?.toLowerCase().includes('in') ? '✅ Accepted' : '🚫 Denied/Revoked'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>{toIST(h.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}