import '../globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{fontFamily: 'P-regular'}}>
        {children}
      </body>
    </html>
  )
}