// app/layout.js (Root Layout - Server Component - CORRECT)
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './Providers'; // Import the Providers component

const inter = Inter({ subsets: ['latin'] });

// --- Updated Metadata ---
export const metadata = {
  // Set the default title and a template for specific pages
  title: {
    default: 'Wallet Canvas',
    template: '%s | Wallet Canvas', // e.g., "Budget | Wallet Canvas"
  },
  description: 'Track your budget, powered by Plaid.', // Update description
  // Next.js will automatically look for icon files in /app directory by convention
  // You can explicitly define them if needed (paths relative to /app):
  // icons: {
  //   icon: '/icon.png', // Main icon
  //   shortcut: '/favicon.ico', // Fallback ico
  //   apple: '/apple-icon.png', // For Apple devices
  // },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en ">
      <body className={ "bg-background-primary " +inter.className}>
        <Providers>
          {children}
        </Providers> {/* Wrap with Providers */}
      </body>
    </html>
  );
}