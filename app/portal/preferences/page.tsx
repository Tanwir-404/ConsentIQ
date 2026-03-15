'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ShieldCheck, ShieldX, RefreshCw } from 'lucide-react'

type AgreementWithConsent = {
  agreement_id: string
  agreement_name: string
  policy_name: string
  consent_id: string | null
  consent_status: string | null
  updating: boolean
}

export default function PreferencesPage() {
  const [items,   setItems]   = useState<AgreementWithConsent[]>([])
  const [loading, setLoading] = useState(true)
  const [userId,  setUserId]  = useState<string | null>(null)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    const name = localStorage.getItem('ciq_name') || ''

    async function fetchData() {
      // Find user by name
      const { data: users } = await supabase.from('User').select('id').ilike('name', `%${name.split(' ')[0]}%`)
      const uid = users?.[0]?.id || null
      setUserId(uid)

      // Get all agreements with policy names
      const { data: agreements } = await supabase
        .from('Agreement').select('agreement_id, agreement_name, policy_id')
      const { data: policies } = await supabase.from('Policy').select('policy_id, policy_name')

      // Get this user's consents
      let consents: any[] = []
      if (uid) {
        const { data } = await supabase.from('Consent_Record')
          .select('consent_id, consent_status, agreement_id').eq('user_id', uid)
        consents = data || []
      }

      const merged = (agreements || []).map(a => {
        const userConsent = consents.find(c => c.agreement_id === a.agreement_id)
        const policyName  = policies?.find(p => p.policy_id === a.policy_id)?.policy_name || 'Unknown Policy'
        return {
          agreement_id:   a.agreement_id,
          agreement_name: a.agreement_name,
          policy_name:    policyName,
          consent_id:     userConsent?.consent_id || null,
          consent_status: userConsent?.consent_status || null,
          updating:       false,
        }
      })
      setItems(merged); setLoading(false)
    }
    fetchData()
  }, [])

  // Accept consent
  async function acceptConsent(agreementId: string, consentId: string | null) {
    if (!userId) return alert('User not found in database')
    setItems(prev => prev.map(i => i.agreement_id === agreementId ? { ...i, updating: true } : i))

    if (consentId) {
      await supabase.from('Consent_Record').update({ consent_status: 'Opt-in' }).eq('consent_id', consentId)
    } else {
      await supabase.from('Consent_Record').insert({ user_id: userId, agreement_id: agreementId, consent_status: 'Opt-in' })
    }

    setItems(prev => prev.map(i => i.agreement_id === agreementId ? { ...i, consent_status: 'Opt-in', updating: false } : i))
    showSaved()
  }

  // Deny / Revoke consent
  async function denyConsent(agreementId: string, consentId: string | null) {
    if (!userId) return alert('User not found in database')
    setItems(prev => prev.map(i => i.agreement_id === agreementId ? { ...i, updating: true } : i))

    if (consentId) {
      await supabase.from('Consent_Record').update({ consent_status: 'Opt-out' }).eq('consent_id', consentId)
    } else {
      await supabase.from('Consent_Record').insert({ user_id: userId, agreement_id: agreementId, consent_status: 'Opt-out' })
    }

    setItems(prev => prev.map(i => i.agreement_id === agreementId ? { ...i, consent_status: 'Opt-out', updating: false } : i))
    showSaved()
  }

  function showSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>Loading your preferences...</div>

  // Group by policy
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.policy_name]) acc[item.policy_name] = []
    acc[item.policy_name].push(item)
    return acc
  }, {} as Record<string, AgreementWithConsent[]>)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Privacy Preference Center</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Control how your personal data is used. Changes take effect immediately.</p>
        </div>
        {saved && (
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: '1px solid #bbf7d0' }}>
            ✅ Preferences saved!
          </div>
        )}
      </div>

      {/* GDPR notice */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '20px' }}>🔒</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d4ed8' }}>Your Rights Under GDPR & CCPA</div>
          <div style={{ fontSize: '13px', color: '#3b82f6', marginTop: '2px' }}>You have the right to grant, deny, or revoke consent at any time. Your preferences are stored securely and enforced immediately.</div>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          No agreements found. Ask the admin to add agreements.
        </div>
      ) : Object.entries(grouped).map(([policyName, agreements]) => (
        <div key={policyName} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>📄 {policyName}</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Manage your consent for agreements under this policy</div>

          {agreements.map(item => (
            <div key={item.agreement_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '10px', background: '#f8fafc', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{item.agreement_name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  {item.consent_status
                    ? item.consent_status.toLowerCase().includes('in')
                      ? '✅ You have accepted this — data access is ALLOWED'
                      : '🚫 You have denied this — data access is BLOCKED'
                    : '⚠️ No response yet — please set your preference'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Current status badge */}
                {item.consent_status && (
                  <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: item.consent_status.toLowerCase().includes('in') ? '#dcfce7' : '#fee2e2', color: item.consent_status.toLowerCase().includes('in') ? '#16a34a' : '#dc2626' }}>
                    {item.consent_status.toLowerCase().includes('in') ? 'ACCEPTED' : 'DENIED'}
                  </span>
                )}

                {/* Accept button */}
                <button
                  onClick={() => acceptConsent(item.agreement_id, item.consent_id)}
                  disabled={item.updating || item.consent_status?.toLowerCase().includes('in')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: item.consent_status?.toLowerCase().includes('in') ? '#f1f5f9' : '#10b981',
                    color: item.consent_status?.toLowerCase().includes('in') ? '#94a3b8' : 'white',
                    border: 'none', borderRadius: '8px', padding: '8px 14px',
                    cursor: item.consent_status?.toLowerCase().includes('in') ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 600,
                  }}>
                  <ShieldCheck size={14} />
                  {item.updating ? '...' : 'Accept'}
                </button>

                {/* Deny / Revoke button */}
                <button
                  onClick={() => denyConsent(item.agreement_id, item.consent_id)}
                  disabled={item.updating || item.consent_status?.toLowerCase().includes('out')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: item.consent_status?.toLowerCase().includes('out') ? '#f1f5f9' : '#ef4444',
                    color: item.consent_status?.toLowerCase().includes('out') ? '#94a3b8' : 'white',
                    border: 'none', borderRadius: '8px', padding: '8px 14px',
                    cursor: item.consent_status?.toLowerCase().includes('out') ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 600,
                  }}>
                  <ShieldX size={14} />
                  {item.updating ? '...' : item.consent_status?.toLowerCase().includes('in') ? 'Revoke' : 'Deny'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
