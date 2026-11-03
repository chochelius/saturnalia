import type { TrackItem, Album } from './pocketbase';

export interface PlayerState {
  currentTrack: TrackItem | null;
  currentAlbum: Album | null;
  tracklist: TrackItem[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isDrawerOpen: boolean;
}

type Listener = (state: PlayerState) => void;

class AudioStore {
  private state: PlayerState = {
    currentTrack: null,
    currentAlbum: null,
    tracklist: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isDrawerOpen: false,
  };

  private listeners = new Set<Listener>();
  private audio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'metadata';

      this.audio.addEventListener('timeupdate', () => {
        if (!this.audio) return;
        this.updateState({ currentTime: this.audio.currentTime });
      });

      this.audio.addEventListener('loadedmetadata', () => {
        if (!this.audio) return;
        this.updateState({ duration: this.audio.duration || 0 });
      });

      this.audio.addEventListener('ended', () => {
        this.nextTrack();
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('Audio playback error:', e);
        this.updateState({ isPlaying: false });
      });
    }
  }

  getState(): PlayerState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(partial: Partial<PlayerState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }

  playTrack(track: TrackItem, album: Album, tracklist: TrackItem[] = []) {
    if (!this.audio) return;
    const url = track.streamUrl;
    if (!url) {
      console.warn('Track has no streamUrl');
      return;
    }

    const isSameTrack = this.state.currentTrack?.id === track.id;
    if (isSameTrack && this.audio.src) {
      this.togglePlay();
      return;
    }

    this.audio.src = url;
    this.audio.volume = this.state.isMuted ? 0 : this.state.volume;
    this.audio.play().catch((err) => console.warn('Audio play failed:', err));

    this.updateState({
      currentTrack: track,
      currentAlbum: album,
      tracklist: tracklist.length > 0 ? tracklist : [track],
      isPlaying: true,
      currentTime: 0,
    });
  }

  togglePlay() {
    if (!this.audio || !this.state.currentTrack) return;
    if (this.state.isPlaying) {
      this.audio.pause();
      this.updateState({ isPlaying: false });
    } else {
      this.audio.play().catch((err) => console.warn('Audio play failed:', err));
      this.updateState({ isPlaying: true });
    }
  }

  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.updateState({ isPlaying: false });
  }

  seek(time: number) {
    if (!this.audio) return;
    this.audio.currentTime = time;
    this.updateState({ currentTime: time });
  }

  setVolume(volume: number) {
    if (!this.audio) return;
    this.audio.volume = volume;
    this.updateState({ volume, isMuted: volume === 0 });
  }

  toggleMute() {
    if (!this.audio) return;
    const nextMuted = !this.state.isMuted;
    this.audio.volume = nextMuted ? 0 : this.state.volume;
    this.updateState({ isMuted: nextMuted });
  }

  toggleDrawer() {
    this.updateState({ isDrawerOpen: !this.state.isDrawerOpen });
  }

  nextTrack() {
    const { currentTrack, tracklist, currentAlbum } = this.state;
    if (!currentTrack || tracklist.length === 0 || !currentAlbum) return;

    const currentIndex = tracklist.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex >= 0 && currentIndex < tracklist.length - 1) {
      const next = tracklist[currentIndex + 1];
      this.playTrack(next, currentAlbum, tracklist);
    } else {
      this.updateState({ isPlaying: false, currentTime: 0 });
    }
  }

  prevTrack() {
    const { currentTrack, tracklist, currentAlbum } = this.state;
    if (!currentTrack || tracklist.length === 0 || !currentAlbum) return;

    if (this.audio && this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      this.updateState({ currentTime: 0 });
      return;
    }

    const currentIndex = tracklist.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      const prev = tracklist[currentIndex - 1];
      this.playTrack(prev, currentAlbum, tracklist);
    } else {
      if (this.audio) this.audio.currentTime = 0;
      this.updateState({ currentTime: 0 });
    }
  }

  closePlayer() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
    this.updateState({
      currentTrack: null,
      currentAlbum: null,
      tracklist: [],
      isPlaying: false,
      isDrawerOpen: false,
      currentTime: 0,
    });
  }
}

let globalAudioStore: AudioStore;

export function getAudioStore(): AudioStore {
  if (typeof window === 'undefined') {
    return new AudioStore();
  }
  if (!globalAudioStore) {
    globalAudioStore = new AudioStore();
  }
  return globalAudioStore;
}
