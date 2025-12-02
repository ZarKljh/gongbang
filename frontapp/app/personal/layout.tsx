import '../globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <body style={{fontFamily: 'P-regular'}}>
        {children}
      </body>
  )
}