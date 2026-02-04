"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Heart } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  // Using .includes or regex allows you to catch [slug] routes like /sarah/result
  const isGamePage = pathname.includes("/play") || pathname.includes("/result");

  // 2. If it's a game or result page, don't show the nav
  if (isGamePage) return null;

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Explore", href: "/explore", icon: Heart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center gap-1"
          >
            <Icon
              size={24}
              className={
                isActive ? "text-rose-500 fill-rose-500" : "text-gray-400"
              }
            />
            <span
              className={`text-xs ${
                isActive ? "text-rose-500 font-medium" : "text-gray-400"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
