'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Settings, History, Shield, LogOut, User } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'My Dashboard',    href: '/portal/home',        icon: Home },
  { label: 'My Preferences',  href: '/portal/preferences', icon: Settings },
  { label: 'Consent History', href: '/portal/history',     icon: History },
]

export default function UserSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [name, setName] = useState('User')

  useEffect(() => {
    setName(localStorage.getItem('ciq_name') || 'User')
  }, [])

  function handleLogout() {
    localStorage.removeItem('ciq_role')
    localStorage.removeItem('ciq_email')
    localStorage.removeItem('ciq_name')
    router.push('/login')
  }

  return (
    <div style={{
      width: '260px', minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #065a82 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 16px', position: 'fixed', left: 0, top: 0, bottom: 0,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '36px', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#0284c7', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>ConsentIQ</div>
            <div style={{ color: '#7dd3fc', fontSize: '11px' }}>Privacy Center</div>
          </div>
        </div>
      </div>

      {/* User card */}
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={16} color="white" />
        </div>
        <div>
          <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{name}</div>
          <div style={{ color: '#7dd3fc', fontSize: '11px' }}>User Account</div>
        </div>
      </div>

      <div style={{ color: '#475569', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', marginBottom: '8px', paddingLeft: '12px' }}>MY PRIVACY</div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                background: isActive ? 'rgba(2,132,199,0.3)' : 'transparent',
                borderLeft: isActive ? '3px solid #0284c7' : '3px solid transparent',
                color: isActive ? '#7dd3fc' : '#94a3b8',
              }}>
                <Icon size={18} />
                <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', marginBottom: '12px' }}>
        <LogOut size={18} />
        <span style={{ fontSize: '14px', fontWeight: 500 }}>Logout</span>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', color: '#475569', fontSize: '12px', paddingLeft: '8px' }}>© 2026 ConsentIQ</div>
    </div>
  )
}
