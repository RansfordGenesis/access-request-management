import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Header } from "@/components/header"
import NextAuthSessionProvider from '@/components/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Access Request Management System',
  description: 'Manage access requests efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthSessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-background">
            <Header />
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}