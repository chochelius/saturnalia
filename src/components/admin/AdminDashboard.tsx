import React, { useState, useEffect, useRef } from 'react';
import {
  pb,
  type Album,
  type Bio,
  type Socials,
  type LinkItem,
  type SiteTexts,
} from '../../lib/pocketbase';
import {
  Lock,
  LogOut,
  Save,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Video,
  FileText,
  Music,
  Share2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
  Image as ImageIcon,
  UploadCloud,
  Camera,
  Edit2,
  X,
  Headphones,
  Play,
  Pause,
  Volume2,
  ChevronUp,
  ChevronDown,
  Disc,
} from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estados de datos
  const [activeTab, setActiveTab] = useState<'hero' | 'bio' | 'albums' | 'tracks' | 'gallery' | 'links' | 'socials'>('hero');
  const [siteTexts, setSiteTexts] = useState<any>(null);
  const [siteTextsId, setSiteTextsId] = useState<string>('');

  const [bio, setBio] = useState<any>(null);
  const [bioId, setBioId] = useState<string>('');

  const [socials, setSocials] = useState<any>(null);
  const [socialsId, setSocialsId] = useState<string>('');

  const [albums, setAlbums] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  // Estados de interfaz y feedback
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [rebuildStatus, setRebuildStatus] = useState<string>('idle');
  const [isRebuilding, setIsRebuilding] = useState(false);

  // Modal para nuevo o editar álbum
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
  // Modal para nuevo o editar foto de galería
  const [editingGalleryItem, setEditingGalleryItem] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  // Modal para nuevo o editar enlace
  const [editingLink, setEditingLink] = useState<any | null>(null);

  // Estados para Pistas de Audio (Tracks)
  const [selectedAlbumFilter, setSelectedAlbumFilter] = useState<string>('all');
  const [editingTrack, setEditingTrack] = useState<any | null>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>('');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const adminAudioRef = useRef<HTMLAudioElement | null>(null);

  // Comprobar y validar autenticación al montar
  useEffect(() => {
    const checkAuth = async () => {
      if (pb.authStore.isValid) {
        try {
          // Validar el token contra el servidor PocketBase
          if (pb.authStore.isSuperuser || pb.authStore.record?.collectionName === '_superusers') {
            await pb.collection('_superusers').authRefresh();
          } else {
            await pb.collection('users').authRefresh();
          }
          setIsAuthenticated(true);
          loadAllData();
        } catch {
          // Token inválido o revocado en el servidor
          pb.authStore.clear();
          setIsAuthenticated(false);
          setAuthError('Tu sesión anterior expiró. Por favor ingresa nuevamente con tus credenciales.');
        }
      }
    };
    checkAuth();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');

    const rawIdentifier = authEmail.trim();
    const resolvedEmail = rawIdentifier === 'admin'
      ? 'admin@saturnalia999.com'
      : (rawIdentifier.includes('@') ? rawIdentifier : `${rawIdentifier}@saturnalia999.com`);

    try {
      // 1. Intentar como superusuario PocketBase v0.25+
      try {
        await pb.collection('_superusers').authWithPassword(resolvedEmail, authPassword);
      } catch {
        // 2. Intentar como usuario estándar
        await pb.collection('users').authWithPassword(resolvedEmail, authPassword);
      }

      setIsAuthenticated(true);
      showNotification('success', 'Acceso autorizado. Terminal iniciada.');
      loadAllData();
    } catch (err: any) {
      setAuthError(err.message || 'Error de autenticación. Verifica las credenciales.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setIsAuthenticated(false);
    showNotification('success', 'Sesión cerrada correctamente.');
  };

  const loadAllData = async () => {
    try {
      // 1. Textos del sitio
      const textsRec = await pb.collection('site_texts').getFirstListItem('', { requestKey: null }).catch(() => null);
      if (textsRec) {
        setSiteTextsId(textsRec.id);
        setSiteTexts({
          hero_title_en: textsRec.hero_title_en || '',
          hero_title_es: textsRec.hero_title_es || '',
          hero_subtitle_en: textsRec.hero_subtitle_en || '',
          hero_subtitle_es: textsRec.hero_subtitle_es || '',
          hero_video_url: textsRec.hero_video_url || '',
          nav_home_en: textsRec.nav_home_en || '',
          nav_home_es: textsRec.nav_home_es || '',
          nav_bio_en: textsRec.nav_bio_en || textsRec.nav_signal_en || '',
          nav_bio_es: textsRec.nav_bio_es || textsRec.nav_signal_es || '',
          nav_discography_en: textsRec.nav_discography_en || '',
          nav_discography_es: textsRec.nav_discography_es || '',
          nav_gallery_en: textsRec.nav_gallery_en || 'Gallery',
          nav_gallery_es: textsRec.nav_gallery_es || 'Galería',
          nav_contact_en: textsRec.nav_contact_en || '',
          nav_contact_es: textsRec.nav_contact_es || '',
          album_title_en: textsRec.album_title_en || '',
          album_title_es: textsRec.album_title_es || '',
          buy_now_en: textsRec.buy_now_en || '',
          buy_now_es: textsRec.buy_now_es || '',
          contact_title_en: textsRec.contact_title_en || '',
          contact_title_es: textsRec.contact_title_es || '',
          contact_desc_en: textsRec.contact_desc_en || '',
          contact_desc_es: textsRec.contact_desc_es || '',
          contact_name_label_en: textsRec.contact_name_label_en || '',
          contact_name_label_es: textsRec.contact_name_label_es || '',
          contact_name_placeholder_en: textsRec.contact_name_placeholder_en || '',
          contact_name_placeholder_es: textsRec.contact_name_placeholder_es || '',
          contact_email_label_en: textsRec.contact_email_label_en || '',
          contact_email_label_es: textsRec.contact_email_label_es || '',
          contact_email_placeholder_en: textsRec.contact_email_placeholder_en || '',
          contact_email_placeholder_es: textsRec.contact_email_placeholder_es || '',
          contact_msg_label_en: textsRec.contact_msg_label_en || '',
          contact_msg_label_es: textsRec.contact_msg_label_es || '',
          contact_msg_placeholder_en: textsRec.contact_msg_placeholder_en || '',
          contact_msg_placeholder_es: textsRec.contact_msg_placeholder_es || '',
          contact_submit_en: textsRec.contact_submit_en || '',
          contact_submit_es: textsRec.contact_submit_es || '',
          contact_toast_title_en: textsRec.contact_toast_title_en || '',
          contact_toast_title_es: textsRec.contact_toast_title_es || '',
          contact_toast_desc_en: textsRec.contact_toast_desc_en || '',
          contact_toast_desc_es: textsRec.contact_toast_desc_es || '',
        });
      }

      // 2. Biografía
      const bioRec = await pb.collection('bio').getFirstListItem('', { requestKey: null }).catch(() => null);
      if (bioRec) {
        setBioId(bioRec.id);
        setBio({
          title_en: bioRec.title_en || '',
          title_es: bioRec.title_es || '',
          paragraphs_en: Array.isArray(bioRec.paragraphs_en) ? bioRec.paragraphs_en : [],
          paragraphs_es: Array.isArray(bioRec.paragraphs_es) ? bioRec.paragraphs_es : [],
        });
      }

      // 3. Redes sociales
      const socRec = await pb.collection('socials').getFirstListItem('', { requestKey: null }).catch(() => null);
      if (socRec) {
        setSocialsId(socRec.id);
        setSocials({
          spotify: socRec.spotify || '',
          youtube: socRec.youtube || '',
          bandcamp: socRec.bandcamp || '',
          instagram: socRec.instagram || '',
          linktree: socRec.linktree || '',
        });
      }

      // 4. Álbumes
      const albList = await pb.collection('albums').getFullList({ sort: 'order', requestKey: null }).catch(() => []);
      setAlbums(albList);

      // 4.1 Pistas de Audio (Tracks)
      const trkList = await pb.collection('tracks').getFullList({ sort: 'order', requestKey: null }).catch(() => []);
      setTracks(trkList);

      // 5. Galería fotográfica
      const galList = await pb.collection('gallery').getFullList({ sort: 'order', requestKey: null }).catch(() => []);
      setGallery(galList);

      // 6. Enlaces
      const lnkList = await pb.collection('links').getFullList({ sort: 'order', requestKey: null }).catch(() => []);
      setLinks(lnkList);
    } catch (err: any) {
      showNotification('error', `Error cargando datos: ${err.message}`);
    }
  };

  const handleAuthError = (err: any, actionName: string) => {
    if (err.status === 401 || err.status === 403 || err.status === 404) {
      showNotification('error', `Sesión expirada o no autorizada al ${actionName}. Por favor inicia sesión nuevamente.`);
      pb.authStore.clear();
      setIsAuthenticated(false);
      setAuthError('Tu sesión anterior expiró. Por favor ingresa con tus credenciales.');
    } else {
      showNotification('error', `Error al ${actionName}: ${err.message}`);
    }
  };

  // Guardar Textos de Secciones
  const handleSaveTexts = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...siteTexts,
        nav_signal_en: siteTexts?.nav_bio_en || siteTexts?.nav_signal_en || 'Bio',
        nav_signal_es: siteTexts?.nav_bio_es || siteTexts?.nav_signal_es || 'Bio',
      };
      if (siteTextsId) {
        await pb.collection('site_texts').update(siteTextsId, payload);
      } else {
        const created = await pb.collection('site_texts').create(payload);
        setSiteTextsId(created.id);
      }
      showNotification('success', 'Textos guardados exitosamente.');
    } catch (err: any) {
      handleAuthError(err, 'guardar textos');
    } finally {
      setIsSaving(false);
    }
  };

  // Guardar Biografía
  const handleSaveBio = async () => {
    setIsSaving(true);
    try {
      if (bioId) {
        await pb.collection('bio').update(bioId, bio);
      } else {
        const created = await pb.collection('bio').create(bio);
        setBioId(created.id);
      }
      showNotification('success', 'Biografía guardada exitosamente.');
    } catch (err: any) {
      handleAuthError(err, 'guardar biografía');
    } finally {
      setIsSaving(false);
    }
  };

  // Guardar Redes Sociales
  const handleSaveSocials = async () => {
    setIsSaving(true);
    try {
      if (socialsId) {
        await pb.collection('socials').update(socialsId, socials);
      } else {
        const created = await pb.collection('socials').create(socials);
        setSocialsId(created.id);
      }
      showNotification('success', 'Redes sociales guardadas exitosamente.');
    } catch (err: any) {
      handleAuthError(err, 'guardar redes');
    } finally {
      setIsSaving(false);
    }
  };

  // Guardar Álbum (Crear o Editar)
  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum) return;
    setIsSaving(true);

    try {
      const data = {
        title: editingAlbum.title,
        price: Number(editingAlbum.price) || 0,
        cover: editingAlbum.cover || '',
        stream_url: editingAlbum.stream_url || '',
        audio_url: editingAlbum.audio_url || '',
        bandcamp_embed_id: editingAlbum.bandcamp_embed_id || '',
        spotify_url: editingAlbum.spotify_url || '',
        player_source: editingAlbum.player_source || 'auto',
        order: Number(editingAlbum.order) || 1,
      };

      if (editingAlbum.id) {
        await pb.collection('albums').update(editingAlbum.id, data);
        showNotification('success', `Álbum "${data.title}" actualizado.`);
      } else {
        await pb.collection('albums').create(data);
        showNotification('success', `Álbum "${data.title}" creado.`);
      }

      setEditingAlbum(null);
      const updatedList = await pb.collection('albums').getFullList({ sort: 'order', requestKey: null });
      setAlbums(updatedList);
    } catch (err: any) {
      handleAuthError(err, 'guardar álbum');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAlbum = async (id: string, title: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el álbum "${title}"?`)) return;
    try {
      await pb.collection('albums').delete(id);
      setAlbums(albums.filter((a) => a.id !== id));
      showNotification('success', `Álbum "${title}" eliminado.`);
    } catch (err: any) {
      handleAuthError(err, 'eliminar álbum');
    }
  };

  // Helper para resolver URL de imagen de galería
  const getGalleryImageUrl = (item: any) => {
    if (item.image) {
      return pb.files.getURL(item, item.image);
    }
    return item.image_url || 'https://f4.bcbits.com/img/a4169686274_2.jpg';
  };

  // Guardar Foto de Galería (Crear o Editar, soporta subida de archivos y URLs)
  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGalleryItem) return;
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', editingGalleryItem.title || '');
      formData.append('title_es', editingGalleryItem.title_es || '');
      formData.append('caption_en', editingGalleryItem.caption_en || '');
      formData.append('caption_es', editingGalleryItem.caption_es || '');
      formData.append('order', String(editingGalleryItem.order || 1));

      if (editingGalleryItem.image_url) {
        formData.append('image_url', editingGalleryItem.image_url);
      }
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      if (editingGalleryItem.id) {
        await pb.collection('gallery').update(editingGalleryItem.id, formData);
        showNotification('success', `Foto "${editingGalleryItem.title || 'Foto'}" actualizada.`);
      } else {
        await pb.collection('gallery').create(formData);
        showNotification('success', `Foto "${editingGalleryItem.title || 'Foto'}" subida exitosamente.`);
      }

      setEditingGalleryItem(null);
      setSelectedFile(null);
      setPreviewUrl('');
      const updatedList = await pb.collection('gallery').getFullList({ sort: 'order', requestKey: null });
      setGallery(updatedList);
    } catch (err: any) {
      handleAuthError(err, 'guardar foto en galería');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGalleryItem = async (id: string, title: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la foto "${title || 'Foto'}" de la galería?`)) return;
    try {
      await pb.collection('gallery').delete(id);
      setGallery(gallery.filter((g) => g.id !== id));
      showNotification('success', `Foto eliminada exitosamente.`);
    } catch (err: any) {
      handleAuthError(err, 'eliminar foto de la galería');
    }
  };

  // ==========================================
  // HANDLERS: PISTAS / AUDIO TRACKS (CLOUDFLARE R2)
  // ==========================================
  const getTrackAudioUrl = (track: any) => {
    if (track.audio_file) {
      return `https://media.saturnalia999.art/${track.collectionId || 'pbc_327047008'}/${track.id}/${track.audio_file}`;
    }
    return track.audio_url || '';
  };

  const handleAudioFileSelect = (file: File) => {
    setSelectedAudioFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAudioPreviewUrl(objectUrl);

    // Auto-detectar duración
    const tempAudio = new Audio(objectUrl);
    tempAudio.addEventListener('loadedmetadata', () => {
      const sec = Math.round(tempAudio.duration);
      if (sec && !isNaN(sec)) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        const durStr = `${m}:${s < 10 ? '0' : ''}${s}`;
        setEditingTrack((prev: any) => prev ? { ...prev, duration: durStr } : prev);
      }
    });
  };

  const handleTogglePlayPreview = (track: any) => {
    if (playingTrackId === track.id) {
      if (adminAudioRef.current) {
        adminAudioRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      const url = getTrackAudioUrl(track);
      if (!url) {
        showNotification('error', 'Esta pista no tiene archivo de audio ni URL asignada.');
        return;
      }
      if (adminAudioRef.current) {
        adminAudioRef.current.src = url;
        adminAudioRef.current.play().catch((err) => {
          showNotification('error', `Error al reproducir audio: ${err.message}`);
        });
      }
      setPlayingTrackId(track.id);
    }
  };

  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;
    if (!editingTrack.album) {
      showNotification('error', 'Debes seleccionar un álbum para asignar esta pista.');
      return;
    }
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', editingTrack.title || 'Sin título');
      formData.append('album', editingTrack.album);
      formData.append('track_number', String(editingTrack.track_number || 1));
      formData.append('order', String(editingTrack.order || 1));
      formData.append('duration', editingTrack.duration || '');

      if (editingTrack.audio_url) {
        formData.append('audio_url', editingTrack.audio_url);
      }
      if (editingTrack.external_url) {
        formData.append('external_url', editingTrack.external_url);
      }
      if (selectedAudioFile) {
        formData.append('audio_file', selectedAudioFile);
      }

      if (editingTrack.id) {
        await pb.collection('tracks').update(editingTrack.id, formData);
        showNotification('success', `Pista "${editingTrack.title}" actualizada.`);
      } else {
        await pb.collection('tracks').create(formData);
        showNotification('success', `Pista "${editingTrack.title}" subida exitosamente a Cloudflare R2.`);
      }

      setEditingTrack(null);
      setSelectedAudioFile(null);
      setAudioPreviewUrl('');
      const updatedList = await pb.collection('tracks').getFullList({ sort: 'order', requestKey: null });
      setTracks(updatedList);
    } catch (err: any) {
      handleAuthError(err, 'guardar pista');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTrack = async (id: string, title: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la pista "${title}"? Se borrará de Cloudflare R2.`)) return;
    try {
      if (playingTrackId === id && adminAudioRef.current) {
        adminAudioRef.current.pause();
        setPlayingTrackId(null);
      }
      await pb.collection('tracks').delete(id);
      setTracks(tracks.filter((t) => t.id !== id));
      showNotification('success', `Pista "${title}" eliminada de PocketBase y R2.`);
    } catch (err: any) {
      handleAuthError(err, 'eliminar pista');
    }
  };

  const handleMoveTrackOrder = async (track: any, direction: 'up' | 'down') => {
    const albumTracks = tracks
      .filter((t) => t.album === track.album)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    const index = albumTracks.findIndex((t) => t.id === track.id);
    if (index === -1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= albumTracks.length) return;

    const currentTrack = albumTracks[index];
    const targetTrack = albumTracks[swapIndex];

    const currentOrder = Number(currentTrack.order) || (index + 1);
    const targetOrder = Number(targetTrack.order) || (swapIndex + 1);

    try {
      await pb.collection('tracks').update(currentTrack.id, { order: targetOrder });
      await pb.collection('tracks').update(targetTrack.id, { order: currentOrder });

      const updated = await pb.collection('tracks').getFullList({ sort: 'order', requestKey: null });
      setTracks(updated);
      showNotification('success', 'Orden actualizado.');
    } catch (err: any) {
      handleAuthError(err, 'reordenar pista');
    }
  };

  // Guardar Enlace (Crear o Editar)
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    setIsSaving(true);

    try {
      const data = {
        title: editingLink.title,
        title_es: editingLink.title_es || editingLink.title,
        url: editingLink.url,
        category: editingLink.category || 'music',
        icon: editingLink.icon || 'globe',
        order: Number(editingLink.order) || 1,
      };

      if (editingLink.id) {
        await pb.collection('links').update(editingLink.id, data);
        showNotification('success', `Enlace "${data.title}" actualizado.`);
      } else {
        await pb.collection('links').create(data);
        showNotification('success', `Enlace "${data.title}" creado.`);
      }

      setEditingLink(null);
      const updatedLinks = await pb.collection('links').getFullList({ sort: 'order', requestKey: null });
      setLinks(updatedLinks);
    } catch (err: any) {
      handleAuthError(err, 'guardar enlace');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLink = async (id: string, title: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el enlace "${title}"?`)) return;
    try {
      await pb.collection('links').delete(id);
      setLinks(links.filter((l) => l.id !== id));
      showNotification('success', `Enlace "${title}" eliminado.`);
    } catch (err: any) {
      handleAuthError(err, 'eliminar enlace');
    }
  };

  // Reconstrucción del sitio estático
  const handleRebuild = async () => {
    setIsRebuilding(true);
    setRebuildStatus('building');
    showNotification('success', 'Iniciando compilación en vivo en el servidor...');

    try {
      const res = await fetch('/api/rebuild', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        // Sondear estado cada 3s hasta terminar
        const interval = setInterval(async () => {
          try {
            const statusRes = await fetch('/api/rebuild/status');
            const statusData = await statusRes.json();
            if (statusData.status === 'success') {
              clearInterval(interval);
              setIsRebuilding(false);
              setRebuildStatus('success');
              showNotification('success', '¡Transmisión estática actualizada y publicada con éxito!');
            } else if (statusData.status === 'error') {
              clearInterval(interval);
              setIsRebuilding(false);
              setRebuildStatus('error');
              showNotification('error', `Error de compilación: ${statusData.error}`);
            }
          } catch {
            clearInterval(interval);
            setIsRebuilding(false);
          }
        }, 3000);
      }
    } catch (err: any) {
      setIsRebuilding(false);
      setRebuildStatus('error');
      showNotification('error', `Error al disparar rebuild: ${err.message}`);
    }
  };

  // Helper para normalizar URL de YouTube a embed
  const getEmbedPreviewUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('/embed/')) return url;
    const matchWatch = url.match(/[?&]v=([^&#]+)/);
    if (matchWatch && matchWatch[1]) return `https://www.youtube.com/embed/${matchWatch[1]}`;
    const matchShort = url.match(/youtu\.be\/([^?&#]+)/);
    if (matchShort && matchShort[1]) return `https://www.youtube.com/embed/${matchShort[1]}`;
    return url;
  };

  // Si se abre desde GitHub Pages (saturnalia999.art), avisar que la base de datos reside en la Raspberry Pi
  const isGitHubPages = typeof window !== 'undefined' && 
    (window.location.hostname.includes('saturnalia999.art') || window.location.hostname.includes('github.io'));

  if (isGitHubPages) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202] p-4 font-mono relative">
        <div className="w-full max-w-lg bg-[#080808] border-2 border-primary/50 p-8 rounded shadow-2xl shadow-primary/20 text-center">
          <div className="p-3 bg-primary/10 border border-primary/40 rounded-full w-14 h-14 mx-auto mb-4 text-primary flex items-center justify-center animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-primary uppercase mb-2">
            CONSOLA DE CONTROL // RASPBERRY PI
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
            Sitio de Producción Estático
          </p>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded text-left text-xs space-y-3 mb-6 text-foreground/80">
            <p>
              🔒 <strong>Este dominio en GitHub Pages es de solo lectura y compilación estática.</strong>
            </p>
            <p>
              La base de datos viva (PocketBase) y el panel de administración operan exclusivamente en tu <strong>Raspberry Pi</strong>:
            </p>
            <div className="p-3 bg-black border border-primary/40 text-primary font-mono text-center select-all text-sm font-bold">
              http://192.168.1.118:9002/admin
            </div>
            <p className="text-[11px] text-muted-foreground">
              Para editar textos, biografía, discografía o enlaces, accede a la IP local de tu Raspberry Pi en tu red local.
            </p>
          </div>
          <a
            href="/"
            className="inline-block py-2.5 px-6 bg-primary text-black font-semibold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            Volver al Sitio Principal
          </a>
        </div>
      </div>
    );
  }

  // ==========================================
  // PANTALLA DE ACCESO / LOGIN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202] p-4 font-mono relative overflow-hidden">
        {/* Luces de fondo y grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(28,161,229,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="w-full max-w-md bg-[#080808] border-2 border-primary/50 p-8 rounded-lg shadow-2xl shadow-primary/20 relative z-10">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-primary/10 border border-primary/40 rounded-full mb-3 text-primary animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold tracking-widest text-primary uppercase">
              SATURNALIA999 // ACCESO
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
              Consola Central de Control de Contenidos
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-muted-foreground mb-1">
                Usuario o Email
              </label>
              <input
                type="text"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="admin"
                className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-muted-foreground mb-1">
                Clave de Cifrado (Password)
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-4 py-2.5 px-4 bg-primary text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Ingresar a la Terminal</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Sistema seguro con PocketBase & Astro SSG
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD PRINCIPAL
  // ==========================================
  return (
    <div className="min-h-screen bg-[#020202] text-foreground font-mono pb-20">
      {/* Barra Superior */}
      <header className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-md border-b border-primary/30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <h1 className="text-sm sm:text-base font-bold tracking-widest text-primary uppercase">
            SATURNALIA999 // CONTROL_SYSTEM
          </h1>
          <span className="hidden md:inline-block text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/40 uppercase">
            En línea
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#151515] hover:bg-[#202020] text-muted-foreground hover:text-foreground rounded border border-primary/20 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver Sitio</span>
          </a>

          <button
            onClick={handleRebuild}
            disabled={isRebuilding}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/20 hover:bg-primary/30 text-primary rounded border border-primary/50 transition-all font-semibold"
            title="Reconstruye las páginas estáticas del sitio con los datos actuales"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRebuilding ? 'animate-spin' : ''}`} />
            <span>{isRebuilding ? 'Compilando...' : 'Publicar Cambios'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-950/40 hover:bg-red-900/50 text-red-400 rounded border border-red-500/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Banner de Notificaciones flotante */}
      {message && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-lg shadow-xl border flex items-center gap-3 text-xs max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            message.type === 'success'
              ? 'bg-[#0a1a0f] border-green-500/50 text-green-300'
              : 'bg-[#1a0a0a] border-red-500/50 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Pestañas de Navegación del Panel */}
        <div className="flex border-b border-primary/30 overflow-x-auto gap-2 pb-px mb-8 scrollbar-none">
          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'hero'
                ? 'border-primary text-primary font-bold bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-[#111]'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Hero & Video</span>
          </button>

          <button
            onClick={() => setActiveTab('bio')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'bio'
                ? 'border-primary text-primary font-bold bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-[#111]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Bio</span>
          </button>

          <button
            onClick={() => setActiveTab('albums')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'albums'
                ? 'border-primary text-primary font-bold bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-[#111]'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Discografía ({albums.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tracks')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'tracks'
                ? 'border-primary text-primary font-bold bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-[#111]'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Pistas / Audio ({tracks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'gallery'
                ? 'border-primary text-primary font-bold bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-[#111]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Galería ({gallery.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'links'
                ? 'border-primary text-primary font-bold bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-[#111]'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Enlaces /links ({links.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('socials')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'socials'
                ? 'border-primary text-primary font-bold bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-[#111]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Redes & Contacto</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: HERO & VIDEO */}
        {/* ========================================================= */}
        {activeTab === 'hero' && siteTexts && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-primary/20">
              <div>
                <h2 className="text-base font-bold text-primary uppercase">Sección Hero & Video Principal</h2>
                <p className="text-xs text-muted-foreground">Configura los títulos bilingües y el video destacado de YouTube.</p>
              </div>
              <button
                onClick={handleSaveTexts}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Hero'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Títulos en Inglés */}
              <div className="bg-[#080808] border border-primary/30 p-5 rounded-lg space-y-4">
                <span className="text-xs uppercase font-bold text-primary/80 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Transmisión en Inglés (EN)
                </span>
                <div>
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Título Hero (EN)</label>
                  <input
                    type="text"
                    value={siteTexts.hero_title_en}
                    onChange={(e) => setSiteTexts({ ...siteTexts, hero_title_en: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Subtítulo Hero (EN)</label>
                  <textarea
                    rows={3}
                    value={siteTexts.hero_subtitle_en}
                    onChange={(e) => setSiteTexts({ ...siteTexts, hero_subtitle_en: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>

              {/* Títulos en Español */}
              <div className="bg-[#080808] border border-primary/30 p-5 rounded-lg space-y-4">
                <span className="text-xs uppercase font-bold text-primary/80 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Transmisión en Español (ES)
                </span>
                <div>
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Título Hero (ES)</label>
                  <input
                    type="text"
                    value={siteTexts.hero_title_es}
                    onChange={(e) => setSiteTexts({ ...siteTexts, hero_title_es: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Subtítulo Hero (ES)</label>
                  <textarea
                    rows={3}
                    value={siteTexts.hero_subtitle_es}
                    onChange={(e) => setSiteTexts({ ...siteTexts, hero_subtitle_es: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Video de YouTube */}
            <div className="bg-[#080808] border border-primary/30 p-5 rounded-lg space-y-4">
              <span className="text-xs uppercase font-bold text-primary/80 flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" /> Transmisión de Video Destacado
              </span>
              <div>
                <label className="block text-xs uppercase text-muted-foreground mb-1">
                  URL del Video de YouTube (Acepta enlace directo o embed)
                </label>
                <input
                  type="text"
                  value={siteTexts.hero_video_url}
                  onChange={(e) => setSiteTexts({ ...siteTexts, hero_video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=MJo7EKyST6U"
                  className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {siteTexts.hero_video_url && (
                <div className="pt-2">
                  <span className="block text-xs uppercase text-muted-foreground mb-2">Vista Previa del Embed:</span>
                  <div className="aspect-video w-full max-w-xl border border-primary/40 rounded overflow-hidden">
                    <iframe
                      className="w-full h-full border-0"
                      src={getEmbedPreviewUrl(siteTexts.hero_video_url)}
                      title="Vista Previa YouTube"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: BIO */}
        {/* ========================================================= */}
        {activeTab === 'bio' && bio && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-primary/20">
              <div>
                <h2 className="text-base font-bold text-primary uppercase">Biografía Oficial</h2>
                <p className="text-xs text-muted-foreground">Administra los párrafos de historia y manifiesto en inglés y español.</p>
              </div>
              <button
                onClick={handleSaveBio}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Biografía'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sección EN */}
              <div className="bg-[#080808] border border-primary/30 p-5 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-primary/80">Biografía en Inglés (EN)</span>
                  <button
                    type="button"
                    onClick={() => setBio({ ...bio, paragraphs_en: [...bio.paragraphs_en, ''] })}
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Párrafo
                  </button>
                </div>

                <div>
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Título de Sección (EN)</label>
                  <input
                    type="text"
                    value={bio.title_en}
                    onChange={(e) => setBio({ ...bio, title_en: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs uppercase text-muted-foreground">Párrafos (EN):</label>
                  {bio.paragraphs_en.map((p: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Párrafo {idx + 1}</span>
                        {bio.paragraphs_en.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setBio({
                                ...bio,
                                paragraphs_en: bio.paragraphs_en.filter((_: any, i: number) => i !== idx),
                              })
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={4}
                        value={p}
                        onChange={(e) => {
                          const updated = [...bio.paragraphs_en];
                          updated[idx] = e.target.value;
                          setBio({ ...bio, paragraphs_en: updated });
                        }}
                        className="w-full bg-[#111] border border-primary/20 rounded p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-y"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección ES */}
              <div className="bg-[#080808] border border-primary/30 p-5 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-primary/80">Biografía en Español (ES)</span>
                  <button
                    type="button"
                    onClick={() => setBio({ ...bio, paragraphs_es: [...bio.paragraphs_es, ''] })}
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Párrafo
                  </button>
                </div>

                <div>
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Título de Sección (ES)</label>
                  <input
                    type="text"
                    value={bio.title_es}
                    onChange={(e) => setBio({ ...bio, title_es: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs uppercase text-muted-foreground">Párrafos (ES):</label>
                  {bio.paragraphs_es.map((p: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Párrafo {idx + 1}</span>
                        {bio.paragraphs_es.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setBio({
                                ...bio,
                                paragraphs_es: bio.paragraphs_es.filter((_: any, i: number) => i !== idx),
                              })
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={4}
                        value={p}
                        onChange={(e) => {
                          const updated = [...bio.paragraphs_es];
                          updated[idx] = e.target.value;
                          setBio({ ...bio, paragraphs_es: updated });
                        }}
                        className="w-full bg-[#111] border border-primary/20 rounded p-2.5 text-xs text-foreground focus:outline-none focus:border-primary resize-y"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DISCOGRAFÍA / ALBUMS */}
        {/* ========================================================= */}
        {activeTab === 'albums' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-primary/20">
              <div>
                <h2 className="text-base font-bold text-primary uppercase">Discografía // Catálogo Musical</h2>
                <p className="text-xs text-muted-foreground">Gestiona portadas, enlaces de Bandcamp, precios y previews de audio.</p>
              </div>
              <button
                onClick={() =>
                  setEditingAlbum({
                    title: '',
                    price: 9.99,
                    cover: '',
                    stream_url: 'https://saturnalia999.bandcamp.com',
                    audio_url: '',
                    bandcamp_embed_id: '',
                    spotify_url: '',
                    player_source: 'auto',
                    order: albums.length + 1,
                  })
                }
                className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Álbum</span>
              </button>
            </div>

            {/* Lista de Álbumes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="bg-[#080808] border border-primary/30 rounded-lg overflow-hidden flex flex-col justify-between hover:border-primary transition-all group"
                >
                  <div className="relative aspect-square w-full bg-[#111] overflow-hidden">
                    {album.cover ? (
                      <img
                        src={album.cover}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Music className="w-12 h-12 stroke-[1]" />
                      </div>
                    )}
                    <span className="absolute top-2 right-2 bg-black/80 text-primary border border-primary/40 px-2 py-0.5 text-[10px] rounded">
                      Orden: #{album.order}
                    </span>
                    <span className="absolute bottom-2 left-2 bg-primary text-black font-bold px-2 py-0.5 text-xs rounded">
                      ${album.price}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-sm text-foreground uppercase line-clamp-1">{album.title}</h3>
                      {album.bandcamp_embed_id && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">Embed ID: {album.bandcamp_embed_id}</p>
                      )}
                      {album.audio_url && (
                        <p className="text-[10px] text-primary/80 mt-0.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Audio Preview configurado
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-primary/20">
                      <button
                        onClick={() => setEditingAlbum({ ...album })}
                        className="flex-1 py-1.5 px-3 bg-[#151515] hover:bg-primary hover:text-black text-xs font-semibold rounded border border-primary/30 transition-colors text-center"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album.id, album.title)}
                        className="py-1.5 px-3 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs rounded border border-red-500/30 transition-colors"
                        title="Eliminar álbum"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal de Edición de Álbum */}
            {editingAlbum && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-[#080808] border-2 border-primary/60 p-6 rounded-lg max-w-lg w-full space-y-4 shadow-2xl relative my-8">
                  <div className="flex items-center justify-between pb-2 border-b border-primary/20">
                    <h3 className="text-sm font-bold text-primary uppercase">
                      {editingAlbum.id ? 'Editar Álbum' : 'Registrar Nuevo Álbum'}
                    </h3>
                    <button
                      onClick={() => setEditingAlbum(null)}
                      className="text-muted-foreground hover:text-foreground text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveAlbum} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">Título del Álbum</label>
                      <input
                        type="text"
                        required
                        value={editingAlbum.title}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum, title: e.target.value })}
                        className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-1">Precio (USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={editingAlbum.price}
                          onChange={(e) => setEditingAlbum({ ...editingAlbum, price: e.target.value })}
                          className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-1">Orden de Posición</label>
                        <input
                          type="number"
                          required
                          value={editingAlbum.order}
                          onChange={(e) => setEditingAlbum({ ...editingAlbum, order: e.target.value })}
                          className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">URL de Portada (Cover)</label>
                      <input
                        type="url"
                        value={editingAlbum.cover}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum, cover: e.target.value })}
                        placeholder="https://f4.bcbits.com/img/..."
                        className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">URL Bandcamp (Stream / Compra)</label>
                      <input
                        type="url"
                        value={editingAlbum.stream_url}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum, stream_url: e.target.value })}
                        placeholder="https://saturnalia999.bandcamp.com/album/..."
                        className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">ID Embed de Bandcamp (Opcional)</label>
                      <input
                        type="text"
                        value={editingAlbum.bandcamp_embed_id}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum, bandcamp_embed_id: e.target.value })}
                        placeholder="Ej: 4169686274"
                        className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">
                        URL de Audio Preview (MP3 para el reproductor interactivo)
                      </label>
                      <input
                        type="url"
                        value={editingAlbum.audio_url}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum, audio_url: e.target.value })}
                        placeholder="https://.../preview.mp3"
                        className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary/20">
                      <button
                        type="button"
                        onClick={() => setEditingAlbum(null)}
                        className="px-4 py-2 bg-[#151515] hover:bg-[#202020] text-xs uppercase rounded"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2 bg-primary text-black font-bold text-xs uppercase rounded hover:bg-primary/90 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Álbum</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: PISTAS DE AUDIO / TRACKS (CLOUDFLARE R2) */}
        {/* ========================================================= */}
        {activeTab === 'tracks' && (
          <div className="space-y-6">
            {/* Reproductor oculto de audio para preescucha en el panel */}
            <audio ref={adminAudioRef} onEnded={() => setPlayingTrackId(null)} className="hidden" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-primary/20">
              <div>
                <h2 className="text-base font-bold text-primary uppercase flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-primary" />
                  <span>Pistas de Audio // Cloudflare R2 Streaming</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gestiona las canciones completas por álbum alojadas en Cloudflare R2 y servidas vía <code className="text-primary font-mono text-[11px]">media.saturnalia999.art</code>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Selector / Filtro por Álbum */}
                <div className="flex items-center gap-2 bg-[#111] border border-primary/30 rounded px-2.5 py-1.5">
                  <Disc className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] uppercase text-muted-foreground">Filtrar por:</span>
                  <select
                    value={selectedAlbumFilter}
                    onChange={(e) => setSelectedAlbumFilter(e.target.value)}
                    className="bg-transparent text-xs text-foreground font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#111] text-foreground">
                      Todos los Álbumes ({tracks.length} temas)
                    </option>
                    {albums.map((alb) => {
                      const count = tracks.filter((t) => t.album === alb.id).length;
                      return (
                        <option key={alb.id} value={alb.id} className="bg-[#111] text-foreground">
                          {alb.title} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={() => {
                    const initialAlbum = selectedAlbumFilter !== 'all' ? selectedAlbumFilter : (albums[0]?.id || '');
                    const albumTracks = tracks.filter((t) => t.album === initialAlbum);
                    setEditingTrack({
                      title: '',
                      album: initialAlbum,
                      track_number: albumTracks.length + 1,
                      order: albumTracks.length + 1,
                      duration: '',
                      audio_url: '',
                    });
                    setSelectedAudioFile(null);
                    setAudioPreviewUrl('');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Pista</span>
                </button>
              </div>
            </div>

            {/* Barra de estado cuando se está reproduciendo una preescucha */}
            {playingTrackId && (
              <div className="p-3 bg-primary/10 border border-primary/40 rounded flex items-center justify-between text-xs text-primary animate-pulse">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 animate-bounce shrink-0" />
                  <span>
                    Reproduciendo preescucha en vivo desde Cloudflare R2: <strong>{tracks.find((t) => t.id === playingTrackId)?.title || 'Pista'}</strong>
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (adminAudioRef.current) adminAudioRef.current.pause();
                    setPlayingTrackId(null);
                  }}
                  className="px-3 py-1 bg-primary text-black rounded font-bold text-[11px] uppercase tracking-wider hover:bg-primary/90"
                >
                  Detener
                </button>
              </div>
            )}

            {/* Lista de Pistas */}
            {(() => {
              const filteredTracks = tracks.filter(
                (t) => selectedAlbumFilter === 'all' || t.album === selectedAlbumFilter
              ).sort((a, b) => {
                if (selectedAlbumFilter === 'all') {
                  const albumDiff = (a.album || '').localeCompare(b.album || '');
                  if (albumDiff !== 0) return albumDiff;
                }
                return (Number(a.order) || 0) - (Number(b.order) || 0);
              });

              if (filteredTracks.length === 0) {
                return (
                  <div className="p-12 text-center border-2 border-dashed border-primary/20 rounded-lg space-y-3">
                    <Headphones className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      No hay canciones registradas en este álbum todavía.
                    </p>
                    <button
                      onClick={() => {
                        const initialAlbum = selectedAlbumFilter !== 'all' ? selectedAlbumFilter : (albums[0]?.id || '');
                        setEditingTrack({
                          title: '',
                          album: initialAlbum,
                          track_number: 1,
                          order: 1,
                          duration: '',
                          audio_url: '',
                        });
                        setSelectedAudioFile(null);
                        setAudioPreviewUrl('');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/40 text-primary text-xs uppercase tracking-wider rounded hover:bg-primary hover:text-black transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Subir Primera Pista</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="bg-[#080808] border border-primary/30 rounded-lg overflow-hidden">
                  <div className="divide-y divide-primary/10">
                    {filteredTracks.map((trk, idx) => {
                      const albumObj = albums.find((a) => a.id === trk.album);
                      const isPlaying = playingTrackId === trk.id;
                      const hasAudio = !!(trk.audio_file || trk.audio_url);

                      return (
                        <div
                          key={trk.id}
                          className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors ${
                            isPlaying ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Botón Play / Pause Preescucha */}
                            <button
                              onClick={() => handleTogglePlayPreview(trk)}
                              disabled={!hasAudio}
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                                isPlaying
                                  ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                                  : hasAudio
                                  ? 'bg-[#151515] hover:bg-primary hover:text-black text-primary border-primary/40'
                                  : 'bg-[#111] text-muted-foreground/30 border-transparent cursor-not-allowed'
                              }`}
                              title={hasAudio ? (isPlaying ? 'Pausar' : 'Escuchar') : 'Sin archivo de audio'}
                            >
                              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>

                            {/* Número y Título */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-primary/70">
                                  #{String(trk.track_number || idx + 1).padStart(2, '0')}
                                </span>
                                <h3 className="text-sm font-bold text-foreground truncate">
                                  {trk.title}
                                </h3>
                                {trk.duration && (
                                  <span className="font-mono text-[11px] text-muted-foreground/70 bg-[#151515] px-1.5 py-0.5 rounded border border-primary/10">
                                    {trk.duration}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground flex-wrap">
                                {albumObj && (
                                  <span className="text-primary/90 font-medium">
                                    Disco: {albumObj.title}
                                  </span>
                                )}
                                <span>•</span>
                                {trk.audio_file ? (
                                  <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                                    Cloudflare R2 ({trk.audio_file})
                                  </span>
                                ) : trk.audio_url ? (
                                  <span className="text-cyan-400 font-mono text-[10px] bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                                    URL Externa
                                  </span>
                                ) : (
                                  <span className="text-amber-400 font-mono text-[10px] bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.2 rounded">
                                    Pendiente de audio
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Acciones y Reordenamiento */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {/* Subir / Bajar Orden */}
                            <button
                              onClick={() => handleMoveTrackOrder(trk, 'up')}
                              className="p-1.5 bg-[#111] hover:bg-[#1a1a1a] text-muted-foreground hover:text-foreground rounded border border-primary/20"
                              title="Subir posición"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveTrackOrder(trk, 'down')}
                              className="p-1.5 bg-[#111] hover:bg-[#1a1a1a] text-muted-foreground hover:text-foreground rounded border border-primary/20"
                              title="Bajar posición"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Editar */}
                            <button
                              onClick={() => {
                                setEditingTrack({ ...trk });
                                setSelectedAudioFile(null);
                                setAudioPreviewUrl(getTrackAudioUrl(trk));
                              }}
                              className="flex items-center gap-1 py-1.5 px-2.5 bg-[#151515] hover:bg-primary hover:text-black text-xs font-semibold rounded border border-primary/30 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Editar</span>
                            </button>

                            {/* Eliminar */}
                            <button
                              onClick={() => handleDeleteTrack(trk.id, trk.title)}
                              className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded border border-red-500/30 transition-colors"
                              title="Eliminar pista"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Modal para Crear / Editar Pista */}
            {editingTrack && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-[#080808] border-2 border-primary/60 p-6 rounded-lg max-w-lg w-full space-y-4 shadow-2xl relative my-8">
                  <div className="flex items-center justify-between pb-2 border-b border-primary/20">
                    <h3 className="text-sm font-bold text-primary uppercase flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-primary" />
                      <span>{editingTrack.id ? 'Editar Pista' : 'Subir Nueva Canción a R2'}</span>
                    </h3>
                    <button
                      onClick={() => {
                        setEditingTrack(null);
                        setSelectedAudioFile(null);
                        setAudioPreviewUrl('');
                      }}
                      className="text-muted-foreground hover:text-foreground text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveTrack} className="space-y-4">
                    {/* Álbum Destino */}
                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">
                        Álbum Destino *
                      </label>
                      <select
                        required
                        value={editingTrack.album}
                        onChange={(e) => setEditingTrack({ ...editingTrack, album: e.target.value })}
                        className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="" disabled>Selecciona un álbum...</option>
                        {albums.map((alb) => (
                          <option key={alb.id} value={alb.id} className="bg-[#111]">
                            {alb.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Título de la Canción */}
                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">
                        Título de la Canción *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingTrack.title}
                        onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
                        placeholder="Ej: Double Faced"
                        className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-1">
                          Nº Pista
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={editingTrack.track_number}
                          onChange={(e) => setEditingTrack({ ...editingTrack, track_number: e.target.value })}
                          className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-1">
                          Duración
                        </label>
                        <input
                          type="text"
                          value={editingTrack.duration || ''}
                          onChange={(e) => setEditingTrack({ ...editingTrack, duration: e.target.value })}
                          placeholder="Ej: 03:45"
                          className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-1">
                          Orden
                        </label>
                        <input
                          type="number"
                          value={editingTrack.order}
                          onChange={(e) => setEditingTrack({ ...editingTrack, order: e.target.value })}
                          className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Subida de Archivo de Audio (Cloudflare R2) */}
                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">
                        Archivo de Audio (MP3, WAV, FLAC, OGG hasta 50MB)
                      </label>
                      <div className="border border-dashed border-primary/40 rounded-lg p-4 bg-[#111] text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          id="track-file-input"
                          accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,audio/flac,audio/x-flac"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleAudioFileSelect(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="track-file-input"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <UploadCloud className="w-8 h-8 text-primary animate-pulse" />
                          <span className="text-xs font-semibold text-primary uppercase">
                            {selectedAudioFile
                              ? `Seleccionado: ${selectedAudioFile.name} (${(selectedAudioFile.size / 1024 / 1024).toFixed(1)} MB)`
                              : editingTrack.audio_file
                              ? `Archivo actual: ${editingTrack.audio_file} (Clic para cambiar)`
                              : 'Haz clic para seleccionar el archivo de audio'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Se alojará en Cloudflare R2 con CDN global de alta velocidad
                          </span>
                        </label>
                      </div>

                      {/* Vista previa de audio en el modal si existe */}
                      {audioPreviewUrl && (
                        <div className="mt-2 p-2 bg-black border border-primary/20 rounded">
                          <audio src={audioPreviewUrl} controls className="w-full h-8" />
                        </div>
                      )}
                    </div>

                    {/* URL Externa alternativa */}
                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">
                        O URL de Audio Externa (Opcional)
                      </label>
                      <input
                        type="url"
                        value={editingTrack.audio_url || ''}
                        onChange={(e) => setEditingTrack({ ...editingTrack, audio_url: e.target.value })}
                        placeholder="https://.../stream.mp3"
                        className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary/20">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTrack(null);
                          setSelectedAudioFile(null);
                          setAudioPreviewUrl('');
                        }}
                        className="px-4 py-2 bg-[#151515] hover:bg-[#202020] text-xs uppercase rounded"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2 bg-primary text-black font-bold text-xs uppercase rounded hover:bg-primary/90 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Subiendo a R2...' : 'Guardar Pista'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: ARCHIVO VISUAL // GALERÍA DE FOTOS */}
        {/* ========================================================= */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-primary/20">
              <div>
                <h2 className="text-base font-bold text-primary uppercase">Galería Visual // Archivo Fotográfico</h2>
                <p className="text-xs text-muted-foreground">
                  Sube fotografías a la base de datos viva, asigna títulos bilingües y organiza el orden del archivo visual.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingGalleryItem({
                    title: '',
                    title_es: '',
                    caption_en: '',
                    caption_es: '',
                    image_url: '',
                    order: gallery.length + 1,
                  });
                  setSelectedFile(null);
                  setPreviewUrl('');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                <span>Subir Nueva Foto</span>
              </button>
            </div>

            {/* Listado de Fotos */}
            {gallery.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-primary/20 rounded-lg">
                <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  No hay fotografías registradas en la galería
                </p>
                <button
                  onClick={() => {
                    setEditingGalleryItem({
                      title: '',
                      title_es: '',
                      caption_en: '',
                      caption_es: '',
                      image_url: '',
                      order: 1,
                    });
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Subir la primera imagen
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallery.map((item) => {
                  const imgUrl = getGalleryImageUrl(item);
                  return (
                    <div
                      key={item.id}
                      className="bg-[#080808] border border-primary/30 rounded-lg overflow-hidden group hover:border-primary transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Previsualización imagen */}
                        <div className="aspect-video bg-black relative overflow-hidden border-b border-primary/20">
                          <img
                            src={imgUrl}
                            alt={item.title || 'Foto de Galería'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 border border-primary/40 text-[10px] font-mono text-primary rounded">
                            #{String(item.order || 1).padStart(2, '0')}
                          </div>
                          {item.image && (
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-950/80 border border-green-500/40 text-[9px] font-mono text-green-400 rounded">
                              Archivo PB
                            </div>
                          )}
                        </div>

                        {/* Textos y Datos */}
                        <div className="p-3">
                          <h4 className="font-bold text-sm text-foreground truncate">
                            {item.title || 'Sin título'}
                          </h4>
                          {item.title_es && item.title_es !== item.title && (
                            <p className="text-xs text-muted-foreground truncate">
                              ES: {item.title_es}
                            </p>
                          )}
                          {(item.caption_en || item.caption_es) && (
                            <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2">
                              {item.caption_es || item.caption_en}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex items-center justify-between p-2.5 bg-[#040404] border-t border-primary/20">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          ID: {item.id.slice(0, 8)}...
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingGalleryItem(item);
                              setSelectedFile(null);
                              setPreviewUrl(imgUrl);
                            }}
                            className="p-1.5 hover:bg-primary/20 text-muted-foreground hover:text-primary rounded transition-colors"
                            title="Editar foto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGalleryItem(item.id, item.title)}
                            className="p-1.5 hover:bg-red-950/50 text-muted-foreground hover:text-red-400 rounded transition-colors"
                            title="Eliminar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal para Crear / Editar Foto */}
            {editingGalleryItem && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#0a0a0a] border border-primary/50 w-full max-w-lg rounded-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-primary/20 mb-4">
                    <h3 className="text-sm font-bold text-primary uppercase">
                      {editingGalleryItem.id ? 'Editar Foto de Galería' : 'Subir Nueva Foto'}
                    </h3>
                    <button
                      onClick={() => {
                        setEditingGalleryItem(null);
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveGalleryItem} className="space-y-4">
                    {/* Campo Subida de Archivo */}
                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1.5 font-semibold">
                        Archivo de Imagen (Upload directo a Raspberry Pi)
                      </label>
                      <div className="border border-dashed border-primary/40 rounded-lg p-4 bg-[#050505] text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          id="gallery-file-input"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setSelectedFile(file);
                              setPreviewUrl(URL.createObjectURL(file));
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="gallery-file-input"
                          className="cursor-pointer flex flex-col items-center justify-center gap-2"
                        >
                          {previewUrl ? (
                            <div className="relative group max-h-48 overflow-hidden rounded border border-primary/30">
                              <img src={previewUrl} alt="Preview" className="max-h-48 object-contain mx-auto" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-primary transition-opacity">
                                Haz clic para cambiar imagen
                              </div>
                            </div>
                          ) : (
                            <>
                              <UploadCloud className="w-8 h-8 text-primary/70 animate-bounce" />
                              <span className="text-xs text-foreground font-mono">
                                Haz clic aquí para seleccionar imagen desde tu equipo
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                JPG, PNG, WEBP, GIF hasta 10MB
                              </span>
                            </>
                          )}
                        </label>
                        {selectedFile && (
                          <div className="mt-2 text-xs font-mono text-green-400">
                            ✓ Seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* O URL directa externa */}
                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">
                        O URL de Imagen Externa (Opcional si subiste archivo)
                      </label>
                      <input
                        type="url"
                        value={editingGalleryItem.image_url || ''}
                        onChange={(e) => {
                          setEditingGalleryItem({ ...editingGalleryItem, image_url: e.target.value });
                          if (!selectedFile && e.target.value) {
                            setPreviewUrl(e.target.value);
                          }
                        }}
                        placeholder="https://f4.bcbits.com/img/..."
                        className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Títulos EN / ES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-1">Título (EN)</label>
                        <input
                          type="text"
                          value={editingGalleryItem.title || ''}
                          onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })}
                          placeholder="e.g. Void Transmission"
                          className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-1">Título (ES)</label>
                        <input
                          type="text"
                          value={editingGalleryItem.title_es || ''}
                          onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, title_es: e.target.value })}
                          placeholder="ej. Transmisión del Vacío"
                          className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Descripciones EN / ES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-1">Pie de foto (EN)</label>
                        <textarea
                          rows={2}
                          value={editingGalleryItem.caption_en || ''}
                          onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, caption_en: e.target.value })}
                          placeholder="Description or photo notes..."
                          className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-1">Pie de foto (ES)</label>
                        <textarea
                          rows={2}
                          value={editingGalleryItem.caption_es || ''}
                          onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, caption_es: e.target.value })}
                          placeholder="Descripción o notas fotográficas..."
                          className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                        />
                      </div>
                    </div>

                    {/* Orden */}
                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">Orden de Posición</label>
                      <input
                        type="number"
                        required
                        value={editingGalleryItem.order || 1}
                        onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, order: Number(e.target.value) })}
                        className="w-24 bg-[#111] border border-primary/30 rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Botones de Envío */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary/20">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGalleryItem(null);
                          setSelectedFile(null);
                          setPreviewUrl('');
                        }}
                        className="px-4 py-2 bg-[#151515] hover:bg-[#202020] text-xs uppercase rounded"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2 bg-primary text-black font-bold text-xs uppercase rounded hover:bg-primary/90 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Guardando...' : (editingGalleryItem.id ? 'Guardar Cambios' : 'Subir Foto')}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ENLACES /links (Linktree) */}
        {/* ========================================================= */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-primary/20">
              <div>
                <h2 className="text-base font-bold text-primary uppercase">Página de Enlaces Rápidos // /links</h2>
                <p className="text-xs text-muted-foreground">Administra los enlaces de tu portal móvil tipo Linktree.</p>
              </div>
              <button
                onClick={() =>
                  setEditingLink({
                    title: '',
                    title_es: '',
                    url: '',
                    category: 'music',
                    icon: 'globe',
                    order: links.length + 1,
                  })
                }
                className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Enlace</span>
              </button>
            </div>

            {/* Lista de Enlaces */}
            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="bg-[#080808] border border-primary/30 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 hover:border-primary transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
                      #{link.order}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{link.title}</h4>
                      {link.title_es && link.title_es !== link.title && (
                        <p className="text-xs text-muted-foreground">ES: {link.title_es}</p>
                      )}
                      <p className="text-xs text-primary/70 truncate max-w-md mt-0.5">{link.url}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#151515] text-muted-foreground px-2 py-1 rounded border border-white/10 uppercase">
                      {link.category}
                    </span>
                    <button
                      onClick={() => setEditingLink({ ...link })}
                      className="py-1 px-3 bg-[#151515] hover:bg-primary hover:text-black text-xs font-semibold rounded border border-primary/30 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.id, link.title)}
                      className="py-1 px-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs rounded border border-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal de Edición de Enlace */}
            {editingLink && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-[#080808] border-2 border-primary/60 p-6 rounded-lg max-w-lg w-full space-y-4 shadow-2xl relative">
                  <div className="flex items-center justify-between pb-2 border-b border-primary/20">
                    <h3 className="text-sm font-bold text-primary uppercase">
                      {editingLink.id ? 'Editar Enlace' : 'Registrar Nuevo Enlace'}
                    </h3>
                    <button
                      onClick={() => setEditingLink(null)}
                      className="text-muted-foreground hover:text-foreground text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveLink} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">Título (Inglés / Principal)</label>
                      <input
                        type="text"
                        required
                        value={editingLink.title}
                        onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                        className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">Título (Español)</label>
                      <input
                        type="text"
                        value={editingLink.title_es}
                        onChange={(e) => setEditingLink({ ...editingLink, title_es: e.target.value })}
                        className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-muted-foreground mb-1">URL de Destino</label>
                      <input
                        type="text"
                        required
                        value={editingLink.url}
                        onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-1">Categoría</label>
                        <select
                          value={editingLink.category}
                          onChange={(e) => setEditingLink({ ...editingLink, category: e.target.value })}
                          className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                        >
                          <option value="featured">Destacado</option>
                          <option value="music">Música</option>
                          <option value="video">Video</option>
                          <option value="social">Redes</option>
                          <option value="site">Sitio Web</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-1">Icono</label>
                        <select
                          value={editingLink.icon}
                          onChange={(e) => setEditingLink({ ...editingLink, icon: e.target.value })}
                          className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                        >
                          <option value="youtube">YouTube</option>
                          <option value="spotify">Spotify</option>
                          <option value="bandcamp">Bandcamp</option>
                          <option value="instagram">Instagram</option>
                          <option value="globe">Web / Global</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase text-muted-foreground mb-1">Orden</label>
                        <input
                          type="number"
                          required
                          value={editingLink.order}
                          onChange={(e) => setEditingLink({ ...editingLink, order: e.target.value })}
                          className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary/20">
                      <button
                        type="button"
                        onClick={() => setEditingLink(null)}
                        className="px-4 py-2 bg-[#151515] hover:bg-[#202020] text-xs uppercase rounded"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2 bg-primary text-black font-bold text-xs uppercase rounded hover:bg-primary/90 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Enlace</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: REDES SOCIALES, CONTACTO & NAVEGACIÓN */}
        {/* ========================================================= */}
        {activeTab === 'socials' && socials && siteTexts && (
          <div className="space-y-8">
            {/* Redes Sociales */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-primary/20">
                <div>
                  <h2 className="text-base font-bold text-primary uppercase">Canales y Redes Sociales</h2>
                  <p className="text-xs text-muted-foreground">Configura los enlaces directos de Spotify, YouTube, Bandcamp e Instagram.</p>
                </div>
                <button
                  onClick={handleSaveSocials}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar Redes'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#080808] border border-primary/30 p-4 rounded-lg">
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Spotify URL</label>
                  <input
                    type="url"
                    value={socials.spotify}
                    onChange={(e) => setSocials({ ...socials, spotify: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="bg-[#080808] border border-primary/30 p-4 rounded-lg">
                  <label className="block text-xs uppercase text-muted-foreground mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={socials.youtube}
                    onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="bg-[#080808] border border-primary/30 p-4 rounded-lg">
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Bandcamp URL</label>
                  <input
                    type="url"
                    value={socials.bandcamp}
                    onChange={(e) => setSocials({ ...socials, bandcamp: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="bg-[#080808] border border-primary/30 p-4 rounded-lg">
                  <label className="block text-xs uppercase text-muted-foreground mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={socials.instagram}
                    onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Menú de Navegación & Textos UI */}
            <div className="space-y-4 pt-4 border-t border-primary/30">
              <div className="flex items-center justify-between pb-3 border-b border-primary/20">
                <div>
                  <h2 className="text-base font-bold text-primary uppercase">Textos del Menú de Navegación</h2>
                  <p className="text-xs text-muted-foreground">Etiquetas del header en ambos idiomas.</p>
                </div>
                <button
                  onClick={handleSaveTexts}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar Textos'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#080808] border border-primary/30 p-4 rounded-lg">
                <div>
                  <label className="block text-[11px] uppercase text-muted-foreground mb-1">Inicio (EN)</label>
                  <input
                    type="text"
                    value={siteTexts.nav_home_en}
                    onChange={(e) => setSiteTexts({ ...siteTexts, nav_home_en: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-muted-foreground mb-1">Inicio (ES)</label>
                  <input
                    type="text"
                    value={siteTexts.nav_home_es}
                    onChange={(e) => setSiteTexts({ ...siteTexts, nav_home_es: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-muted-foreground mb-1">Bio (EN)</label>
                  <input
                    type="text"
                    value={siteTexts.nav_bio_en}
                    onChange={(e) => setSiteTexts({ ...siteTexts, nav_bio_en: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-muted-foreground mb-1">Bio (ES)</label>
                  <input
                    type="text"
                    value={siteTexts.nav_bio_es}
                    onChange={(e) => setSiteTexts({ ...siteTexts, nav_bio_es: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-muted-foreground mb-1">Discografía (EN)</label>
                  <input
                    type="text"
                    value={siteTexts.nav_discography_en}
                    onChange={(e) => setSiteTexts({ ...siteTexts, nav_discography_en: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-muted-foreground mb-1">Discografía (ES)</label>
                  <input
                    type="text"
                    value={siteTexts.nav_discography_es}
                    onChange={(e) => setSiteTexts({ ...siteTexts, nav_discography_es: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-muted-foreground mb-1">Galería (EN)</label>
                  <input
                    type="text"
                    value={siteTexts.nav_gallery_en || ''}
                    onChange={(e) => setSiteTexts({ ...siteTexts, nav_gallery_en: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-muted-foreground mb-1">Galería (ES)</label>
                  <input
                    type="text"
                    value={siteTexts.nav_gallery_es || ''}
                    onChange={(e) => setSiteTexts({ ...siteTexts, nav_gallery_es: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-muted-foreground mb-1">Contacto (EN)</label>
                  <input
                    type="text"
                    value={siteTexts.nav_contact_en}
                    onChange={(e) => setSiteTexts({ ...siteTexts, nav_contact_en: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-muted-foreground mb-1">Contacto (ES)</label>
                  <input
                    type="text"
                    value={siteTexts.nav_contact_es}
                    onChange={(e) => setSiteTexts({ ...siteTexts, nav_contact_es: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Sección de Contacto */}
            <div className="space-y-4 pt-4 border-t border-primary/30">
              <div className="flex items-center justify-between pb-3 border-b border-primary/20">
                <div>
                  <h2 className="text-base font-bold text-primary uppercase">Sección de Contacto</h2>
                  <p className="text-xs text-muted-foreground">Títulos, placeholders y confirmaciones del formulario.</p>
                </div>
                <button
                  onClick={handleSaveTexts}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar Contacto'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#080808] border border-primary/30 p-4 rounded-lg space-y-3">
                  <span className="text-xs uppercase font-bold text-primary">Inglés (EN)</span>
                  <div>
                    <label className="block text-[11px] uppercase text-muted-foreground mb-1">Título</label>
                    <input
                      type="text"
                      value={siteTexts.contact_title_en}
                      onChange={(e) => setSiteTexts({ ...siteTexts, contact_title_en: e.target.value })}
                      className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase text-muted-foreground mb-1">Descripción</label>
                    <textarea
                      rows={2}
                      value={siteTexts.contact_desc_en}
                      onChange={(e) => setSiteTexts({ ...siteTexts, contact_desc_en: e.target.value })}
                      className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase text-muted-foreground mb-1">Botón Transmitir</label>
                    <input
                      type="text"
                      value={siteTexts.contact_submit_en}
                      onChange={(e) => setSiteTexts({ ...siteTexts, contact_submit_en: e.target.value })}
                      className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="bg-[#080808] border border-primary/30 p-4 rounded-lg space-y-3">
                  <span className="text-xs uppercase font-bold text-primary">Español (ES)</span>
                  <div>
                    <label className="block text-[11px] uppercase text-muted-foreground mb-1">Título</label>
                    <input
                      type="text"
                      value={siteTexts.contact_title_es}
                      onChange={(e) => setSiteTexts({ ...siteTexts, contact_title_es: e.target.value })}
                      className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase text-muted-foreground mb-1">Descripción</label>
                    <textarea
                      rows={2}
                      value={siteTexts.contact_desc_es}
                      onChange={(e) => setSiteTexts({ ...siteTexts, contact_desc_es: e.target.value })}
                      className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase text-muted-foreground mb-1">Botón Transmitir</label>
                    <input
                      type="text"
                      value={siteTexts.contact_submit_es}
                      onChange={(e) => setSiteTexts({ ...siteTexts, contact_submit_es: e.target.value })}
                      className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
