/**
 * Script de inicialización y siembra de colecciones en PocketBase para Saturnalia999
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

async function main() {
  console.log(`📡 Conectando a PocketBase en: ${PB_URL}`);

  const email = process.argv[2] || process.env.PB_ADMIN_EMAIL;
  const password = process.argv[3] || process.env.PB_ADMIN_PASSWORD;

  if (email && password) {
    try {
      console.log(`🔐 Autenticando como superusuario: ${email}`);
      await pb.admins.authWithPassword(email, password);
      console.log('✅ Autenticación de administrador exitosa.');
    } catch (err) {
      console.warn('⚠️ No se pudo autenticar como admin, intentando acceso público:', err.message);
    }
  } else {
    console.log('ℹ️ No se pasaron credenciales admin. Operando sobre colecciones con reglas públicas.');
  }

  // 1. Sembrar Álbumes
  try {
    console.log('\n💿 Verificando álbumes...');
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
          bandcamp_embed_id: album.bandcampEmbedId || '',
          order: album.order,
        });
        console.log(`  ➕ Creado álbum: ${album.title}`);
      } else {
        console.log(`  ✓ Ya existe: ${album.title}`);
      }
    }
  } catch (err) {
    console.error('Error procesando álbumes:', err.message);
  }

  // 2. Sembrar Biografía
  try {
    console.log('\n📜 Verificando biografía...');
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
      console.log('  ✓ Biografía ya existente.');
    }
  } catch (err) {
    console.error('Error procesando biografía:', err.message);
  }

  // 3. Sembrar Redes Sociales
  try {
    console.log('\n🌐 Verificando redes sociales...');
    const existingSocials = await pb.collection('socials').getFullList().catch(() => []);
    if (existingSocials.length === 0) {
      await pb.collection('socials').create(fallbackSocials);
      console.log('  ➕ Redes sociales iniciales creadas.');
    } else {
      console.log('  ✓ Redes sociales ya existentes.');
    }
  } catch (err) {
    console.error('Error procesando redes sociales:', err.message);
  }

  // 4. Sembrar Enlaces Rápidos (/links)
  try {
    console.log('\n🔗 Verificando enlaces rápidos (/links)...');
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
  } catch (err) {
    console.error('Error procesando enlaces:', err.message);
  }

  console.log('\n✨ Proceso de inicialización finalizado.');
}

main().catch(console.error);
