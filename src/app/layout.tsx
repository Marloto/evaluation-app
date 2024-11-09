import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: 'Thesis Evaluation',
  description: 'Tool for evaluating thesis works',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
