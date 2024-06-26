import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/modules/app/components/ThemeProvider'
import NavBar from '@/modules/app/components/NavBar'
import MetaMaskContextProvider from '@/modules/metamask/components/MetaMaskContextProvider'
import ReactQueryProvider from '@/modules/app/components/ReactQueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ReactQueryProvider>
          <ThemeProvider attribute='class' defaultTheme='dark'>
            <MetaMaskContextProvider>
              <NavBar />

              {children}

              <Toaster richColors closeButton theme='dark' />
            </MetaMaskContextProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
