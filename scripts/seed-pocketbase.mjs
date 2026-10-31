/**
 * Script de inicialización y siembra de colecciones en PocketBase para Saturnalia999
 * PocketBase v0.25+
 * Ejecutar con: node scripts/seed-pocketbase.mjs [admin_email] [admin_password]
 */

import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PB_URL = process.env.POCKETBASE_URL || 'http://192.168.1.118:8090';
const pb = new PocketBase(PB_URL);

// Cargar datos fallback
const fallbackAlbums = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/fallback/albums.json'), 'utf-8')
);
const fallbackBio = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/fallback/bio.json'), 'utf-8')
);
const fallbackSocials = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/fallback/socials.json'), 'utf-8')
);
const fallbackLinks = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/fallback/links.json'), 'utf-8')
);
const fallbackTexts = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/fallback/texts.json'), 'utf-8')
);

async function ensureCollection(name, collectionData) {
  try {
    const existing = await pb.collections.getOne(name);
    console.log(`  ✓ Colección '${name}' ya existe.`);
    return existing;
  } catch (err) {
    if (err.status === 404) {
      console.log(`  ➕ Creando colección '${name}'...`);
      const created = await pb.collections.create({
        name,
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""',
        ...collectionData,
      });
      console.log(`  ✅ Colección '${name}' creada exitosamente.`);
      return created;
    }
    throw err;
  }
}

async function main() {
  console.log(`📡 Conectando a PocketBase en: ${PB_URL}`);

  const email = process.argv[2] || process.env.PB_ADMIN_EMAIL || 'admin@saturnalia999.com';
  const password = process.argv[3] || process.env.PB_ADMIN_PASSWORD || 'Saturnalia999!';

  try {
    console.log(`🔐 Autenticando superusuario: ${email}`);
    await pb.collection('_superusers').authWithPassword(email, password);
    console.log('✅ Autenticación superusuario exitosa.');
  } catch (err) {
    console.error('❌ Error de autenticación superusuario:', err.message);
    process.exit(1);
  }

  // 1. Crear colecciones
  console.log('\n📦 Verificando colecciones base...');

  await ensureCollection('albums', {
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'price', type: 'number' },
      { name: 'cover', type: 'text' },
      { name: 'cover_file', type: 'file' },
      { name: 'stream_url', type: 'text' },
      { name: 'audio_file', type: 'file' },
      { name: 'audio_url', type: 'text' },
      { name: 'bandcamp_embed_id', type: 'text' },
      { name: 'order', type: 'number' },
    ],
  });

  await ensureCollection('bio', {
    fields: [
      { name: 'title_en', type: 'text' },
      { name: 'title_es', type: 'text' },
      { name: 'paragraphs_en', type: 'json' },
      { name: 'paragraphs_es', type: 'json' },
    ],
  });

  await ensureCollection('socials', {
    fields: [
      { name: 'spotify', type: 'text' },
      { name: 'youtube', type: 'text' },
      { name: 'bandcamp', type: 'text' },
      { name: 'instagram', type: 'text' },
      { name: 'linktree', type: 'text' },
    ],
  });

  await ensureCollection('links', {
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'title_es', type: 'text' },
      { name: 'url', type: 'text', required: true },
      { name: 'category', type: 'text' },
      { name: 'icon', type: 'text' },
      { name: 'order', type: 'number' },
    ],
  });

  await ensureCollection('site_texts', {
    fields: [
      { name: 'hero_title_en', type: 'text' },
      { name: 'hero_title_es', type: 'text' },
      { name: 'hero_subtitle_en', type: 'text' },
      { name: 'hero_subtitle_es', type: 'text' },
      { name: 'hero_video_url', type: 'text' },
      { name: 'nav_home_en', type: 'text' },
      { name: 'nav_home_es', type: 'text' },
      { name: 'nav_bio_en', type: 'text' },
      { name: 'nav_bio_es', type: 'text' },
      { name: 'nav_discography_en', type: 'text' },
      { name: 'nav_discography_es', type: 'text' },
      { name: 'nav_contact_en', type: 'text' },
      { name: 'nav_contact_es', type: 'text' },
      { name: 'album_title_en', type: 'text' },
      { name: 'album_title_es', type: 'text' },
      { name: 'buy_now_en', type: 'text' },
      { name: 'buy_now_es', type: 'text' },
      { name: 'contact_title_en', type: 'text' },
      { name: 'contact_title_es', type: 'text' },
      { name: 'contact_desc_en', type: 'text' },
      { name: 'contact_desc_es', type: 'text' },
      { name: 'contact_name_label_en', type: 'text' },
      { name: 'contact_name_label_es', type: 'text' },
      { name: 'contact_name_placeholder_en', type: 'text' },
      { name: 'contact_name_placeholder_es', type: 'text' },
      { name: 'contact_email_label_en', type: 'text' },
      { name: 'contact_email_label_es', type: 'text' },
      { name: 'contact_email_placeholder_en', type: 'text' },
      { name: 'contact_email_placeholder_es', type: 'text' },
      { name: 'contact_msg_label_en', type: 'text' },
      { name: 'contact_msg_label_es', type: 'text' },
      { name: 'contact_msg_placeholder_en', type: 'text' },
      { name: 'contact_msg_placeholder_es', type: 'text' },
      { name: 'contact_submit_en', type: 'text' },
      { name: 'contact_submit_es', type: 'text' },
      { name: 'contact_toast_title_en', type: 'text' },
      { name: 'contact_toast_title_es', type: 'text' },
      { name: 'contact_toast_desc_en', type: 'text' },
      { name: 'contact_toast_desc_es', type: 'text' },
    ],
  });

  // 2. Sembrar Álbumes
  console.log('\n💿 Sembrando álbumes...');
  for (const album of fallbackAlbums) {
    const existing = await pb.collection('albums').getFullList({
      filter: `title = "${album.title}"`,
    }).catch(() => []);

    if (existing.length === 0) {
      await pb.collection('albums').create({
        title: album.title,
        price: album.price,
        cover: album.cover,
        stream_url: album.streamUrl,
        audio_url: album.audioUrl || '',
        bandcamp_embed_id: album.bandcampEmbedId || '',
        order: album.order,
      });
      console.log(`  ➕ Creado álbum: ${album.title}`);
    } else {
      console.log(`  ✓ Ya existe álbum: ${album.title}`);
    }
  }

  // 3. Sembrar Biografía
  console.log('\n📜 Sembrando biografía...');
  const existingBio = await pb.collection('bio').getFullList().catch(() => []);
  if (existingBio.length === 0) {
    await pb.collection('bio').create({
      title_en: fallbackBio.titleEn,
      title_es: fallbackBio.titleEs,
      paragraphs_en: fallbackBio.paragraphsEn,
      paragraphs_es: fallbackBio.paragraphsEs,
    });
    console.log('  ➕ Biografía inicial creada.');
  } else {
    console.log('  ✓ Biografía ya existe.');
  }

  // 4. Sembrar Redes Sociales
  console.log('\n🌐 Sembrando redes sociales...');
  const existingSocials = await pb.collection('socials').getFullList().catch(() => []);
  if (existingSocials.length === 0) {
    await pb.collection('socials').create(fallbackSocials);
    console.log('  ➕ Redes sociales iniciales creadas.');
  } else {
    console.log('  ✓ Redes sociales ya existen.');
  }

  // 5. Sembrar Enlaces (/links)
  console.log('\n🔗 Sembrando enlaces rápidos (/links)...');
  for (const link of fallbackLinks) {
    const existing = await pb.collection('links').getFullList({
      filter: `url = "${link.url}"`,
    }).catch(() => []);

    if (existing.length === 0) {
      await pb.collection('links').create({
        title: link.title,
        title_es: link.titleEs || link.title,
        url: link.url,
        category: link.category,
        icon: link.icon,
        order: link.order,
      });
      console.log(`  ➕ Creado enlace: ${link.title}`);
    } else {
      console.log(`  ✓ Ya existe enlace: ${link.title}`);
    }
  }

  // 6. Sembrar Textos de Secciones
  console.log('\n📝 Sembrando textos de secciones...');
  const existingTexts = await pb.collection('site_texts').getFullList().catch(() => []);
  if (existingTexts.length === 0) {
    await pb.collection('site_texts').create({
      hero_title_en: fallbackTexts.hero.titleEn,
      hero_title_es: fallbackTexts.hero.titleEs,
      hero_subtitle_en: fallbackTexts.hero.subtitleEn,
      hero_subtitle_es: fallbackTexts.hero.subtitleEs,
      hero_video_url: fallbackTexts.hero.videoUrl,
      nav_home_en: fallbackTexts.nav.homeEn,
      nav_home_es: fallbackTexts.nav.homeEs,
      nav_bio_en: fallbackTexts.nav.bioEn,
      nav_bio_es: fallbackTexts.nav.bioEs,
      nav_discography_en: fallbackTexts.nav.discographyEn,
      nav_discography_es: fallbackTexts.nav.discographyEs,
      nav_contact_en: fallbackTexts.nav.contactEn,
      nav_contact_es: fallbackTexts.nav.contactEs,
      album_title_en: fallbackTexts.albumSection.titleEn,
      album_title_es: fallbackTexts.albumSection.titleEs,
      buy_now_en: fallbackTexts.albumSection.buyNowEn,
      buy_now_es: fallbackTexts.albumSection.buyNowEs,
      contact_title_en: fallbackTexts.contactSection.titleEn,
      contact_title_es: fallbackTexts.contactSection.titleEs,
      contact_desc_en: fallbackTexts.contactSection.descriptionEn,
      contact_desc_es: fallbackTexts.contactSection.descriptionEs,
      contact_name_label_en: fallbackTexts.contactSection.nameLabelEn,
      contact_name_label_es: fallbackTexts.contactSection.nameLabelEs,
      contact_name_placeholder_en: fallbackTexts.contactSection.namePlaceholderEn,
      contact_name_placeholder_es: fallbackTexts.contactSection.namePlaceholderEs,
      contact_email_label_en: fallbackTexts.contactSection.emailLabelEn,
      contact_email_label_es: fallbackTexts.contactSection.emailLabelEs,
      contact_email_placeholder_en: fallbackTexts.contactSection.emailPlaceholderEn,
      contact_email_placeholder_es: fallbackTexts.contactSection.emailPlaceholderEs,
      contact_msg_label_en: fallbackTexts.contactSection.messageLabelEn,
      contact_msg_label_es: fallbackTexts.contactSection.messageLabelEs,
      contact_msg_placeholder_en: fallbackTexts.contactSection.messagePlaceholderEn,
      contact_msg_placeholder_es: fallbackTexts.contactSection.messagePlaceholderEs,
      contact_submit_en: fallbackTexts.contactSection.submitEn,
      contact_submit_es: fallbackTexts.contactSection.submitEs,
      contact_toast_title_en: fallbackTexts.contactSection.toastTitleEn,
      contact_toast_title_es: fallbackTexts.contactSection.toastTitleEs,
      contact_toast_desc_en: fallbackTexts.contactSection.toastDescEn,
      contact_toast_desc_es: fallbackTexts.contactSection.toastDescEs,
    });
    console.log('  ➕ Textos de secciones iniciales creados.');
  } else {
    console.log('  ✓ Textos de secciones ya existen.');
  }

  console.log('\n✨ Inicialización y siembra completadas con éxito.');
}

main().catch(err => {
  console.error('\n❌ Error durante la siembra:', err);
  process.exit(1);
});
