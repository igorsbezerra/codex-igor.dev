import "./globals.css";

export const metadata = {
  title: "Codex Docs Portal",
  description: "A Next.js documentation portal inspired by modern AI docs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
