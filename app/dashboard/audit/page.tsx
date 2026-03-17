'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ClipboardList } from 'lucide-react'

type AuditLog = {
  id: string; action: string; user_email: string
  details: string; entity_id: string; created_at: string
}

function actionColor(action: string) {
  if (!action) return { bg: '#eff6ff', text: '#2563eb' }
  const a = action.toLowerCase()
  if (a.includes('create') || a.includes('insert')) return { bg: '#dcfce7', text: '#16a34a' }
  if (a.includes('delete') || a.includes('remove')) return { bg: '#fee2e2', text: '#dc2626' }
  if (a.includes('update') || a.includes('edit') || a.includes('revoke')) return { bg: '#fef9c3', text: '#ca8a04' }
  return { bg: '#eff6ff', text: '#2563eb' }
}

// ── Inline IST conversion — no imports needed ─────────────
function formatIST(dateStr: string): string {
  if (!dateStr) return '—'
  // Add 5 hours 30 minutes to UTC
  const ms  = new Date(dateStr).getTime() + (5 * 60 + 30) * 60 * 1000
  const ist = new Date(ms)
  const dd  = String(ist.getUTCDate()).padStart(2, '0')
  const mm  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][ist.getUTCMonth()]
  const yy  = ist.getUTCFullYear()
  const hh  = ist.getUTCHours()
  const min = String(ist.getUTCMinutes()).padStart(2, '0')
  const ap  = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 || 12
  return `${dd} ${mm} ${yy}, ${h12}:${min} ${ap}`
}

export default function AuditPage() {
  const [logs,    setLogs]    = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      setLogs(data || [])
      setLoading(false)
    }
    fetchLogs()
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Audit Log</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Complete system activity trail for compliance</p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['#', 'Action', 'User', 'Details', 'Date & Time (IST)'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                <ClipboardList size={40} color="#cbd5e1" style={{ margin: '0 auto 12px', display: 'block' }} />
                <div style={{ color: '#94a3b8', fontSize: '15px' }}>No audit logs yet</div>
                <div style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '4px' }}>System actions will appear here</div>
              </td></tr>
            ) : logs.map((log, i) => {
              const colors = actionColor(log.action)
              return (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '14px' }}>{i+1}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ background: colors.bg, color: colors.text, padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>
                      {log.action || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#0f172a' }}>{log.user_email || '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b', maxWidth: '300px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {formatIST(log.created_at)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}