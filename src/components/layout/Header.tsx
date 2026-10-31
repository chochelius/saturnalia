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
  contact: string;
}

interface HeaderProps {
  nav: HeaderNavTranslations;
  lang: "en" | "es";
  spotifyUrl?: string;
  youtubeUrl?: string;
  bandcampUrl?: string;
}

export const Header = ({
  nav,
  lang,
  spotifyUrl = "https://open.spotify.com/intl-es/artist/72zPH4AWqTekcgX6kNwfz4",
  youtubeUrl = "https://www.youtube.com/@saturnaliainfinita999",
  bandcampUrl = "https://saturnalia999.bandcamp.com/releases",
}: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "#home", label: nav.home },
    { href: "#bio", label: nav.bio },
    { href: "#albums", label: nav.discography },
    { href: "#contact", label: nav.contact },
    { href: lang === "en" ? "/links" : "/es/links", label: "Links" },
  ];

  const targetLangUrl = lang === "en" ? "/es" : "/";
  const targetLangLabel = lang === "en" ? "ES" : "EN";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#020202]/90 backdrop-blur-lg border-b border-b-primary/30">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <a href="#home" onClick={() => setIsOpen(false)} className="z-10">
          <span className="text-3xl font-headline font-bold text-glow text-primary uppercase tracking-widest block">
            Saturnalia999
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-headline text-xl text-muted-foreground hover:text-accent transition-colors duration-300 hover:text-glow uppercase"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Social and Language Toggler for Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href={targetLangUrl}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-primary/40 hover:border-primary text-primary hover:text-accent font-headline uppercase text-sm transition-colors duration-300 rounded-none"
            aria-label={`Switch to ${targetLangLabel}`}
          >
            <Languages className="w-4 h-4" />
            <span className="font-bold">{targetLangLabel}</span>
          </a>
          <a
            href={spotifyUrl}
            aria-label="Spotify"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SpotifyIcon className="w-7 h-7 text-primary hover:text-accent transition-colors duration-300" />
          </a>
          <a
            href={youtubeUrl}
            aria-label="YouTube"
            target="_blank"
            rel="noopener noreferrer"
          >
            <YouTubeIcon className="w-7 h-7 text-primary hover:text-accent transition-colors duration-300" />
          </a>
          <a
            href={bandcampUrl}
            aria-label="Bandcamp"
            target="_blank"
            rel="noopener noreferrer"
            title="Bandcamp Releases"
          >
            <BandcampIcon className="w-7 h-7 text-primary hover:text-accent transition-colors duration-300" />
          </a>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-8 w-8 text-primary icon-glow" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#020202]/98 border-l-primary/30 w-full p-0">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b border-b-primary/20 h-20">
                  <a href="#home" onClick={() => setIsOpen(false)}>
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
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <a
                        href={link.href}
                        className="font-headline text-4xl text-muted-foreground hover:text-primary transition-colors duration-300 text-glow uppercase"
                      >
                        {link.label}
                      </a>
                    </SheetClose>
                  ))}
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
