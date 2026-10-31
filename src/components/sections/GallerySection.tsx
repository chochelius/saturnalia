import React, { useState, useEffect } from 'react';
import type { GalleryItem } from '../../lib/pocketbase';
import { GlitchText } from '../GlitchText';
import { Maximize2, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface GallerySectionProps {
  title: string;
  subtitle?: string;
  items: GalleryItem[];
  lang?: 'en' | 'es';
}

export default function GallerySection({
  title,
  subtitle,
  items,
  lang = 'en',
}: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isEs = lang === 'es';

  // Navegación por teclado en el Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, items.length]);

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
  };

  const currentItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <section id="gallery" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        {/* Encabezado */}
        <div className="text-center mb-12 sm:mb-16">
          <GlitchText
            text={title}
            as="h1"
            className="text-4xl md:text-5xl font-bold text-glow text-primary uppercase tracking-widest mb-3"
          />
          {subtitle && (
            <p className="font-mono text-sm md:text-base text-muted-foreground uppercase tracking-widest max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-none text-xs font-mono text-primary">
            <span>[ ARCHIVE_ENTRIES: {items.length} ]</span>
          </div>
        </div>

        {/* Estado Vacío */}
        {items.length === 0 ? (
          <div className="max-w-md mx-auto text-center p-8 border border-dashed border-primary/40 bg-[#080808]/80">
            <Eye className="w-10 h-10 text-primary/60 mx-auto mb-3 animate-pulse" />
            <p className="font-mono text-sm text-foreground/80 uppercase tracking-widest">
              {isEs
                ? '// NO HAY TRANSMISIONES EN EL ARCHIVO VISUAL'
                : '// NO TRANSMISSIONS FOUND IN VISUAL ARCHIVE'}
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-2">
              {isEs
                ? 'Sube nuevas imágenes desde la consola de control.'
                : 'Upload new images through the control console.'}
            </p>
          </div>
        ) : (
          /* Grid de Fotos */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {items.map((item, idx) => {
              const displayTitle = (isEs ? item.titleEs : item.title) || item.title || `Entry #${idx + 1}`;
              const displayCaption = isEs ? (item.captionEs || item.captionEn) : (item.captionEn || item.captionEs);

              return (
                <div
                  key={item.id || idx}
                  onClick={() => setSelectedIndex(idx)}
                  className="group relative bg-[#040404] border border-primary/30 hover:border-primary overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-black/80 hover:shadow-primary/20 flex flex-col justify-between"
                >
                  {/* Contenedor Imagen */}
                  <div className="aspect-[4/3] sm:aspect-square overflow-hidden bg-black relative">
                    <img
                      src={item.image}
                      alt={displayTitle}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Overlay al hacer hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="p-3 bg-primary/20 border border-primary text-primary rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Maximize2 className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Tag de orden en esquina */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 border border-primary/40 text-[10px] font-mono text-primary uppercase">
                      #{String(idx + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Metadatos */}
                  <div className="p-4 bg-[#050505] border-t border-primary/20">
                    <h3 className="font-mono text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {displayTitle}
                    </h3>
                    {displayCaption && (
                      <p className="font-mono text-xs text-muted-foreground mt-1 line-clamp-2">
                        {displayCaption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Lightbox */}
        {selectedIndex !== null && currentItem && (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Botón Cerrar */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/40 rounded-none transition-colors z-50"
              title={isEs ? 'Cerrar (Esc)' : 'Close (Esc)'}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navegación Anterior */}
            {items.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/70 hover:bg-primary/20 text-primary border border-primary/40 rounded-none transition-colors z-50"
                title={isEs ? 'Anterior' : 'Previous'}
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            )}

            {/* Navegación Siguiente */}
            {items.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/70 hover:bg-primary/20 text-primary border border-primary/40 rounded-none transition-colors z-50"
                title={isEs ? 'Siguiente' : 'Next'}
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            )}

            {/* Contenedor Principal */}
            <div
              className="max-w-5xl max-h-[90vh] flex flex-col items-center bg-[#050505] border border-primary/50 shadow-2xl shadow-primary/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Imagen a alta resolución */}
              <div className="relative max-h-[70vh] w-full flex items-center justify-center bg-black overflow-hidden">
                <img
                  src={currentItem.image}
                  alt={currentItem.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
              </div>

              {/* Pie de foto / Información */}
              <div className="w-full p-4 sm:p-6 bg-[#080808] border-t border-primary/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="font-mono text-lg font-bold text-primary">
                    {(isEs ? currentItem.titleEs : currentItem.title) || currentItem.title || 'Untitled Transmission'}
                  </h4>
                  {((isEs ? currentItem.captionEs : currentItem.captionEn) || currentItem.captionEn) && (
                    <p className="font-mono text-xs text-muted-foreground mt-1 max-w-2xl">
                      {(isEs ? currentItem.captionEs : currentItem.captionEn) || currentItem.captionEn}
                    </p>
                  )}
                </div>

                <div className="font-mono text-xs text-primary/80 shrink-0 px-2.5 py-1 bg-primary/10 border border-primary/30">
                  {selectedIndex + 1} / {items.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
