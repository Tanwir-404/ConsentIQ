import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ConsentIQ — Cyber Consent Management System',
  description: 'Manage user consent for data policies — GDPR & CCPA compliant',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
