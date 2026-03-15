'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router   = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    setLoading(true)
    setError('')

    // ── Admin check ──────────────────────────────────────────
    if (email === 'admin@consentiq.com' && password === 'Admin@123') {
      localStorage.setItem('ciq_role',  'admin')
      localStorage.setItem('ciq_email', email)
      localStorage.setItem('ciq_name',  'Admin')
      router.push('/dashboard/overview')
      return
    }

    // ── User check from Supabase User table ──────────────────
    if (password !== 'User@123') {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    const { data, error: dbError } = await supabase
      .from('User')
      .select('id, name, email')
      .eq('email', email)
      .single()

    if (dbError || !data) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    localStorage.setItem('ciq_role',  'user')
    localStorage.setItem('ciq_email', data.email)
    localStorage.setItem('ciq_name',  data.name)
    router.push('/portal/home')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>ConsentIQ</h1>
          <p style={{ color: '#93c5fd', fontSize: '14px', marginTop: '4px' }}>
            Cyber Consent Management System
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '36px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
            Sign in
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
            Enter your credentials to access the system
          </p>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fee2e2', color: '#dc2626', padding: '12px 14px',
              borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
              border: '1px solid #fecaca',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Email */}
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
            Email Address
          </label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: '8px',
              border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', marginBottom: '16px',
            }}
            onFocus={e => (e.target.style.borderColor = '#3b82f6')}
            onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
          />

          {/* Password */}
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: '8px',
              border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', marginBottom: '24px',
            }}
            onFocus={e => (e.target.style.borderColor = '#3b82f6')}
            onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
          />

          {/* Button */}
          <button
            onClick={handleLogin} disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </div>

      </div>
    </div>
  )
}