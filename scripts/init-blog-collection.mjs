/**
 * Script de inicialización de la colección 'blog_posts' en PocketBase (v0.25+)
 * Uso: node scripts/init-blog-collection.mjs [pb_url] [admin_email] [admin_password]
 */

import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PB_URL = process.argv[2] || process.env.POCKETBASE_URL || 'http://192.168.1.118:8090';
const pb = new PocketBase(PB_URL);

async function main() {
  console.log(`📡 Conectando a PocketBase en: ${PB_URL}`);

  const email = process.argv[3] || process.env.PB_ADMIN_EMAIL || 'admin@saturnalia999.com';
  const password = process.argv[4] || process.env.PB_ADMIN_PASSWORD || 'Saturnalia999!';

  try {
    console.log(`🔐 Autenticando superusuario: ${email}`);
    await pb.collection('_superusers').authWithPassword(email, password);
    console.log('✅ Autenticación superusuario exitosa.');
  } catch (err) {
    try {
      await pb.collection('users').authWithPassword(email, password);
      console.log('✅ Autenticación como usuario exitosa.');
    } catch (e) {
      console.error('❌ Error de autenticación:', err.message);
      process.exit(1);
    }
  }

  // 1. Verificar si la colección ya existe
  try {
    const existing = await pb.collections.getOne('blog_posts');
    console.log("✓ Colección 'blog_posts' ya existe.");
  } catch (err) {
    if (err.status === 404) {
      console.log("➕ Creando colección 'blog_posts' en PocketBase...");
      await pb.collections.create({
        name: 'blog_posts',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""',
        fields: [
          { name: 'title_en', type: 'text', required: true },
          { name: 'title_es', type: 'text', required: true },
          { name: 'slug', type: 'text', required: true },
          { name: 'excerpt_en', type: 'text' },
          { name: 'excerpt_es', type: 'text' },
          { name: 'content_en', type: 'text' },
          { name: 'content_es', type: 'text' },
          {
            name: 'cover_image',
            type: 'file',
            maxSelect: 1,
            maxSize: 10485760,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          },
          { name: 'tags', type: 'text' },
          { name: 'is_featured', type: 'bool' },
          {
            name: 'status',
            type: 'select',
            maxSelect: 1,
            values: ['published', 'draft'],
          },
          { name: 'published_at', type: 'date' },
          { name: 'order', type: 'number' },
        ],
      });
      console.log("✅ Colección 'blog_posts' creada exitosamente.");
    } else {
      console.error('Error al inspeccionar colecciones:', err.message);
    }
  }

  // 2. Sembrar artículo inicial si la colección está vacía
  try {
    const list = await pb.collection('blog_posts').getList(1, 1);
    if (list.totalItems === 0) {
      console.log('🌱 Sembrando artículo inicial de ejemplo en blog_posts...');
      const fallbackBlog = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../src/data/fallback/blog.json'), 'utf-8')
      );
      if (fallbackBlog && fallbackBlog.length > 0) {
        const item = fallbackBlog[0];
        await pb.collection('blog_posts').create({
          title_en: item.titleEn,
          title_es: item.titleEs,
          slug: item.slug,
          excerpt_en: item.excerptEn,
          excerptEs: item.excerptEs,
          content_en: item.contentEn,
          content_es: item.contentEs,
          tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags,
          is_featured: item.isFeatured ?? true,
          status: item.status || 'published',
          published_at: item.publishedAt || new Date().toISOString(),
          order: 1,
        });
        console.log('✅ Artículo inicial sembrado.');
      }
    }
  } catch (seedErr) {
    console.warn('⚠️ No se pudo sembrar el artículo inicial:', seedErr.message);
  }

  console.log('\n🎉 Inicialización de blog_posts completada.');
}

main().catch(console.error);
