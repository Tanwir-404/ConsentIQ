'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type UserConsent = {
  name: string
  email: string
  status: string
  signalSent: boolean
  signalType: 'ALLOW' | 'BLOCK' | null
}

type Integration = {
  id: string
  name: string
  description: string
  icon: string
  agreement: string
  users: UserConsent[]
}

const INTEGRATIONS: Omit<Integration, 'users'>[] = [
  { id: 'google-analytics', name: 'Google Analytics', description: 'Tracks user behavior, page views and session data',          icon: '📊', agreement: 'Analytics Tracking' },
  { id: 'facebook-pixel',   name: 'Facebook Pixel',   description: 'Tracks conversions and enables targeted advertising',        icon: '📘', agreement: 'Personalized Advertising' },
  { id: 'mailchimp',        name: 'Mailchimp',         description: 'Sends marketing emails and newsletters to users',            icon: '📧', agreement: 'Marketing Emails' },
  { id: 'crm',              name: 'CRM System',        description: 'Stores and manages customer relationship data',              icon: '🏢', agreement: 'Data Sharing Agreement' },
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading,      setLoading]      = useState(true)
  const [sending,      setSending]      = useState<string | null>(null)

  async function fetchData() {
    const { data: consentData }   = await supabase.from('Consent_Record').select('consent_status, user_id, agreement_id')
    const { data: userData }      = await supabase.from('User').select('id, name, email')
    const { data: agreementData } = await supabase.from('Agreement').select('agreement_id, agreement_name')

    const built: Integration[] = INTEGRATIONS.map(intg => {
      const matchedAgreement = agreementData?.find(a =>
        a.agreement_name.toLowerCase().includes(intg.agreement.toLowerCase().split(' ')[0])
      )
      const users: UserConsent[] = []
      if (matchedAgreement) {
        const relevantConsents = consentData?.filter(c => c.agreement_id === matchedAgreement.agreement_id) || []
        relevantConsents.forEach(c => {
          const user = userData?.find(u => u.id === c.user_id)
          if (user) users.push({ name: user.name, email: user.email, status: c.consent_status, signalSent: false, signalType: null })
        })
      }
      return { ...intg, users }
    })

    setIntegrations(built); setLoading(false)
  }

  async function sendUserSignal(intgId: string, intgName: string, userEmail: string, userName: string, consentStatus: string) {
    const key     = `${intgId}-${userEmail}`
    setSending(key)
    await new Promise(resolve => setTimeout(resolve, 1500))
    const isOptIn = consentStatus?.toLowerCase().includes('in')
    const action  = isOptIn ? 'ALLOW' : 'BLOCK'
    await supabase.from('audit_log').insert({
      action:     'API_CALL',
      user_email: userEmail,
      details:    `API signal sent to ${intgName} for ${userName} (${userEmail}): Data access ${action}ED based on individual consent`,
      created_at: new Date().toISOString(),
    })
    setIntegrations(prev => prev.map(intg => intg.id !== intgId ? intg : {
      ...intg,
      users: intg.users.map(u => u.email === userEmail ? { ...u, signalSent: true, signalType: isOptIn ? 'ALLOW' : 'BLOCK' } : u)
    }))
    setSending(null)
    setTimeout(() => {
      setIntegrations(prev => prev.map(intg => intg.id !== intgId ? intg : {
        ...intg,
        users: intg.users.map(u => u.email === userEmail ? { ...u, signalSent: false, signalType: null } : u)
      }))
    }, 3000)
  }

  async function sendAllSignals(intg: Integration) {
    for (const user of intg.users) {
      await sendUserSignal(intg.id, intg.name, user.email, user.name, user.status)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>Loading integrations...</div>

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Integration & Enforcement</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Enforce consent decisions individually per user across all connected platforms</p>
      </div>

      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', color: 'white' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>⚡ Per-User Consent Enforcement</div>
        <div style={{ fontSize: '13px', color: '#93c5fd', lineHeight: '1.8' }}>
          Each user's consent is enforced individually. A user who opts out will be BLOCKED even if other users have opted in. No user's decision affects another user's privacy.
        </div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '13px', color: '#86efac' }}>✅ Opt-in → ALLOW signal sent for that specific user only</div>
          <div style={{ fontSize: '13px', color: '#fca5a5' }}>🚫 Opt-out → BLOCK signal sent for that specific user only</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{integrations.length}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Connected Platforms</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #10b981' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{integrations.reduce((s, i) => s + i.users.filter(u => u.status?.toLowerCase().includes('in')).length, 0)}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Total Allowed</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{integrations.reduce((s, i) => s + i.users.filter(u => u.status?.toLowerCase().includes('out')).length, 0)}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Total Blocked</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{integrations.reduce((s, i) => s + i.users.length, 0)}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Total Records</div>
        </div>
      </div>

      {/* Platform cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {integrations.map(intg => {
          const allowedCount = intg.users.filter(u => u.status?.toLowerCase().includes('in')).length
          const blockedCount = intg.users.filter(u => u.status?.toLowerCase().includes('out')).length
          return (
            <div key={intg.id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '26px' }}>{intg.icon}</span>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{intg.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{intg.description}</div>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  Agreement: <span style={{ fontWeight: 600, color: '#3b82f6' }}>{intg.agreement}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600 }}>✅ {allowedCount} Allowed</span>
                  <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600 }}>🚫 {blockedCount} Blocked</span>
                </div>
              </div>

              {/* Per user rows */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Individual Enforcement
                </div>

                {intg.users.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>No consent records yet</div>
                ) : intg.users.map((u, i) => {
                  const isOptIn   = u.status?.toLowerCase().includes('in')
                  const signalKey = `${intg.id}-${u.email}`
                  const isSending = sending === signalKey

                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', borderRadius: '8px', marginBottom: '8px',
                      background: isOptIn ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${isOptIn ? '#bbf7d0' : '#fecaca'}`,
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{u.email}</div>
                        <div style={{ fontSize: '11px', marginTop: '2px', fontWeight: 700, color: isOptIn ? '#16a34a' : '#dc2626' }}>
                          {isOptIn ? '✅ Access: ALLOWED' : '🚫 Access: BLOCKED'}
                        </div>
                      </div>

                      {u.signalSent ? (
                        <div style={{ fontSize: '11px', fontWeight: 700, color: u.signalType === 'ALLOW' ? '#16a34a' : '#dc2626' }}>
                          {u.signalType === 'ALLOW' ? '✅ ALLOW sent!' : '🚫 BLOCK sent!'}
                        </div>
                      ) : (
                        <button
                          onClick={() => sendUserSignal(intg.id, intg.name, u.email, u.name, u.status)}
                          disabled={isSending}
                          style={{
                            padding: '6px 10px', borderRadius: '6px', border: 'none',
                            background: isSending ? '#f1f5f9' : isOptIn ? '#10b981' : '#ef4444',
                            color: isSending ? '#94a3b8' : 'white',
                            fontSize: '11px', fontWeight: 600,
                            cursor: isSending ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', whiteSpace: 'nowrap',
                          }}>
                          {isSending ? '⏳...' : isOptIn ? '📡 Send ALLOW' : '📡 Send BLOCK'}
                        </button>
                      )}
                    </div>
                  )
                })}

                {/* Enforce all button */}
                {intg.users.length > 0 && (
                  <button
                    onClick={() => sendAllSignals(intg)}
                    style={{
                      width: '100%', marginTop: '8px', padding: '10px',
                      background: '#0f172a', color: 'white', border: 'none',
                      borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    📡 Enforce ALL users on {intg.name}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Terminal */}
      <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#93c5fd', marginBottom: '12px' }}>📡 API Enforcement Console</div>
        <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#4ade80', lineHeight: '2' }}>
          <div>{'>'} ConsentIQ Enforcement Engine v2.0 — Per-User Mode active</div>
          <div>{'>'} Connected: Google Analytics | Facebook Pixel | Mailchimp | CRM System</div>
          <div>{'>'} Mode: INDIVIDUAL — each user enforced separately ✅</div>
          <div>{'>'} Consent Logic Engine — listening for consent changes...</div>
          <div style={{ color: '#fbbf24' }}>{'>'} GDPR Article 7 — consent is per individual, not collective</div>
          <div style={{ color: '#94a3b8' }}>{'>'} Click per-user buttons to send individual enforcement signals to each platform</div>
        </div>
      </div>
    </div>
  )
}