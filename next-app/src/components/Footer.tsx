import Link from "next/link";
import type { Locale } from "@/lib/cms";

interface FooterProps {
  locale: Locale;
}

export default function Footer({ locale }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h3>WillowSoft</h3>
          <p>Smart Embedded Connectivity &amp; Industrial IoT.<br />Turkey &amp; United Kingdom offices.</p>
          <div className="footer-social" aria-label="Social media links">
            <a href="https://linkedin.com/company/willowsoft" aria-label="LinkedIn" rel="noopener noreferrer" target="_blank">in</a>
            <a href="https://github.com/willowsoft" aria-label="GitHub" rel="noopener noreferrer" target="_blank">gh</a>
            <a href="mailto:info@willowsoft.co" aria-label="Email">✉</a>
          </div>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href={`/${locale}/solutions`}>Solutions</Link>
          <Link href={`/${locale}/services`}>Services</Link>
          <Link href={`/${locale}/products`}>Products</Link>
        </div>
        <div>
          <h3>Company</h3>
          <Link href={`/${locale}/company`}>Company</Link>
          <Link href={`/${locale}/news`}>News</Link>
          <Link href={`/${locale}/glossary`}>Glossary</Link>
        </div>
        <div>
          <h3>Contact</h3>
          <Link href={`/${locale}/contact`}>Contact</Link>
          <Link href={`/${locale}/start-project`}>Start a Project</Link>
          <a href="mailto:info@willowsoft.co">info@willowsoft.co</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 WillowSoft. All rights reserved.</span>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="#">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
}
