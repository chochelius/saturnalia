# 🕷️ Saturnalia999 — Sitio Web Oficial

Sitio web oficial y portfolio musical de **Saturnalia999** (proyecto gótico/experimental de Chile).  
Construido con **Astro 5**, **React 18** (arquitectura de islas), **Tailwind CSS**, y backend/CMS con **PocketBase**.

---

## ⚡ Características Principales

- **Rendimiento Ultrarrápido:** Generación estática (SSG) con arquitectura de islas React.
- **Internacionalización (i18n):** Rutas estáticas completas en inglés (`/`) y español (`/es`).
- **Reproductor de Audio Cyberpunk Híbrido:**
  - Reproductor interactivo integrado en cada tarjeta de álbum.
  - Reproduce archivos de audio alojados en PocketBase (Play/Pausa, barra interactiva de progreso, duración, mute).
  - Soporte embebido para Bandcamp player o enlaces de streaming (Spotify/Bandcamp).
- **Ruta `/links` (Linktree alternativo):**
  - Página vertical optimizada para bio de Instagram y móvil (`/links` y `/es/links`).
  - Botones con brillo de neón, avatar, enlaces de plataformas musicales, último video y contacto.
- **CMS y Backend con PocketBase:**
  - Panel administrativo en `http://<IP_RASPBERRY>:8090/_/` para gestionar álbumes, archivos de audio/portadas, biografía, redes y enlaces rápidos.
  - Modo híbrido con fallback offline: si PocketBase no está activo durante el build, Astro utiliza automáticamente las instantáneas locales de `src/data/fallback/`.
- **Efectos Visuales Optimizados:**
  - Animación de partículas interactiva en Canvas 2D (`ParticleBackground`).
  - Efecto de glitch tipográfico (`GlitchText`).
  - Paleta cyberpunk/industrial cian y negro (#020202) con sombras y resplandor espectral (`text-ghost-glow`).

---

## 🚀 Comandos

```bash
# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción (genera HTML/CSS estático en dist/)
npm run build

# Previsualizar el build estático localmente
npm run preview

# Verificación de tipos TypeScript
npm run typecheck

# Sincronizar y desplegar a la Raspberry Pi
npm run sync:pi
```

---

## 🗄️ Gestión de Contenido con PocketBase

1. Abre el panel de administración de PocketBase:
   ```
   http://192.168.1.118:8090/_/
   ```
2. Colecciones disponibles:
   - **albums**: Título, precio, portada (URL o archivo directo), stream URL, archivo de audio para reproducción nativa, ID de embed de Bandcamp y orden.
   - **bio**: Textos bilingües de la biografía.
   - **socials**: Enlaces oficiales a Spotify, YouTube, Bandcamp e Instagram.
   - **links**: Enlaces dinámicos para la página rápida `/links`.

---

## 🔄 Sincronización con la Raspberry Pi

Para sincronizar los cambios de código locales hacia la Raspberry Pi, ejecuta:

```powershell
npm run sync:pi
```

El script se encarga de transferir los archivos actualizados, compilar el sitio estático en la Raspberry Pi y reiniciar el servicio de producción.
