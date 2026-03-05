"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Priors", icon: "◈" },
  { href: "/library", label: "Library", icon: "☰" },
  { href: "/new", label: "New Entry", icon: "+" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen border-r border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl flex flex-col fixed left-0 top-0 z-30">
      <div className="p-5 pb-3">
        <h1 className="text-sm font-semibold text-white/90 tracking-tight">
          Lets be real, we&apos;ve all got priors.
        </h1>
        <div className="mt-2 h-px bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-transparent" />
      </div>

      <nav className="flex-1 px-3 py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 mb-0.5 ${
                isActive
                  ? "bg-white/[0.08] text-white shadow-sm shadow-violet-500/5"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
              }`}
            >
              <span
                className={`text-base w-5 text-center ${
                  isActive ? "text-violet-400 opacity-90" : "opacity-40"
                }`}
              >
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-5 pt-3 border-t border-white/[0.04]">
        <p className="text-[11px] text-zinc-600">
          Track what shapes your thinking
        </p>
      </div>
    </aside>
  );
}
