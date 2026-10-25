import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, ExternalLink, Disc3, Music2 } from "lucide-react";

interface AudioPlayerProps {
  title: string;
  audioUrl?: string;
  streamUrl?: string;
  bandcampEmbedId?: string;
  lang?: "en" | "es";
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  title,
  audioUrl,
  streamUrl,
  bandcampEmbedId,
  lang = "es",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // 1. Si hay archivo de audio directo cargado en PocketBase
  if (audioUrl) {
    return (
      <div className="w-full mt-3 p-3 bg-[#020202] border border-primary/40 text-foreground transition-all duration-300">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Music2 className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
            <span className="text-xs font-headline uppercase tracking-wider truncate text-accent">
              {lang === "es" ? "Pista Local / PocketBase" : "Track / PocketBase"}
            </span>
          </div>
          <span className="text-xs font-cover text-ghost-glow">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Barra de progreso interactiva */}
        <div className="relative flex items-center mb-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-primary/20 accent-[#1ca1e5] cursor-pointer appearance-none rounded-none"
            aria-label="Progreso de audio"
          />
        </div>

        {/* Controles de reproducción */}
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/60 hover:bg-primary hover:text-black text-primary font-headline text-xs uppercase tracking-wider transition-colors duration-200"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{lang === "es" ? "Pausar" : "Pause"}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{lang === "es" ? "Reproducir" : "Play"}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1 text-primary hover:text-accent transition-colors"
              aria-label={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            {streamUrl && (
              <a
                href={streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors text-xs flex items-center gap-1"
                title="Abrir enlace externo"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Si no hay archivo de audio nativo, ofrecemos reproductor embebido / streaming
  return (
    <div className="w-full mt-3">
      {!showEmbed ? (
        <button
          onClick={() => setShowEmbed(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-primary/40 bg-[#020202] hover:border-primary hover:bg-primary/10 text-primary font-headline text-xs uppercase tracking-wider transition-all duration-300"
        >
          <Disc3 className="w-4 h-4 text-accent animate-spin-slow" />
          <span>{lang === "es" ? "Escuchar Preview" : "Listen Preview"}</span>
        </button>
      ) : (
        <div className="space-y-2 animate-in fade-in duration-300">
          {bandcampEmbedId ? (
            <div className="w-full bg-[#020202] border border-primary/40 p-1">
              <iframe
                style={{ border: 0, width: "100%", height: "42px" }}
                src={`https://bandcamp.com/EmbeddedPlayer/album=${bandcampEmbedId}/size=small/bgcol=020202/linkcol=1ca1e5/transparent=true/`}
                seamless
                title={`${title} Bandcamp Player`}
                loading="lazy"
              >
                <a href={streamUrl}>{title}</a>
              </iframe>
            </div>
          ) : (
            <div className="p-3 bg-[#020202] border border-primary/40 text-xs text-center">
              <p className="text-muted-foreground mb-2">
                {lang === "es"
                  ? "Disponible para transmisión completa en streaming:"
                  : "Available for full streaming transmission:"}
              </p>
              <a
                href={streamUrl || "https://saturnalia999.bandcamp.com/releases"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-black font-headline uppercase text-xs tracking-wider transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{lang === "es" ? "Abrir en Bandcamp" : "Open on Bandcamp"}</span>
              </a>
            </div>
          )}
          <button
            onClick={() => setShowEmbed(false)}
            className="w-full text-center text-[10px] uppercase font-headline tracking-widest text-muted-foreground hover:text-primary transition-colors py-1"
          >
            {lang === "es" ? "— Ocultar Reproductor —" : "— Hide Player —"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
