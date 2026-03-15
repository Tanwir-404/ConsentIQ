'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FileText, Handshake, Users, CheckSquare, ShieldCheck, ShieldX } from 'lucide-react'

type RecentConsent = {
  consent_id: string; consent_status: string; created_at: string
  user_id: string; agreement_id: string
  User: { name: string; email: string } | null
  Agreement: { agreement_name: string } | null
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderTop: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ background: `${color}18`, borderRadius: '10px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{value}</div>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{title}</div>
      </div>
    </div>
  )
}

export default function OverviewPage() {
  const [totalPolicies,   setTotalPolicies]   = useState(0)
  const [totalAgreements, setTotalAgreements] = useState(0)
  const [totalUsers,      setTotalUsers]      = useState(0)
  const [totalConsents,   setTotalConsents]   = useState(0)
  const [optInCount,      setOptInCount]      = useState(0)
  const [optOutCount,     setOptOutCount]     = useState(0)
  const [recentConsents,  setRecentConsents]  = useState<RecentConsent[]>([])
  const [loading,         setLoading]         = useState(true)

  async function fetchAllData() {
    const { count: pCount } = await supabase.from('Policy').select('*', { count: 'exact', head: true })
    setTotalPolicies(pCount || 0)

    const { count: aCount } = await supabase.from('Agreement').select('*', { count: 'exact', head: true })
    setTotalAgreements(aCount || 0)

    const { count: uCount } = await supabase.from('User').select('*', { count: 'exact', head: true })
    setTotalUsers(uCount || 0)

    const { count: cCount } = await supabase.from('Consent_Record').select('*', { count: 'exact', head: true })
    setTotalConsents(cCount || 0)

    const { data: consentData } = await supabase
      .from('Consent_Record')
      .select('consent_id, consent_status, created_at, user_id, agreement_id')
      .order('created_at', { ascending: false }).limit(6)

    const { data: userData }      = await supabase.from('User').select('id, name, email')
    const { data: agreementData } = await supabase.from('Agreement').select('agreement_id, agreement_name')

    const joined = (consentData || []).map(c => ({
      ...c,
      User:      userData?.find(u => u.id === c.user_id) || null,
      Agreement: agreementData?.find(a => a.agreement_id === c.agreement_id) || null,
    }))
    setRecentConsents(joined as any)

    const { data: all } = await supabase.from('Consent_Record').select('consent_status')
    if (all) {
      const optIn  = all.filter(c => c.consent_status?.toLowerCase().includes('in')).length
      const optOut = all.filter(c => c.consent_status?.toLowerCase().includes('out')).length
      setOptInCount(optIn); setOptOutCount(optOut)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchAllData()
    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Consent_Record' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'User' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Policy' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Agreement' }, fetchAllData)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>Loading dashboard...</div>

  const chartData = [{ name: 'Opt-in', value: optInCount }, { name: 'Opt-out', value: optOutCount }]
  const COLORS = ['#3b82f6', '#ef4444']

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Admin Dashboard</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Real-time overview of your consent management system</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '999px', padding: '6px 12px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>LIVE</span>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginBottom: '24px' }}>
        <StatCard title="Total Policies"   value={totalPolicies}   icon={FileText}    color="#3b82f6" />
        <StatCard title="Total Agreements" value={totalAgreements} icon={Handshake}   color="#8b5cf6" />
        <StatCard title="Total Users"      value={totalUsers}      icon={Users}       color="#10b981" />
        <StatCard title="Total Consents"   value={totalConsents}   icon={CheckSquare} color="#f59e0b" />
      </div>

      {/* Consent Engine Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #10b981' }}>
          <ShieldCheck size={32} color="#10b981" />
          <div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>{optInCount}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Active Consents (Opt-in) — Data Access ALLOWED</div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #ef4444' }}>
          <ShieldX size={32} color="#ef4444" />
          <div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>{optOutCount}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Revoked Consents (Opt-out) — Data Access BLOCKED</div>
          </div>
        </div>
      </div>

      {/* Chart + Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Consent Status Breakdown</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Consent Logic Engine — Allow vs Block</p>
          {chartData.every(d => d.value === 0) ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>No consent data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Recent Consent Activity</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Updates live automatically ⚡</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentConsents.length === 0 ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No consents yet</div>
            ) : recentConsents.map(c => (
              <div key={c.consent_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{c.User?.name || 'Unknown'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{c.Agreement?.agreement_name || 'Unknown'}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(c.created_at).toLocaleDateString()}</div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: c.consent_status?.toLowerCase().includes('in') ? '#dcfce7' : '#fee2e2', color: c.consent_status?.toLowerCase().includes('in') ? '#16a34a' : '#dc2626' }}>
                  {c.consent_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
