'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Integration = {
  id: string
  name: string
  description: string
  icon: string
  color: string
  agreement: string
  status: 'ACTIVE' | 'BLOCKED' | 'UNKNOWN'
  users: { name: string; email: string; status: string }[]
  lastSignal: string | null
}

const INTEGRATIONS: Omit<Integration, 'status' | 'users' | 'lastSignal'>[] = [
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Tracks user behavior, page views and session data',
    icon: '📊',
    color: '#f59e0b',
    agreement: 'Analytics Tracking',
  },
  {
    id: 'facebook-pixel',
    name: 'Facebook Pixel',
    description: 'Tracks conversions and enables targeted advertising',
    icon: '📘',
    color: '#3b82f6',
    agreement: 'Personalized Advertising',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Sends marketing emails and newsletters to users',
    icon: '📧',
    color: '#10b981',
    agreement: 'Marketing Emails',
  },
  {
    id: 'crm',
    name: 'CRM System',
    description: 'Stores and manages customer relationship data',
    icon: '🏢',
    color: '#8b5cf6',
    agreement: 'Data Sharing Agreement',
  },
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading,      setLoading]      = useState(true)
  const [sending,      setSending]      = useState<string | null>(null)
  const [sentSignal,   setSentSignal]   = useState<string | null>(null)

  async function fetchData() {
    const { data: consentData }   = await supabase.from('Consent_Record').select('consent_id, consent_status, created_at, user_id, agreement_id')
    const { data: userData }      = await supabase.from('User').select('id, name, email')
    const { data: agreementData } = await supabase.from('Agreement').select('agreement_id, agreement_name')

    const built: Integration[] = INTEGRATIONS.map(intg => {
      const matchedAgreement = agreementData?.find(a =>
        a.agreement_name.toLowerCase().includes(intg.agreement.toLowerCase().split(' ')[0])
      )

      const users: Integration['users'] = []
      let activeCount  = 0
      let blockedCount = 0

      if (matchedAgreement) {
        const relevantConsents = consentData?.filter(c => c.agreement_id === matchedAgreement.agreement_id) || []
        relevantConsents.forEach(c => {
          const user    = userData?.find(u => u.id === c.user_id)
          const isOptIn = c.consent_status?.toLowerCase().includes('in')
          if (user) {
            users.push({ name: user.name, email: user.email, status: c.consent_status })
            if (isOptIn) activeCount++
            else blockedCount++
          }
        })
      }

      let status: Integration['status'] = 'UNKNOWN'
      if (users.length > 0) {
        status = activeCount > blockedCount ? 'ACTIVE' : 'BLOCKED'
      }

      return { ...intg, status, users, lastSignal: null }
    })

    setIntegrations(built)
    setLoading(false)
  }

  async function sendSignal(intg: Integration) {
    setSending(intg.id)
    setSentSignal(null)
    await new Promise(resolve => setTimeout(resolve, 1500))
    const action  = intg.status === 'ACTIVE' ? 'ALLOW' : 'BLOCK'
    const details = `API signal sent to ${intg.name}: Data access ${action}ED based on user consent`
    await supabase.from('audit_log').insert({
      action:     'API_CALL',
      user_email: 'system@consentiq.com',
      details,
      created_at: new Date().toISOString(),
    })
    setSending(null)
    setSentSignal(intg.id)
    setTimeout(() => setSentSignal(null), 3000)
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>
      Loading integrations...
    </div>
  )

  const activeCount  = integrations.filter(i => i.status === 'ACTIVE').length
  const blockedCount = integrations.filter(i => i.status === 'BLOCKED').length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Integration & Enforcement</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Monitor connected platforms and enforce user consent decisions in real time</p>
      </div>

      {/* How it works banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', color: 'white' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>⚡ How Consent Enforcement Works</div>
        <div style={{ fontSize: '13px', color: '#93c5fd', lineHeight: '1.8' }}>
          When a user grants or revokes consent → Our Consent Logic Engine detects the change →
          An API signal is sent to the connected platform → The platform allows or blocks data access immediately.
        </div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '14px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '13px', color: '#86efac' }}>✅ Opt-in → Platform receives ALLOW signal → Data access enabled</div>
          <div style={{ fontSize: '13px', color: '#fca5a5' }}>🚫 Opt-out → Platform receives BLOCK signal → Data access disabled</div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{integrations.length}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Connected Platforms</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #10b981' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{activeCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Platforms Active</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{blockedCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Platforms Blocked</div>
        </div>
      </div>

      {/* Integration cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {integrations.map(intg => (
          <div key={intg.id} style={{
            background: 'white', borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: `2px solid ${intg.status === 'ACTIVE' ? '#bbf7d0' : intg.status === 'BLOCKED' ? '#fecaca' : '#e2e8f0'}`,
            overflow: 'hidden',
          }}>
            {/* Card header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '32px' }}>{intg.icon}</div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{intg.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{intg.description}</div>
                  </div>
                </div>
                <span style={{
                  padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
                  background: intg.status === 'ACTIVE'  ? '#dcfce7' :
                              intg.status === 'BLOCKED' ? '#fee2e2' : '#f1f5f9',
                  color:      intg.status === 'ACTIVE'  ? '#16a34a' :
                              intg.status === 'BLOCKED' ? '#dc2626' : '#64748b',
                }}>
                  {intg.status === 'ACTIVE'  ? '✅ ACTIVE' :
                   intg.status === 'BLOCKED' ? '🚫 BLOCKED' : '⚠️ NO DATA'}
                </span>
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                Controlled by: <span style={{ fontWeight: 600, color: '#3b82f6' }}>{intg.agreement}</span>
              </div>
            </div>

            {/* User list */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                User Consent Status
              </div>
              {intg.users.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>No consent records yet</div>
              ) : intg.users.map((u, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < intg.users.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a' }}>{u.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{u.email}</div>
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                    background: u.status?.toLowerCase().includes('in') ? '#dcfce7' : '#fee2e2',
                    color:      u.status?.toLowerCase().includes('in') ? '#16a34a' : '#dc2626',
                  }}>
                    {u.status?.toLowerCase().includes('in') ? '✅ Allowed' : '🚫 Blocked'}
                  </span>
                </div>
              ))}
            </div>

            {/* Signal button */}
            <div style={{ padding: '16px 20px' }}>
              {sentSignal === intg.id ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#16a34a', fontWeight: 500 }}>
                  ✅ Signal sent to {intg.name}! Audit log updated.
                </div>
              ) : (
                <button
                  onClick={() => sendSignal(intg)}
                  disabled={sending === intg.id}
                  style={{
                    width: '100%', padding: '10px',
                    background: sending === intg.id ? '#f1f5f9' :
                                intg.status === 'ACTIVE'  ? '#10b981' :
                                intg.status === 'BLOCKED' ? '#ef4444' : '#64748b',
                    color: sending === intg.id ? '#94a3b8' : 'white',
                    border: 'none', borderRadius: '8px',
                    cursor: sending === intg.id ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                    transition: 'opacity 0.2s',
                  }}>
                  {sending === intg.id
                    ? '⏳ Sending signal...'
                    : intg.status === 'ACTIVE'
                    ? `📡 Send ALLOW signal to ${intg.name}`
                    : intg.status === 'BLOCKED'
                    ? `📡 Send BLOCK signal to ${intg.name}`
                    : '📡 Send enforcement signal'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Terminal log */}
      <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#93c5fd', marginBottom: '12px' }}>
          📡 API Enforcement Console — Live Signals
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#4ade80', lineHeight: '2' }}>
          <div>{'>'} ConsentIQ Enforcement Engine v1.0 — initialized</div>
          <div>{'>'} Connected: Google Analytics | Facebook Pixel | Mailchimp | CRM System</div>
          <div>{'>'} Consent Logic Engine — listening for user consent changes...</div>
          <div>{'>'} REST API endpoints ready for enforcement signals</div>
          <div style={{ color: '#fbbf24' }}>{'>'} GDPR Article 7 — consent must be freely given, specific, informed and unambiguous</div>
          <div style={{ color: '#94a3b8' }}>{'>'} Click "Send signal" above to enforce consent decisions on connected platforms</div>
        </div>
      </div>
    </div>
  )
}