import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAP Copilot Integration Demo | Penguin Solutions x Microsoft',
  description: 'AI-Powered Natural Language Interface for SAP ERP - Powered by Microsoft Azure & Copilot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
