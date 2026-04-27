export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ padding: 40, fontFamily: 'Arial' }}>
        {children}
      </body>
    </html>
  )
}
