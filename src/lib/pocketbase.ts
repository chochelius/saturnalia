import PocketBase from 'pocketbase';
import fallbackAlbums from '../data/fallback/albums.json';
import fallbackBio from '../data/fallback/bio.json';
import fallbackSocials from '../data/fallback/socials.json';
import fallbackLinks from '../data/fallback/links.json';
import fallbackTexts from '../data/fallback/texts.json';
import fallbackGallery from '../data/fallback/gallery.json';
import fallbackTracks from '../data/fallback/tracks.json';
import fallbackBlog from '../data/fallback/blog.json';

export function getPocketBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return (
    (typeof process !== 'undefined' && process.env?.POCKETBASE_URL) ||
    ((import.meta as any).env && (import.meta as any).env.POCKETBASE_URL) ||
    'http://127.0.0.1:8090'
  );
}

export const pb = new PocketBase(getPocketBaseUrl());
pb.autoCancellation(false);

export interface Album {
  id: string;
  title: string;
  price: number;
  cover: string;
  streamUrl: string;
  audioUrl?: string;
  bandcampEmbedId?: string;
  spotifyUrl?: string;
  playerSource?: 'auto' | 'r2' | 'bandcamp' | 'spotify';
  order: number;
}

export interface Bio {
  titleEn: string;
  titleEs: string;
  paragraphsEn: string[];
  paragraphsEs: string[];
}

export interface Socials {
  spotify?: string;
  youtube?: string;
  bandcamp?: string;
  instagram?: string;
  linktree?: string;
}

export interface LinkItem {
  id: string;
  title: string;
  titleEs?: string;
  url: string;
  category?: string;
  icon?: string;
  order: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  titleEs?: string;
  captionEn?: string;
  captionEs?: string;
  image: string;
  imageFile?: string;
  order: number;
}

export interface TrackItem {
  id: string;
  albumId: string;
  title: string;
  trackNumber: number;
  duration?: string;
  order: number;
  streamUrl: string;
  audioFile?: string;
  externalUrl?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  titleEn: string;
  titleEs: string;
  excerptEn: string;
  excerptEs: string;
  contentEn: string;
  contentEs: string;
  coverImage: string;
  coverFile?: string;
  tags: string[];
  isFeatured: boolean;
  status: 'published' | 'draft';
  publishedAt: string;
  order: number;
}

export interface SiteTexts {
  hero: {
    titleEn: string;
    titleEs: string;
    subtitleEn: string;
    subtitleEs: string;
    videoUrl: string;
  };
  nav: {
    homeEn: string;
    homeEs: string;
    bioEn: string;
    bioEs: string;
    discographyEn: string;
    discographyEs: string;
    galleryEn: string;
    galleryEs: string;
    blogEn?: string;
    blogEs?: string;
    contactEn: string;
    contactEs: string;
  };
  gallerySection: {
    titleEn: string;
    titleEs: string;
    subtitleEn: string;
    subtitleEs: string;
  };
  albumSection: {
    titleEn: string;
    titleEs: string;
    buyNowEn: string;
    buyNowEs: string;
  };
  contactSection: {
    titleEn: string;
    titleEs: string;
    descriptionEn: string;
    descriptionEs: string;
    nameLabelEn: string;
    nameLabelEs: string;
    namePlaceholderEn: string;
    namePlaceholderEs: string;
    emailLabelEn: string;
    emailLabelEs: string;
    emailPlaceholderEn: string;
    emailPlaceholderEs: string;
    messageLabelEn: string;
    messageLabelEs: string;
    messagePlaceholderEn: string;
    messagePlaceholderEs: string;
    submitEn: string;
    submitEs: string;
    toastTitleEn: string;
    toastTitleEs: string;
    toastDescEn: string;
    toastDescEs: string;
  };
}

/**
 * Envoltorio con timeout rápido (1.2s) para no bloquear compilaciones si PocketBase está offline
 */
async function withFastTimeout<T>(promise: Promise<T>, timeoutMs = 1200): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('PocketBase timeout')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Obtener todos los álbumes desde PocketBase con fallback automático a JSON local
 */
export async function getAlbums(): Promise<Album[]> {
  try {
    const records = await withFastTimeout(
      pb.collection('albums').getFullList({
        sort: 'order',
        requestKey: null,
      })
    );

    if (records && records.length > 0) {
      return records.map((r: any) => ({
        id: r.id,
        title: r.title,
        price: Number(r.price) || 0,
        cover: r.cover_file
          ? pb.files.getURL(r, r.cover_file)
          : r.cover || 'https://f4.bcbits.com/img/a4169686274_2.jpg',
        streamUrl: r.stream_url || r.streamUrl || 'https://saturnalia999.bandcamp.com/releases',
        audioUrl: r.audio_file ? pb.files.getURL(r, r.audio_file) : (r.audio_url || r.audioUrl || ''),
        bandcampEmbedId: r.bandcamp_embed_id || r.bandcampEmbedId || '',
        spotifyUrl: r.spotify_url || r.spotifyUrl || '',
        playerSource: r.player_source || r.playerSource || 'auto',
        order: Number(r.order) || 1,
      }));
    }
  } catch {
    // Fallback
  }

  return (fallbackAlbums as Album[]).sort((a, b) => a.order - b.order);
}

/**
 * Obtener biografía bilingüe desde PocketBase con fallback automático
 */
export async function getBio(): Promise<Bio> {
  try {
    const record = await withFastTimeout(
      pb.collection('bio').getFirstListItem('', { requestKey: null })
    );
    if (record) {
      return {
        titleEn: record.title_en || record.titleEn || fallbackBio.titleEn,
        titleEs: record.title_es || record.titleEs || fallbackBio.titleEs,
        paragraphsEn: Array.isArray(record.paragraphs_en)
          ? record.paragraphs_en
          : fallbackBio.paragraphsEn,
        paragraphsEs: Array.isArray(record.paragraphs_es)
          ? record.paragraphs_es
          : fallbackBio.paragraphsEs,
      };
    }
  } catch {
    // Fallback
  }

  return fallbackBio as Bio;
}

/**
 * Obtener redes sociales desde PocketBase con fallback automático
 */
export async function getSocials(): Promise<Socials> {
  try {
    const record = await withFastTimeout(
      pb.collection('socials').getFirstListItem('', { requestKey: null })
    );
    if (record) {
      return {
        spotify: record.spotify || fallbackSocials.spotify,
        youtube: record.youtube || fallbackSocials.youtube,
        bandcamp: record.bandcamp || fallbackSocials.bandcamp,
        instagram: record.instagram || fallbackSocials.instagram,
        linktree: record.linktree || fallbackSocials.linktree,
      };
    }
  } catch {
    // Fallback
  }

  return fallbackSocials as Socials;
}

/**
 * Obtener enlaces para la página /links (Linktree) desde PocketBase con fallback automático
 */
export async function getLinks(): Promise<LinkItem[]> {
  try {
    const records = await withFastTimeout(
      pb.collection('links').getFullList({
        sort: 'order',
        requestKey: null,
      })
    );

    if (records && records.length > 0) {
      return records.map((r: any) => ({
        id: r.id,
        title: r.title,
        titleEs: r.title_es || r.titleEs || r.title,
        url: r.url,
        category: r.category || 'music',
        icon: r.icon || 'globe',
        order: Number(r.order) || 1,
      }));
    }
  } catch {
    // Fallback
  }

  return (fallbackLinks as LinkItem[]).sort((a, b) => a.order - b.order);
}

/**
 * Obtener elementos de la galería visual desde PocketBase con fallback automático
 */
export async function getGallery(): Promise<GalleryItem[]> {
  try {
    const records = await withFastTimeout(
      pb.collection('gallery').getFullList({
        sort: 'order',
        requestKey: null,
      })
    );

    if (records && records.length > 0) {
      return records.map((r: any) => ({
        id: r.id,
        title: r.title || '',
        titleEs: r.title_es || r.title || '',
        captionEn: r.caption_en || '',
        captionEs: r.caption_es || '',
        image: r.image
          ? pb.files.getURL(r, r.image)
          : (r.image_url || 'https://f4.bcbits.com/img/a4169686274_2.jpg'),
        imageFile: r.image || '',
        order: Number(r.order) || 1,
      }));
    }
  } catch {
    // Fallback
  }

  return (fallbackGallery as GalleryItem[]).sort((a, b) => a.order - b.order);
}

/**
 * Obtener pistas de audio (tracks) desde PocketBase con fallback automático (Cloudflare R2 CDN)
 */
export async function getTracks(): Promise<TrackItem[]> {
  try {
    const records = await withFastTimeout(
      pb.collection('tracks').getFullList({
        sort: 'order',
        requestKey: null,
      })
    );

    if (records && records.length > 0) {
      return records.map((r: any) => {
        let streamUrl = r.audio_url || '';
        if (r.audio_file) {
          streamUrl = `https://media.saturnalia999.art/${r.collectionId || 'pbc_327047008'}/${r.id}/${r.audio_file}`;
        }
        return {
          id: r.id,
          albumId: r.album,
          title: r.title,
          trackNumber: Number(r.track_number) || 1,
          duration: r.duration || '',
          order: Number(r.order) || 1,
          streamUrl,
          audioFile: r.audio_file || '',
          externalUrl: r.external_url || r.externalUrl || '',
        };
      });
    }
  } catch {
    // Fallback
  }

  return (fallbackTracks as TrackItem[]).sort((a, b) => a.order - b.order);
}

/**
 * Obtener artículos del Blog desde PocketBase con fallback automático
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const records = await withFastTimeout(
      pb.collection('blog_posts').getFullList({
        sort: '-published_at,-order',
        requestKey: null,
      })
    );

    if (records && records.length > 0) {
      return records.map((r: any) => ({
        id: r.id,
        slug: r.slug || r.id,
        titleEn: r.title_en || r.titleEn || '',
        titleEs: r.title_es || r.titleEs || r.title_en || '',
        excerptEn: r.excerpt_en || r.excerptEn || '',
        excerptEs: r.excerpt_es || r.excerptEs || r.excerpt_en || '',
        contentEn: r.content_en || r.contentEn || '',
        contentEs: r.content_es || r.contentEs || r.content_en || '',
        coverImage: r.cover_image
          ? pb.files.getURL(r, r.cover_image)
          : (r.coverImage || '/logo.png'),
        coverFile: r.cover_image || '',
        tags: Array.isArray(r.tags)
          ? r.tags
          : (typeof r.tags === 'string' ? r.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        isFeatured: Boolean(r.is_featured ?? r.isFeatured),
        status: (r.status as 'published' | 'draft') || 'published',
        publishedAt: r.published_at || r.publishedAt || r.created || new Date().toISOString(),
        order: Number(r.order) || 1,
      }));
    }
  } catch {
    // Fallback
  }

  return fallbackBlog as BlogPost[];
}

/**
 * Obtener un artículo individual por slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug || p.id === slug) || null;
}

/**
 * Obtener textos de todas las secciones del sitio desde PocketBase con fallback automático
 */
export async function getSiteTexts(): Promise<SiteTexts> {
  try {
    const record = await withFastTimeout(
      pb.collection('site_texts').getFirstListItem('', { requestKey: null })
    );
    if (record) {
      return {
        hero: {
          titleEn: record.hero_title_en ?? fallbackTexts.hero.titleEn,
          titleEs: record.hero_title_es ?? fallbackTexts.hero.titleEs,
          subtitleEn: record.hero_subtitle_en ?? fallbackTexts.hero.subtitleEn,
          subtitleEs: record.hero_subtitle_es ?? fallbackTexts.hero.subtitleEs,
          videoUrl: record.hero_video_url ?? fallbackTexts.hero.videoUrl,
        },
        nav: {
          homeEn: record.nav_home_en ?? fallbackTexts.nav.homeEn,
          homeEs: record.nav_home_es ?? fallbackTexts.nav.homeEs,
          bioEn: record.nav_bio_en ?? record.nav_signal_en ?? fallbackTexts.nav.bioEn,
          bioEs: record.nav_bio_es ?? record.nav_signal_es ?? fallbackTexts.nav.bioEs,
          discographyEn: record.nav_discography_en ?? fallbackTexts.nav.discographyEn,
          discographyEs: record.nav_discography_es ?? fallbackTexts.nav.discographyEs,
          galleryEn: record.nav_gallery_en ?? (fallbackTexts.nav as any).galleryEn ?? 'Gallery',
          galleryEs: record.nav_gallery_es ?? (fallbackTexts.nav as any).galleryEs ?? 'Galería',
          contactEn: record.nav_contact_en ?? fallbackTexts.nav.contactEn,
          contactEs: record.nav_contact_es ?? fallbackTexts.nav.contactEs,
        },
        gallerySection: {
          titleEn: record.gallery_title_en ?? (fallbackTexts as any).gallerySection?.titleEn ?? 'Visual Archives',
          titleEs: record.gallery_title_es ?? (fallbackTexts as any).gallerySection?.titleEs ?? 'Archivos Visuales',
          subtitleEn: record.gallery_subtitle_en ?? (fallbackTexts as any).gallerySection?.subtitleEn ?? 'Photography, visual archives, and gothic experimental aesthetics.',
          subtitleEs: record.gallery_subtitle_es ?? (fallbackTexts as any).gallerySection?.subtitleEs ?? 'Fotografía, archivos visuales y estética gótica experimental.',
        },
        albumSection: {
          titleEn: record.album_title_en ?? fallbackTexts.albumSection.titleEn,
          titleEs: record.album_title_es ?? fallbackTexts.albumSection.titleEs,
          buyNowEn: record.buy_now_en ?? fallbackTexts.albumSection.buyNowEn,
          buyNowEs: record.buy_now_es ?? fallbackTexts.albumSection.buyNowEs,
        },
        contactSection: {
          titleEn: record.contact_title_en ?? fallbackTexts.contactSection.titleEn,
          titleEs: record.contact_title_es ?? fallbackTexts.contactSection.titleEs,
          descriptionEn: record.contact_desc_en ?? fallbackTexts.contactSection.descriptionEn,
          descriptionEs: record.contact_desc_es ?? fallbackTexts.contactSection.descriptionEs,
          nameLabelEn: record.contact_name_label_en ?? fallbackTexts.contactSection.nameLabelEn,
          nameLabelEs: record.contact_name_label_es ?? fallbackTexts.contactSection.nameLabelEs,
          namePlaceholderEn: record.contact_name_placeholder_en ?? fallbackTexts.contactSection.namePlaceholderEn,
          namePlaceholderEs: record.contact_name_placeholder_es ?? fallbackTexts.contactSection.namePlaceholderEs,
          emailLabelEn: record.contact_email_label_en ?? fallbackTexts.contactSection.emailLabelEn,
          emailLabelEs: record.contact_email_label_es ?? fallbackTexts.contactSection.emailLabelEs,
          emailPlaceholderEn: record.contact_email_placeholder_en ?? fallbackTexts.contactSection.emailPlaceholderEn,
          emailPlaceholderEs: record.contact_email_placeholder_es ?? fallbackTexts.contactSection.emailPlaceholderEs,
          messageLabelEn: record.contact_msg_label_en ?? fallbackTexts.contactSection.messageLabelEn,
          messageLabelEs: record.contact_msg_label_es ?? fallbackTexts.contactSection.messageLabelEs,
          messagePlaceholderEn: record.contact_msg_placeholder_en ?? fallbackTexts.contactSection.messagePlaceholderEn,
          messagePlaceholderEs: record.contact_msg_placeholder_es ?? fallbackTexts.contactSection.messagePlaceholderEs,
          submitEn: record.contact_submit_en ?? fallbackTexts.contactSection.submitEn,
          submitEs: record.contact_submit_es ?? fallbackTexts.contactSection.submitEs,
          toastTitleEn: record.contact_toast_title_en ?? fallbackTexts.contactSection.toastTitleEn,
          toastTitleEs: record.contact_toast_title_es ?? fallbackTexts.contactSection.toastTitleEs,
          toastDescEn: record.contact_toast_desc_en ?? fallbackTexts.contactSection.toastDescEn,
          toastDescEs: record.contact_toast_desc_es ?? fallbackTexts.contactSection.toastDescEs,
        },
      };
    }
  } catch {
    // Fallback
  }

  return fallbackTexts as unknown as SiteTexts;
}

/**
 * Construye el objeto de traducción para un idioma determinado
 */
export function buildTranslation(siteTexts: SiteTexts, lang: 'en' | 'es') {
  const isEs = lang === 'es';
  return {
    nav: {
      home: isEs ? siteTexts.nav.homeEs : siteTexts.nav.homeEn,
      bio: isEs ? siteTexts.nav.bioEs : siteTexts.nav.bioEn,
      discography: isEs ? siteTexts.nav.discographyEs : siteTexts.nav.discographyEn,
      gallery: isEs ? (siteTexts.nav.galleryEs || 'Galería') : (siteTexts.nav.galleryEn || 'Gallery'),
      blog: isEs ? (siteTexts.nav.blogEs || 'Blog') : (siteTexts.nav.blogEn || 'Blog'),
      contact: isEs ? siteTexts.nav.contactEs : siteTexts.nav.contactEn,
    },
    gallerySection: {
      title: isEs ? siteTexts.gallerySection.titleEs : siteTexts.gallerySection.titleEn,
      subtitle: isEs ? siteTexts.gallerySection.subtitleEs : siteTexts.gallerySection.subtitleEn,
    },
    heroSection: {
      title: isEs ? siteTexts.hero.titleEs : siteTexts.hero.titleEn,
      subtitle: isEs ? siteTexts.hero.subtitleEs : siteTexts.hero.subtitleEn,
      videoUrl: siteTexts.hero.videoUrl,
    },
    albumSection: {
      title: isEs ? siteTexts.albumSection.titleEs : siteTexts.albumSection.titleEn,
      buyNow: isEs ? siteTexts.albumSection.buyNowEs : siteTexts.albumSection.buyNowEn,
    },
    contactSection: {
      title: isEs ? siteTexts.contactSection.titleEs : siteTexts.contactSection.titleEn,
      description: isEs ? siteTexts.contactSection.descriptionEs : siteTexts.contactSection.descriptionEn,
      form: {
        name: {
          label: isEs ? siteTexts.contactSection.nameLabelEs : siteTexts.contactSection.nameLabelEn,
          placeholder: isEs ? siteTexts.contactSection.namePlaceholderEs : siteTexts.contactSection.namePlaceholderEn,
        },
        email: {
          label: isEs ? siteTexts.contactSection.emailLabelEs : siteTexts.contactSection.emailLabelEn,
          placeholder: isEs ? siteTexts.contactSection.emailPlaceholderEs : siteTexts.contactSection.emailPlaceholderEn,
        },
        message: {
          label: isEs ? siteTexts.contactSection.messageLabelEs : siteTexts.contactSection.messageLabelEn,
          placeholder: isEs ? siteTexts.contactSection.messagePlaceholderEs : siteTexts.contactSection.messagePlaceholderEn,
        },
        submit: isEs ? siteTexts.contactSection.submitEs : siteTexts.contactSection.submitEn,
      },
      toast: {
        title: isEs ? siteTexts.contactSection.toastTitleEs : siteTexts.contactSection.toastTitleEn,
        description: isEs ? siteTexts.contactSection.toastDescEs : siteTexts.contactSection.toastDescEn,
      },
    },
  };
}
