import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
 title:'When Does Image Generation Help Image Understanding?',
 description:'A controlled study of training-time transfer from image editing to visual understanding, with UniTaskonomy and gradient alignment analysis.',
 robots:{index:false,follow:false},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
 return <html lang="en"><body>{children}</body></html>;
}
