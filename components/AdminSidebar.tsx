'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, Handshake,
  Users, CheckSquare, ClipboardList,
  Shield, LogOut, ShieldCheck, Globe
} from 'lucide-react'

const navItems = [
  { label: 'Overview',        href: '/dashboard/overview',     icon: LayoutDashboard },
  { label: 'Policies',        href: '/dashboard/policies',     icon: FileText },
  { label: 'Agreements',      href: '/dashboard/agreements',   icon: Handshake },
  { label: 'Users',           href: '/dashboard/users',        icon: Users },
  { label: 'Consent Records', href: '/dashboard/consent',      icon: CheckSquare },
  { label: 'Integrations',    href: '/dashboard/integrations', icon: Globe },
  { label: 'Audit Log',       href: '/dashboard/audit',        icon: ClipboardList },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  function handleLogout() {
    localStorage.removeItem('ciq_role')
    localStorage.removeItem('ciq_email')
    localStorage.removeItem('ciq_name')
    router.push('/login')
  }

  return (
    <div style={{
      width: '260px', minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 16px', position: 'fixed', left: 0, top: 0, bottom: 0,
    }}>

      {/* Logo */}
      <div style={{ marginBottom: '36px', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#3b82f6', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>ConsentIQ</div>
            <div style={{ color: '#93c5fd', fontSize: '11px' }}>Admin Dashboard</div>
          </div>
        </div>
      </div>

      {/* Admin badge */}
      <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '8px 12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldCheck size={14} color="#f87171" />
        <span style={{ color: '#f87171', fontSize: '12px', fontWeight: 600 }}>ADMIN ACCESS</span>
      </div>

      <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', marginBottom: '8px', paddingLeft: '12px' }}>
        MAIN MENU
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon     = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                background: isActive ? 'rgba(59,130,246,0.25)' : 'transparent',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                color: isActive ? '#93c5fd' : '#94a3b8',
              }}>
                <Icon size={18} />
                <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', marginBottom: '12px' }}>
        <LogOut size={18} />
        <span style={{ fontSize: '14px', fontWeight: 500 }}>Logout</span>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', color: '#475569', fontSize: '12px', paddingLeft: '8px' }}>
        © 2026 ConsentIQ
      </div>
    </div>
  )
}