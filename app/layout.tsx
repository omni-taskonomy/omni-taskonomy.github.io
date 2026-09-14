import type { Metadata } from 'next';
import manuscriptContent from '@/content/manuscript-excerpts.json';
import './globals.css';
export const metadata: Metadata = {
 title: manuscriptContent.excerpts.title.text,
 description: manuscriptContent.excerpts.description.text,
 robots: { index: false, follow: false },
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
 return <html lang="en"><body>{children}</body></html>;
}
