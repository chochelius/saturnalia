import React, { useState } from "react";
import { Menu, X, Languages } from "lucide-react";

import { SpotifyIcon } from "../icons/SpotifyIcon";
import { YouTubeIcon } from "../icons/YouTubeIcon";
import { BandcampIcon } from "../icons/BandcampIcon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export interface HeaderNavTranslations {
  home: string;
  bio: string;
  discography: string;
  gallery?: string;
  blog?: string;
  contact: string;
}

interface HeaderProps {
  nav: HeaderNavTranslations;
  lang: "en" | "es";
  currentPath?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  bandcampUrl?: string;
}

export const Header = ({
  nav,
  lang,
  currentPath,
  spotifyUrl = "https://open.spotify.com/intl-es/artist/72zPH4AWqTekcgX6kNwfz4",
  youtubeUrl = "https://www.youtube.com/@saturnaliainfinita999",
  bandcampUrl = "https://saturnalia999.bandcamp.com/releases",
}: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const homeHref = lang === "en" ? "/" : "/es";
  const bioHref = lang === "en" ? "/bio" : "/es/bio";
  const discographyHref = lang === "en" ? "/discography" : "/es/discography";
  const galleryHref = lang === "en" ? "/gallery" : "/es/gallery";
  const blogHref = lang === "en" ? "/blog" : "/es/blog";
  const contactHref = lang === "en" ? "/contact" : "/es/contact";
  const linksHref = lang === "en" ? "/links" : "/es/links";

  const navLinks = [
    { href: homeHref, label: nav.home },
    { href: bioHref, label: nav.bio },
    { href: discographyHref, label: nav.discography },
    { href: galleryHref, label: nav.gallery || (lang === "en" ? "Gallery" : "Galería") },
    { href: blogHref, label: nav.blog || (lang === "en" ? "Blog" : "Blog") },
    { href: contactHref, label: nav.contact },
    { href: linksHref, label: "Links" },
  ];

  const getTargetLangUrl = () => {
    const rawPath = currentPath || (typeof window !== "undefined" ? window.location.pathname : "");
    const path = rawPath.length > 1 && rawPath.endsWith("/") ? rawPath.slice(0, -1) : (rawPath || "/");

    if (lang === "en") {
      if (!path || path === "/" || path === "") return "/es";
      return `/es${path}`;
    } else {
      const withoutEs = path.replace(/^\/es/, "");
      return withoutEs === "" ? "/" : withoutEs;
    }
  };

  const isLinkActive = (href: string) => {
    const rawPath = currentPath || (typeof window !== "undefined" ? window.location.pathname : "");
    const path = rawPath.length > 1 && rawPath.endsWith("/") ? rawPath.slice(0, -1) : (rawPath || "/");
    const normalizedHref = href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;

    if (normalizedHref === "/" || normalizedHref === "/es") {
      return path === normalizedHref;
    }
    return path === normalizedHref || path.startsWith(`${normalizedHref}/`);
  };

  const targetLangUrl = getTargetLangUrl();
  const targetLangLabel = lang === "en" ? "ES" : "EN";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#020202]/95 backdrop-blur-lg border-b border-b-primary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center gap-2 sm:gap-4">
        {/* Logo & Marca */}
        <a href={homeHref} onClick={() => setIsOpen(false)} className="z-10 flex items-center gap-2.5 sm:gap-3 shrink-0 group">
          <img
            src="/logo.jpg"
            alt="Saturnalia999 Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-none border border-primary/40 group-hover:border-primary group-hover:shadow-[0_0_12px_rgba(28,161,229,0.7)] transition-all duration-300 shrink-0"
          />
          <span className="text-xl sm:text-2xl font-headline font-bold text-glow text-primary uppercase tracking-widest block whitespace-nowrap">
            Saturnalia999
          </span>
        </a>

        {/* Desktop Navigation (Visible desde lg: 1024px) */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 shrink-0">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`font-headline text-sm xl:text-base uppercase tracking-wider transition-colors duration-300 whitespace-nowrap ${
                  active
                    ? "text-primary font-bold text-glow border-b-2 border-primary pb-0.5"
                    : "text-muted-foreground hover:text-accent hover:text-glow"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Social and Language Toggler for Desktop */}
        <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5 shrink-0">
          <a
            href={targetLangUrl}
            className="flex items-center space-x-1.5 px-2.5 py-1 border border-primary/40 hover:border-primary text-primary hover:text-accent font-headline uppercase text-xs transition-colors duration-300 rounded-none whitespace-nowrap"
            aria-label={`Switch to ${targetLangLabel}`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="font-bold">{targetLangLabel}</span>
          </a>
          <a
            href={spotifyUrl}
            aria-label="Spotify"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SpotifyIcon className="w-5 h-5 xl:w-6 xl:h-6 text-primary hover:text-accent transition-colors duration-300" />
          </a>
          <a
            href={youtubeUrl}
            aria-label="YouTube"
            target="_blank"
            rel="noopener noreferrer"
          >
            <YouTubeIcon className="w-5 h-5 xl:w-6 xl:h-6 text-primary hover:text-accent transition-colors duration-300" />
          </a>
          <a
            href={bandcampUrl}
            aria-label="Bandcamp"
            target="_blank"
            rel="noopener noreferrer"
            title="Bandcamp Releases"
          >
            <BandcampIcon className="w-5 h-5 xl:w-6 xl:h-6 text-primary hover:text-accent transition-colors duration-300" />
          </a>
        </div>

        {/* Mobile Navigation Trigger (Visible bajo lg) */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <a
            href={targetLangUrl}
            className="flex items-center space-x-1 px-2.5 py-1 border border-primary/40 hover:border-primary text-primary font-headline uppercase text-xs transition-colors rounded-none"
            aria-label={`Switch to ${targetLangLabel}`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="font-bold">{targetLangLabel}</span>
          </a>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="hover:bg-primary/10">
                <Menu className="h-7 w-7 text-primary icon-glow" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#020202]/98 border-l-primary/30 w-full p-0">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b border-b-primary/20 h-20">
                  <a href={homeHref} onClick={() => setIsOpen(false)} className="flex items-center gap-2.5">
                    <img
                      src="/logo.jpg"
                      alt="Saturnalia999 Logo"
                      className="w-7 h-7 object-cover border border-primary/40 shadow-sm"
                    />
                    <span className="text-2xl font-headline text-glow text-primary uppercase block font-bold">
                      S999
                    </span>
                  </a>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu">
                      <X className="h-8 w-8 text-primary icon-glow" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col items-center justify-center flex-1 space-y-10">
                  {navLinks.map((link) => {
                    const active = isLinkActive(link.href);
                    return (
                      <SheetClose asChild key={link.href}>
                        <a
                          href={link.href}
                          className={`font-headline text-3xl uppercase transition-colors duration-300 text-glow ${
                            active
                              ? "text-primary font-bold underline underline-offset-8 decoration-primary"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          {link.label}
                        </a>
                      </SheetClose>
                    );
                  })}
                </nav>
                <div className="flex items-center justify-center space-x-6 py-10 border-t border-t-primary/20">
                  <a
                    href={targetLangUrl}
                    className="flex items-center space-x-2 px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-black font-headline uppercase text-lg transition-colors"
                  >
                    <Languages className="w-6 h-6" />
                    <span>{targetLangLabel}</span>
                  </a>
                  <a
                    href={spotifyUrl}
                    aria-label="Spotify"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                  >
                    <SpotifyIcon className="w-8 h-8 text-accent hover:text-primary transition-colors duration-300" />
                  </a>
                  <a
                    href={youtubeUrl}
                    aria-label="YouTube"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                  >
                    <YouTubeIcon className="w-8 h-8 text-accent hover:text-primary transition-colors duration-300" />
                  </a>
                  <a
                    href={bandcampUrl}
                    aria-label="Bandcamp"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                  >
                    <BandcampIcon className="w-8 h-8 text-accent hover:text-primary transition-colors duration-300" />
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
