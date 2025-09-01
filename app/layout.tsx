import "./globals.css";

export const metadata = { title: "Trust Stay", description: "Tìm trọ, ở ghép thông minh" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="pt-20">{children}</body>
    </html>
  );
}
