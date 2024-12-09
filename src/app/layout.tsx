"use client"

import './globals.css'
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Thesis Evaluation</title>
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}