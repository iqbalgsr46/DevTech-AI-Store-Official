import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - DevTech AI Store",
  description: "Panel administrasi untuk mengelola subscriber dan voucher",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {children}
    </div>
  );
}
