import "./globals.css";

export const metadata = {
  title: "Java 21 Deep Dive",
  description: "A practical Java 21 documentation portal with deep dives and examples.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
