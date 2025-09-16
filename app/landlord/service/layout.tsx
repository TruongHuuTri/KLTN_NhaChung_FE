"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/landlord/service/housing", label: "Quản lý căn hộ" },
    { href: "/landlord/service/billing", label: "Chi phí hàng tháng" },
    { href: "/landlord/service/overview", label: "Thống kê" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-3">
          <nav className="bg-teal-900 text-white rounded-2xl shadow-sm border border-teal-900/30 p-4 md:p-6 sticky top-24">
            <ul className="space-y-4">
              {navItems.map((item) => {
                const active = pathname?.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-4 rounded-xl text-base font-semibold transition-colors text-center ${
                        active ? "bg-white text-teal-900" : "hover:bg-teal-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="md:col-span-9">
          <div className="bg-white/80 backdrop-blur rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


