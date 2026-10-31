import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estados de datos
  const [activeTab, setActiveTab] = useState<'hero' | 'bio' | 'albums' | 'links' | 'socials'>('hero');
  const [siteTexts, setSiteTexts] = useState<any>(null);
  const [siteTextsId, setSiteTextsId] = useState<string>('');

  const [bio, setBio] = useState<any>(null);
  const [bioId, setBioId] = useState<string>('');

  const [socials, setSocials] = useState<any>(null);
  const [socialsId, setSocialsId] = useState<string>('');

  const [albums, setAlbums] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  // Estados de interfaz y feedback
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [rebuildStatus, setRebuildStatus] = useState<string>('idle');
  const [isRebuilding, setIsRebuilding] = useState(false);

  // Modal para nuevo o editar álbum
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
  // Modal para nuevo o editar enlace
  const [editingLink, setEditingLink] = useState<any | null>(null);

  // Comprobar autenticación al montar
  useEffect(() => {
    if (pb.authStore.isValid) {
      setIsAuthenticated(true);
      loadAllData();
    }
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');

    try {
      // 1. Intentar como superusuario PocketBase v0.25+
      try {
        await pb.collection('_superusers').authWithPassword(authEmail, authPassword);
      } catch {
        // 2. Intentar como usuario estándar
        await pb.collection('users').authWithPassword(authEmail, authPassword);
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
          nav_signal_en: textsRec.nav_signal_en || '',
          nav_signal_es: textsRec.nav_signal_es || '',
          nav_discography_en: textsRec.nav_discography_en || '',
          nav_discography_es: textsRec.nav_discography_es || '',
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

      // 5. Enlaces
      const lnkList = await pb.collection('links').getFullList({ sort: 'order', requestKey: null }).catch(() => []);
      setLinks(lnkList);
    } catch (err: any) {
      showNotification('error', `Error cargando datos: ${err.message}`);
    }
  };

  // Guardar Textos de Secciones
  const handleSaveTexts = async () => {
    setIsSaving(true);
    try {
      if (siteTextsId) {
        await pb.collection('site_texts').update(siteTextsId, siteTexts);
      } else {
        const created = await pb.collection('site_texts').create(siteTexts);
        setSiteTextsId(created.id);
      }
      showNotification('success', 'Textos guardados exitosamente.');
    } catch (err: any) {
      showNotification('error', `Error al guardar textos: ${err.message}`);
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
      showNotification('error', `Error al guardar biografía: ${err.message}`);
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
      showNotification('error', `Error al guardar redes: ${err.message}`);
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
      showNotification('error', `Error guardando álbum: ${err.message}`);
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
      showNotification('error', `Error al eliminar álbum: ${err.message}`);
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
      showNotification('error', `Error guardando enlace: ${err.message}`);
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
      showNotification('error', `Error al eliminar enlace: ${err.message}`);
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
                Identificador de Acceso (Email)
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="admin@saturnalia999.com"
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
            <span>Bio / La Señal</span>
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
        {/* TAB 2: BIO / LA SEÑAL */}
        {/* ========================================================= */}
        {activeTab === 'bio' && bio && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-primary/20">
              <div>
                <h2 className="text-base font-bold text-primary uppercase">Biografía Oficial // La Señal</h2>
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
                  <label className="block text-[11px] uppercase text-muted-foreground mb-1">Señal (EN)</label>
                  <input
                    type="text"
                    value={siteTexts.nav_signal_en}
                    onChange={(e) => setSiteTexts({ ...siteTexts, nav_signal_en: e.target.value })}
                    className="w-full bg-[#111] border border-primary/30 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-muted-foreground mb-1">Señal (ES)</label>
                  <input
                    type="text"
                    value={siteTexts.nav_signal_es}
                    onChange={(e) => setSiteTexts({ ...siteTexts, nav_signal_es: e.target.value })}
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
