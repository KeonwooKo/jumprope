export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-dvh flex flex-col bg-white">{children}</div>;
}
