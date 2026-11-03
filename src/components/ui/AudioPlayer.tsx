import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  Disc3,
  Music2,
  ListMusic,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getAudioStore, type PlayerState } from "../../lib/audioStore";
import type { Album, TrackItem } from "../../lib/pocketbase";

interface AudioPlayerProps {
  title: string;
  album?: Album;
  tracks?: TrackItem[];
  audioUrl?: string;
  streamUrl?: string;
  bandcampEmbedId?: string;
  lang?: "en" | "es";
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  title,
  album,
  tracks = [],
  audioUrl,
  streamUrl,
  bandcampEmbedId,
  lang = "es",
}) => {
  const [isPlayingLocal, setIsPlayingLocal] = useState(false);
  const [currentTimeLocal, setCurrentTimeLocal] = useState(0);
  const [durationLocal, setDurationLocal] = useState(0);
  const [isMutedLocal, setIsMutedLocal] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showTracklist, setShowTracklist] = useState(false);
  const audioLocalRef = useRef<HTMLAudioElement | null>(null);

  // Estado del reproductor global StickyBottomPlayer
  const [globalState, setGlobalState] = useState<PlayerState>(() => getAudioStore().getState());
  const store = getAudioStore();
  const isEs = lang === "es";

  useEffect(() => {
    const unsubscribe = store.subscribe((st) => setGlobalState(st));
    return unsubscribe;
  }, []);

  // Listeners para fallback de audio local
  useEffect(() => {
    const audio = audioLocalRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTimeLocal(audio.currentTime);
    const onLoadedMetadata = () => setDurationLocal(audio.duration || 0);
    const onEnded = () => setIsPlayingLocal(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlayLocal = () => {
    if (!audioLocalRef.current) return;
    if (isPlayingLocal) {
      audioLocalRef.current.pause();
      setIsPlayingLocal(false);
    } else {
      audioLocalRef.current.play();
      setIsPlayingLocal(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // ========================================================
  // CASO 1: ÁLBUM CON TRACKS ALOJADOS EN CLOUDFLARE R2
  // ========================================================
  if (tracks && tracks.length > 0 && album) {
    const isThisAlbumPlaying =
      globalState.currentAlbum?.id === album.id && globalState.isPlaying;

    return (
      <div className="w-full mt-3 space-y-2 font-mono">
        {/* Botón principal: Reproducir Álbum completo / Pausar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isThisAlbumPlaying) {
                store.togglePlay();
              } else {
                const firstTrack = tracks[0];
                store.playTrack(firstTrack, album, tracks);
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-primary/50 bg-primary/10 hover:bg-primary hover:text-black text-primary font-headline text-xs uppercase tracking-wider transition-all duration-300 shadow-sm shadow-primary/20"
          >
            {isThisAlbumPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>{isEs ? "Pausar Álbum" : "Pause Album"}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>
                  {isEs
                    ? `Escuchar Álbum (${tracks.length})`
                    : `Play Album (${tracks.length})`}
                </span>
              </>
            )}
          </button>

          {/* Botón Desplegable para ver Tracklist */}
          <button
            onClick={() => setShowTracklist(!showTracklist)}
            className={`px-3 py-2 border transition-colors flex items-center gap-1.5 text-xs uppercase tracking-wider ${
              showTracklist
                ? "bg-primary text-black border-primary font-bold"
                : "bg-[#111] hover:bg-primary/20 text-foreground border-primary/40"
            }`}
            title={isEs ? "Ver lista de canciones" : "View tracklist"}
          >
            <ListMusic className="w-3.5 h-3.5" />
            {showTracklist ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Lista de Pistas Desplegable */}
        {showTracklist && (
          <div className="p-2.5 bg-[#050505] border border-primary/30 rounded-none space-y-1 animate-in fade-in duration-200 text-xs">
            {tracks.map((trk, i) => {
              const isThisTrackPlaying =
                globalState.currentTrack?.id === trk.id && globalState.isPlaying;
              const isThisTrackSelected = globalState.currentTrack?.id === trk.id;

              return (
                <button
                  key={trk.id}
                  onClick={() => store.playTrack(trk, album, tracks)}
                  className={`w-full text-left p-1.5 flex items-center justify-between transition-colors ${
                    isThisTrackSelected
                      ? "bg-primary/20 text-primary font-bold border-l-2 border-primary pl-2"
                      : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] w-4 opacity-70">
                      {isThisTrackPlaying ? "▶" : `#${trk.trackNumber || i + 1}`}
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
        )}
      </div>
    );
  }

  // ========================================================
  // CASO 2: FALLBACK CON ARCHIVO DE AUDIO DIRECTO (PREVIEW)
  // ========================================================
  if (audioUrl) {
    return (
      <div className="w-full mt-3 p-3 bg-[#020202] border border-primary/40 text-foreground transition-all duration-300 font-mono">
        <audio ref={audioLocalRef} src={audioUrl} preload="metadata" />
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Music2 className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
            <span className="text-xs font-headline uppercase tracking-wider truncate text-accent">
              {isEs ? "Pista Local / PocketBase" : "Track / PocketBase"}
            </span>
          </div>
          <span className="text-xs font-cover text-ghost-glow">
            {formatTime(currentTimeLocal)} / {formatTime(durationLocal)}
          </span>
        </div>

        <div className="relative flex items-center mb-2">
          <input
            type="range"
            min="0"
            max={durationLocal || 100}
            value={currentTimeLocal}
            onChange={(e) => {
              const time = Number(e.target.value);
              if (audioLocalRef.current) {
                audioLocalRef.current.currentTime = time;
                setCurrentTimeLocal(time);
              }
            }}
            className="w-full h-1 bg-primary/20 accent-[#1ca1e5] cursor-pointer appearance-none rounded-none"
            aria-label="Progreso de audio"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={togglePlayLocal}
            className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/60 hover:bg-primary hover:text-black text-primary font-headline text-xs uppercase tracking-wider transition-colors duration-200"
          >
            {isPlayingLocal ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{isEs ? "Pausar" : "Pause"}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{isEs ? "Reproducir" : "Play"}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!audioLocalRef.current) return;
                audioLocalRef.current.muted = !isMutedLocal;
                setIsMutedLocal(!isMutedLocal);
              }}
              className="p-1 text-primary hover:text-accent transition-colors"
            >
              {isMutedLocal ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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

  // ========================================================
  // CASO 3: EMBED DE BANDCAMP O ENLACE EXTERNO
  // ========================================================
  return (
    <div className="w-full mt-3 font-mono">
      {!showEmbed ? (
        <button
          onClick={() => setShowEmbed(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-primary/40 bg-[#020202] hover:border-primary hover:bg-primary/10 text-primary font-headline text-xs uppercase tracking-wider transition-all duration-300"
        >
          <Disc3 className="w-4 h-4 text-accent animate-spin-slow" />
          <span>{isEs ? "Escuchar Preview" : "Listen Preview"}</span>
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
                {isEs
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
                <span>{isEs ? "Abrir en Bandcamp" : "Open on Bandcamp"}</span>
              </a>
            </div>
          )}
          <button
            onClick={() => setShowEmbed(false)}
            className="w-full text-center text-[10px] uppercase font-headline tracking-widest text-muted-foreground hover:text-primary transition-colors py-1"
          >
            {isEs ? "— Ocultar Reproductor —" : "— Hide Player —"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
