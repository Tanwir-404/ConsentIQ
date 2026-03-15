import AdminSidebar from '@/components/AdminSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ marginLeft: '260px', flex: 1, padding: '32px', background: '#f1f5f9', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
