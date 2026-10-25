import PocketBase from 'pocketbase';
import fallbackAlbums from '../data/fallback/albums.json';
import fallbackBio from '../data/fallback/bio.json';
import fallbackSocials from '../data/fallback/socials.json';
import fallbackLinks from '../data/fallback/links.json';

// Definición de URL de PocketBase: variable de entorno, Pi local, o localhost
const PB_URL =
  (typeof process !== 'undefined' && process.env?.POCKETBASE_URL) ||
  ((import.meta as any).env && (import.meta as any).env.POCKETBASE_URL) ||
  'http://192.168.1.118:8090';

export const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

export interface Album {
  id: string;
  title: string;
  price: number;
  cover: string;
  streamUrl: string;
  audioUrl?: string;
  bandcampEmbedId?: string;
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
        audioUrl: r.audio_file ? pb.files.getURL(r, r.audio_file) : (r.audioUrl || ''),
        bandcampEmbedId: r.bandcamp_embed_id || r.bandcampEmbedId || '',
        order: Number(r.order) || 1,
      }));
    }
  } catch {
    // PocketBase no disponible o timeout -> uso seguro y veloz del fallback
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
    // Fallback a JSON local
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
    // Fallback a JSON local
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
    // Fallback a JSON local
  }

  return (fallbackLinks as LinkItem[]).sort((a, b) => a.order - b.order);
}
