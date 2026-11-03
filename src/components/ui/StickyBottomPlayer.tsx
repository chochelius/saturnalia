import React, { useEffect, useState } from 'react';
import { getAudioStore, type PlayerState } from '../../lib/audioStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
  X,
  ExternalLink,
  Disc,
} from 'lucide-react';

interface StickyBottomPlayerProps {
  lang?: string;
}

export default function StickyBottomPlayer({ lang = 'es' }: StickyBottomPlayerProps) {
  const [playerState, setPlayerState] = useState<PlayerState>(() => getAudioStore().getState());
  const store = getAudioStore();
  const isEs = lang === 'es';

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setPlayerState(newState);
    });
    return unsubscribe;
  }, []);

  const {
    currentTrack,
    currentAlbum,
    tracklist,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isDrawerOpen,
  } = playerState;

  if (!currentTrack || !currentAlbum) {
    return null;
  }

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* DRAWER POPUP DE TRACKLIST */}
      {isDrawerOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-[#070707] border border-primary/50 rounded-lg shadow-2xl p-4 font-mono text-xs backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-primary/20 mb-3">
            <div className="flex items-center gap-2">
              <Disc className="w-4 h-4 text-primary animate-spin" />
              <span className="font-bold text-foreground uppercase truncate max-w-[170px]">
                {currentAlbum.title}
              </span>
            </div>
            <button
              onClick={() => store.toggleDrawer()}
              className="text-muted-foreground hover:text-foreground p-1"
              title="Cerrar lista"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {tracklist.map((trk, i) => {
              const isSelected = trk.id === currentTrack.id;
              return (
                <button
                  key={trk.id}
                  onClick={() => store.playTrack(trk, currentAlbum, tracklist)}
                  className={`w-full text-left p-2 rounded flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-primary/15 text-primary font-bold border border-primary/40'
                      : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] opacity-70 w-4">
                      {isSelected && isPlaying ? '▶' : `#${trk.trackNumber || i + 1}`}
                    </span>
                    <span className="truncate">{trk.title}</span>
                  </div>
                  {trk.duration && (
                    <span className="text-[10px] opacity-60 ml-2 shrink-0">
                      {trk.duration}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {currentAlbum.streamUrl && (
            <div className="mt-3 pt-2 border-t border-primary/20 text-center">
              <a
                href={currentAlbum.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-primary hover:underline uppercase tracking-wider font-semibold"
              >
                <span>{isEs ? 'Comprar Álbum en Bandcamp' : 'Buy Album on Bandcamp'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* BARRA INFERIOR STICKY */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-md border-t border-primary/40 shadow-2xl shadow-primary/20 font-mono transition-all">
        {/* Línea delgada de progreso superior interactiva */}
        <div
          className="h-1 bg-black/60 relative cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            store.seek(clickPos * duration);
          }}
        >
          <div
            className="h-full bg-primary shadow-sm shadow-primary transition-all relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Lado Izquierdo: Info de Álbum y Pista */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-64">
            <img
              src={currentAlbum.cover}
              alt={currentAlbum.title}
              className="w-11 h-11 object-cover rounded border border-primary/40 shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                <span className="truncate">{currentTrack.title}</span>
              </h4>
              <p className="text-[11px] text-muted-foreground truncate">
                {currentAlbum.title}
              </p>
              {currentAlbum.streamUrl && (
                <a
                  href={currentAlbum.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-0.5"
                >
                  <span>Bandcamp</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>

          {/* Centro: Controles de Reproducción y Tiempo */}
          <div className="flex flex-col items-center gap-1 flex-1 max-w-md">
            <div className="flex items-center gap-4">
              <button
                onClick={() => store.prevTrack()}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title={isEs ? 'Pista anterior' : 'Previous track'}
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => store.togglePlay()}
                className="w-9 h-9 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-all shadow-md shadow-primary/30"
                title={isPlaying ? (isEs ? 'Pausar' : 'Pause') : (isEs ? 'Reproducir' : 'Play')}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={() => store.nextTrack()}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title={isEs ? 'Siguiente pista' : 'Next track'}
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Scrubber con tiempos en desktop */}
            <div className="hidden sm:flex items-center gap-2 w-full text-[10px] text-muted-foreground">
              <span className="w-8 text-right font-mono">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 1}
                step="0.1"
                value={currentTime}
                onChange={(e) => store.seek(Number(e.target.value))}
                className="w-full h-1 bg-[#222] rounded accent-primary cursor-pointer"
              />
              <span className="w-8 font-mono">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Lado Derecho: Volumen, Cajón de Tracklist y Cerrar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Control de volumen (desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 bg-[#111] px-2 py-1 rounded border border-primary/20">
              <button
                onClick={() => store.toggleMute()}
                className="text-muted-foreground hover:text-foreground p-0.5"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-primary" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => store.setVolume(Number(e.target.value))}
                className="w-16 h-1 bg-[#222] rounded accent-primary cursor-pointer"
              />
            </div>

            {/* Botón cajón de pistas */}
            <button
              onClick={() => store.toggleDrawer()}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors ${
                isDrawerOpen
                  ? 'bg-primary text-black font-bold border-primary'
                  : 'bg-[#111] hover:bg-primary/20 text-foreground border-primary/30'
              }`}
              title={isEs ? 'Ver lista de canciones' : 'View tracklist'}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tracklist</span>
              <span className="text-[10px] opacity-70">({tracklist.length})</span>
            </button>

            {/* Botón cerrar reproductor */}
            <button
              onClick={() => store.closePlayer()}
              className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
              title={isEs ? 'Cerrar reproductor' : 'Close player'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
