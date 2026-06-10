"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/cms";

interface HeaderProps {
  locale: Locale;
}

export default function Header({ locale }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: "Home", href: `/${locale}` },
    { name: "Solutions", href: `/${locale}/solutions` },
    { name: "Services", href: `/${locale}/services` },
    { name: "Products", href: `/${locale}/products` },
    { name: "News", href: `/${locale}/news` },
    { name: "Company", href: `/${locale}/company` },
    { name: "Contact", href: `/${locale}/contact` },
  ];

  // Helper to check if link is active
  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="site-header">
      <nav className="nav" aria-label="Main navigation">
        <Link href={`/${locale}`} className="brand">
          <span className="brand-mark" aria-hidden="true">
            <img src="/assets/willow-mark-transparent.png" alt="" decoding="async" />
          </span>
          <span>
            <strong>WILLOWSOFT</strong>
            <span>Smart Embedded Connectivity</span>
          </span>
        </Link>
        
        <div className={`nav-links ${isOpen ? "open" : ""}`}>
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href={`/${locale}/start-project`}
            className="mobile-cta"
            onClick={() => setIsOpen(false)}
          >
            Start Project
          </Link>
        </div>

        <div className="nav-actions">
          <Link href={`/${locale}/start-project`} className="btn btn-primary btn-small">
            Start Project
          </Link>
          <button
            className="menu-toggle"
            aria-expanded={isOpen}
            aria-label="Open menu"
            onClick={() => setIsOpen(!isOpen)}
          >
            ☰
          </button>
        </div>
      </nav>
    </header>
  );
}
