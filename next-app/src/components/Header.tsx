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

  const locales = ["en", "tr", "de", "fr", "es", "it", "ar", "ja"] as const;
  const labels: Record<Locale, string> = {
    en: "EN",
    tr: "TR",
    de: "DE",
    fr: "FR",
    es: "ES",
    it: "IT",
    ar: "AR",
    ja: "JA",
  };

  const links = [
    { name: "Ana Sayfa", href: `/${locale}`, accent: "nav-accent-cyan" },
    { name: "Solutions", href: `/${locale}/solutions`, accent: "nav-accent-green" },
    { name: "Services", href: `/${locale}/services`, accent: "nav-accent-cyan" },
    { name: "Products", href: `/${locale}/products`, accent: "nav-accent-cyan" },
    { name: "News", href: `/${locale}/news`, accent: "nav-accent-amber" },
    { name: "Company", href: `/${locale}/company`, accent: "nav-accent-warm" },
    { name: "Contact", href: `/${locale}/contact`, accent: "nav-accent-green" },
  ];

  // Helper to check if link is active
  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    const parts = pathname.split("/").filter(Boolean);
    if (locales.includes(parts[0] as any)) {
      parts[0] = nextLocale;
    } else {
      parts.unshift(nextLocale);
    }
    const newPath = "/" + parts.join("/");
    window.location.href = newPath + window.location.search + window.location.hash;
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
              className={link.accent}
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
          <label className="language-switcher" data-language-switcher="">
            <span className="sr-only">Language</span>
            <select aria-label="Language" value={locale} onChange={handleLanguageChange}>
              {locales.map((item) => (
                <option key={item} value={item}>
                  {labels[item]}
                </option>
              ))}
            </select>
          </label>

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

