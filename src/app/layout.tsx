import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DashboardProvider } from '@/context/DashboardContext';

export const metadata: Metadata = {
  title: 'Finora — Smart Personal Finance & Budget Dashboard',
  description: 'Track spending trends, manage budget plans, and review recent transactions with Finora.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('finora_accent') || localStorage.getItem('pryma_accent');
                  var themes = {
                    orange: { p: '#FF5C16', h: '#E84D0A', l: '#FFF2EC', b: 'rgba(255, 92, 22, 0.25)' },
                    violet: { p: '#8B5CF6', h: '#7C3AED', l: '#F5F3FF', b: 'rgba(139, 92, 246, 0.25)' },
                    emerald: { p: '#10B981', h: '#059669', l: '#ECFDF5', b: 'rgba(16, 185, 129, 0.25)' },
                    ocean: { p: '#0284C7', h: '#0369A1', l: '#F0F9FF', b: 'rgba(2, 132, 199, 0.25)' },
                    rose: { p: '#F43F5E', h: '#E11D48', l: '#FFF1F2', b: 'rgba(244, 63, 94, 0.25)' }
                  };
                  var t = themes[theme] || themes.orange;
                  var r = document.documentElement;
                  r.style.setProperty('--primary-accent', t.p);
                  r.style.setProperty('--primary-accent-hover', t.h);
                  r.style.setProperty('--primary-accent-light', t.l);
                  r.style.setProperty('--primary-accent-border', t.b);
                  r.style.setProperty('--primary-accent-glow', '0 4px 14px ' + t.b);
                  r.style.setProperty('--primary-accent-muted', 'color-mix(in srgb, ' + t.p + ' 55%, white)');
                  r.style.setProperty('--primary-orange', t.p);
                  r.style.setProperty('--primary-orange-hover', t.h);
                  r.style.setProperty('--primary-orange-light', t.l);
                  r.style.setProperty('--primary-orange-border', t.b);
                  r.style.setProperty('--primary-orange-muted', 'color-mix(in srgb, ' + t.p + ' 55%, white)');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <DashboardProvider>
            {children}
          </DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
