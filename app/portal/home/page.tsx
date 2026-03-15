'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ShieldCheck, ShieldX, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function PortalHome() {
  const [name,        setName]        = useState('User')
  const [email,       setEmail]       = useState('')
  const [optInCount,  setOptInCount]  = useState(0)
  const [optOutCount, setOptOutCount] = useState(0)
  const [totalAgree,  setTotalAgree]  = useState(0)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const n = localStorage.getItem('ciq_name')  || 'User'
    const e = localStorage.getItem('ciq_email') || ''
    setName(n); setEmail(e)

    async function fetchData() {
      // Find this user in the database
      const { data: users } = await supabase.from('User').select('id, name').ilike('name', `%${n.split(' ')[0]}%`)
      const userId = users?.[0]?.id

      if (userId) {
        const { data: consents } = await supabase
          .from('Consent_Record')
          .select('consent_id, consent_status, created_at, agreement_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        const { data: agreements } = await supabase.from('Agreement').select('agreement_id, agreement_name')

        const optIn  = (consents || []).filter(c => c.consent_status?.toLowerCase().includes('in')).length
        const optOut = (consents || []).filter(c => c.consent_status?.toLowerCase().includes('out')).length
        setOptInCount(optIn); setOptOutCount(optOut)

        const recent = (consents || []).slice(0, 4).map(c => ({
          ...c,
          agreement_name: agreements?.find(a => a.agreement_id === c.agreement_id)?.agreement_name || 'Unknown',
        }))
        setRecentActivity(recent)
      }

      const { count } = await supabase.from('Agreement').select('*', { count: 'exact', head: true })
      setTotalAgree(count || 0)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>Loading...</div>

  const totalConsents = optInCount + optOutCount
  const complianceScore = totalAgree > 0 ? Math.round((optInCount / Math.max(totalAgree, 1)) * 100) : 0

  return (
    <div>
      {/* Welcome header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #065a82)', borderRadius: '16px', padding: '28px', marginBottom: '28px', color: 'white' }}>
        <div style={{ fontSize: '22px', fontWeight: 700 }}>Welcome back, {name}! 👋</div>
        <div style={{ color: '#7dd3fc', fontSize: '14px', marginTop: '6px' }}>Manage your privacy preferences and consent settings below.</div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/portal/preferences" style={{ background: '#0284c7', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            ⚙️ Manage Preferences
          </Link>
          <Link href="/portal/history" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            📋 View History
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderTop: '4px solid #10b981', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ShieldCheck size={28} color="#10b981" />
          <div><div style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>{optInCount}</div><div style={{ fontSize: '12px', color: '#64748b' }}>Active Consents (Opt-in)</div></div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderTop: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ShieldX size={28} color="#ef4444" />
          <div><div style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>{optOutCount}</div><div style={{ fontSize: '12px', color: '#64748b' }}>Revoked Consents (Opt-out)</div></div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderTop: '4px solid #3b82f6', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <CheckCircle size={28} color="#3b82f6" />
          <div><div style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>{totalConsents}/{totalAgree}</div><div style={{ fontSize: '12px', color: '#64748b' }}>Agreements Responded</div></div>
        </div>
      </div>

      {/* Consent Logic Engine status */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>🔒 Consent Logic Engine — Your Data Access Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {[
            { label: 'Marketing Emails',  status: optInCount > 0 ? 'ALLOWED' : 'BLOCKED',  icon: '📧' },
            { label: 'Analytics Tracking',status: optInCount > 1 ? 'ALLOWED' : 'BLOCKED',  icon: '📊' },
            { label: 'Cookie Tracking',   status: optOutCount > 0 ? 'BLOCKED' : 'ALLOWED', icon: '🍪' },
          ].map(item => (
            <div key={item.label} style={{ padding: '14px', borderRadius: '10px', background: item.status === 'ALLOWED' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${item.status === 'ALLOWED' ? '#bbf7d0' : '#fecaca'}` }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{item.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{item.label}</div>
              <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: item.status === 'ALLOWED' ? '#dcfce7' : '#fee2e2', color: item.status === 'ALLOWED' ? '#16a34a' : '#dc2626' }}>
                {item.status === 'ALLOWED' ? '✅ ALLOWED' : '🚫 BLOCKED'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Recent Consent Activity</h2>
        {recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>No consent activity yet. <Link href="/portal/preferences" style={{ color: '#3b82f6' }}>Set your preferences →</Link></div>
        ) : recentActivity.map(a => (
          <div key={a.consent_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={14} color="#94a3b8" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{a.agreement_name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(a.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' })}</div>
              </div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: a.consent_status?.toLowerCase().includes('in') ? '#dcfce7' : '#fee2e2', color: a.consent_status?.toLowerCase().includes('in') ? '#16a34a' : '#dc2626' }}>
              {a.consent_status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
