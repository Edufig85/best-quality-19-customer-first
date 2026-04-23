export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body style={{fontFamily:'Arial', padding:40}}>{children}</body>
    </html>
  );
}