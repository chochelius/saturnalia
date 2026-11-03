/**
 * Script para sincronizar el contenido desde la Raspberry Pi (PocketBase)
 * hacia los archivos locales de respaldo (fallback JSON).
 * 
 * Uso: node scripts/sync-from-pi.mjs [pi_host]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const FALLBACK_DIR = path.join(ROOT_DIR, 'src/data/fallback');

const PI_HOST = process.argv[2] || process.env.PI_HOST || '192.168.1.118';
const BASE_URL = `http://${PI_HOST}:9002/api`;

async function fetchCollection(name) {
  const url = `${BASE_URL}/collections/${name}/records?perPage=100`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error(`⚠️ No se pudo obtener la colección '${name}':`, err.message);
    return null;
  }
}

async function sync() {
  console.log(`\n📡 Conectando a la Raspberry Pi (${PI_HOST}:9002)...`);

  // 1. Textos del sitio
  console.log('📝 Sincronizando textos generales del sitio...');
  const siteTextsItems = await fetchCollection('site_texts');
  if (siteTextsItems && siteTextsItems.length > 0) {
    const r = siteTextsItems[0];
    const textsData = {
      hero: {
        titleEn: r.hero_title_en || 'DOUBLE FACED',
        titleEs: r.hero_title_es || 'DOUBLE FACED',
        subtitleEn: r.hero_subtitle_en || '',
        subtitleEs: r.hero_subtitle_es || '',
        videoUrl: r.hero_video_url || 'https://www.youtube.com/embed/MJo7EKyST6U',
      },
      nav: {
        homeEn: r.nav_home_en || 'Home',
        homeEs: r.nav_home_es || 'Inicio',
        bioEn: r.nav_bio_en || r.nav_signal_en || 'Bio',
        bioEs: r.nav_bio_es || r.nav_signal_es || 'Bio',
        discographyEn: r.nav_discography_en || 'Discography',
        discographyEs: r.nav_discography_es || 'Discografía',
        galleryEn: r.nav_gallery_en || 'Gallery',
        galleryEs: r.nav_gallery_es || 'Galería',
        contactEn: r.nav_contact_en || 'Contact',
        contactEs: r.nav_contact_es || 'Contacto',
      },
      gallerySection: {
        titleEn: r.gallery_title_en || 'Visual Archives',
        titleEs: r.gallery_title_es || 'Archivos Visuales',
        subtitleEn: r.gallery_subtitle_en || 'Photography, transmissions, and gothic experimental aesthetics.',
        subtitleEs: r.gallery_subtitle_es || 'Fotografía, transmisiones y estética visual oscura.',
      },
      albumSection: {
        titleEn: r.album_title_en || 'Discography',
        titleEs: r.album_title_es || 'Discografía',
        buyNowEn: r.buy_now_en || 'Buy Now',
        buyNowEs: r.buy_now_es || 'Comprar Ahora',
      },
      contactSection: {
        titleEn: r.contact_title_en || 'Make Contact',
        titleEs: r.contact_title_es || 'Hacer Contacto',
        descriptionEn: r.contact_desc_en || '',
        descriptionEs: r.contact_desc_es || '',
        nameLabelEn: r.contact_name_label_en || 'Handle',
        nameLabelEs: r.contact_name_label_es || 'Alias',
        namePlaceholderEn: r.contact_name_placeholder_en || 'Your alias',
        namePlaceholderEs: r.contact_name_placeholder_es || 'Tu alias',
        emailLabelEn: r.contact_email_label_en || 'Secure Channel (Email)',
        emailLabelEs: r.contact_email_label_es || 'Canal Seguro (Email)',
        emailPlaceholderEn: r.contact_email_placeholder_en || 'your.address@protocol.net',
        emailPlaceholderEs: r.contact_email_placeholder_es || 'tu.direccion@protocolo.net',
        messageLabelEn: r.contact_msg_label_en || 'Message',
        messageLabelEs: r.contact_msg_label_es || 'Mensaje',
        messagePlaceholderEn: r.contact_msg_placeholder_en || 'Your transmission...',
        messagePlaceholderEs: r.contact_msg_placeholder_es || 'Tu transmisión...',
        submitEn: r.contact_submit_en || 'Transmit Message',
        submitEs: r.contact_submit_es || 'Transmitir Mensaje',
        toastTitleEn: r.contact_toast_title_en || 'Transmission Received!',
        toastTitleEs: r.contact_toast_title_es || '¡Transmisión Recibida!',
        toastDescEn: r.contact_toast_desc_en || '',
        toastDescEs: r.contact_toast_desc_es || '',
      },
    };
    fs.writeFileSync(path.join(FALLBACK_DIR, 'texts.json'), JSON.stringify(textsData, null, 2), 'utf-8');
    console.log('  ✓ texts.json actualizado.');
  }

  // 2. Biografía
  console.log('📜 Sincronizando biografía...');
  const bioItems = await fetchCollection('bio');
  if (bioItems && bioItems.length > 0) {
    const r = bioItems[0];
    const bioData = {
      titleEn: r.title_en || 'Biography',
      titleEs: r.title_es || 'Biografía',
      paragraphsEn: Array.isArray(r.paragraphs_en) ? r.paragraphs_en : [],
      paragraphsEs: Array.isArray(r.paragraphs_es) ? r.paragraphs_es : [],
    };
    fs.writeFileSync(path.join(FALLBACK_DIR, 'bio.json'), JSON.stringify(bioData, null, 2), 'utf-8');
    console.log('  ✓ bio.json actualizado.');
  }

  // 3. Álbumes
  console.log('💿 Sincronizando discografía...');
  const albumsItems = await fetchCollection('albums');
  if (albumsItems && albumsItems.length > 0) {
    const albumsData = albumsItems
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
      .map((r) => ({
        id: r.id,
        title: r.title,
        price: Number(r.price) || 0,
        cover: r.cover || '',
        streamUrl: r.stream_url || '',
        audioUrl: r.audio_url || '',
        bandcampEmbedId: r.bandcamp_embed_id || '',
        playerSource: r.player_source || 'auto',
        spotifyUrl: r.spotify_url || '',
        order: Number(r.order) || 1,
      }));
    fs.writeFileSync(path.join(FALLBACK_DIR, 'albums.json'), JSON.stringify(albumsData, null, 2), 'utf-8');
    console.log(`  ✓ albums.json actualizado (${albumsData.length} álbumes).`);
  }

  // 4. Redes sociales
  console.log('🌐 Sincronizando redes sociales...');
  const socialsItems = await fetchCollection('socials');
  if (socialsItems && socialsItems.length > 0) {
    const r = socialsItems[0];
    const socialsData = {
      spotify: r.spotify || '',
      youtube: r.youtube || '',
      bandcamp: r.bandcamp || '',
      instagram: r.instagram || '',
      linktree: r.linktree || '',
    };
    fs.writeFileSync(path.join(FALLBACK_DIR, 'socials.json'), JSON.stringify(socialsData, null, 2), 'utf-8');
    console.log('  ✓ socials.json actualizado.');
  }

  // 5. Enlaces /links
  console.log('🔗 Sincronizando enlaces rápidos...');
  const linksItems = await fetchCollection('links');
  if (linksItems && linksItems.length > 0) {
    const linksData = linksItems
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
      .map((r) => ({
        id: r.id,
        title: r.title,
        titleEs: r.title_es || r.title,
        url: r.url,
        category: r.category || 'music',
        icon: r.icon || 'globe',
        order: Number(r.order) || 1,
      }));
    fs.writeFileSync(path.join(FALLBACK_DIR, 'links.json'), JSON.stringify(linksData, null, 2), 'utf-8');
    console.log(`  ✓ links.json actualizado (${linksData.length} enlaces).`);
  }

  // 6. Galería fotográfica
  console.log('🖼️ Sincronizando galería visual y descargando imágenes...');
  const galleryItems = await fetchCollection('gallery');
  if (galleryItems && galleryItems.length > 0) {
    const galleryDir = path.join(ROOT_DIR, 'public/images/gallery');
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true });
    }

    const galleryData = [];
    for (const r of galleryItems.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))) {
      let imageUrl = r.image_url || '';

      // Si tiene archivo subido a PocketBase, descargarlo localmente a public/images/gallery/
      if (r.image) {
        const fileUrl = `${BASE_URL}/files/gallery/${r.id}/${r.image}`;
        const localDest = path.join(galleryDir, r.image);
        try {
          const imgRes = await fetch(fileUrl);
          if (imgRes.ok) {
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            fs.writeFileSync(localDest, buffer);
            imageUrl = `/images/gallery/${r.image}`;
          }
        } catch (downloadErr) {
          console.warn(`  ⚠️ No se pudo descargar la imagen '${r.image}':`, downloadErr.message);
        }
      }

      galleryData.push({
        id: r.id,
        title: r.title || '',
        titleEs: r.title_es || r.title || '',
        captionEn: r.caption_en || '',
        captionEs: r.caption_es || '',
        image: imageUrl || r.image_url || 'https://f4.bcbits.com/img/a4169686274_2.jpg',
        imageFile: r.image || '',
        order: Number(r.order) || 1,
      });
    }

    fs.writeFileSync(path.join(FALLBACK_DIR, 'gallery.json'), JSON.stringify(galleryData, null, 2), 'utf-8');
    console.log(`  ✓ gallery.json actualizado (${galleryData.length} imágenes descargadas).`);
  }

  // 7. Pistas musicales / Tracks
  console.log('🎵 Sincronizando pistas de audio (Cloudflare R2)...');
  const tracksItems = await fetchCollection('tracks');
  if (tracksItems) {
    const tracksData = tracksItems
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
      .map((r) => {
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
          externalUrl: r.external_url || '',
        };
      });
    fs.writeFileSync(path.join(FALLBACK_DIR, 'tracks.json'), JSON.stringify(tracksData, null, 2), 'utf-8');
    console.log(`  ✓ tracks.json actualizado (${tracksData.length} pistas).`);
  }

  console.log('\n✨ Sincronización completada. Archivos fallback actualizados para GitHub Pages.\n');
}

sync().catch(console.error);
