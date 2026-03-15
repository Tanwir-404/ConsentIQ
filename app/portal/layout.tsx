import UserSidebar from '@/components/UserSidebar'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <UserSidebar />
      <main style={{ marginLeft: '260px', flex: 1, padding: '32px', background: '#f0f9ff', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
