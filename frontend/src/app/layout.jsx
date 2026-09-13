import './globals.css';
import Providers from '@/components/shared/Providers';

export const metadata = {
  title: 'QR Attendance System',
  description: 'Enterprise Attendance & Workforce Management',
  manifest: '/manifest.json',
  icons: {
    apple: '/logo.jpeg',
  },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'MK Attend' },
};

export const viewport = {
  themeColor: '#2E7D32',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
