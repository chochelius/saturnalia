# Cloudflare Worker con Resend para Saturnalia999

Este Worker recibe las transmisiones del formulario de contacto en `saturnalia999.art` y las envía directamente a tu bandeja de correo personal utilizando la API oficial de **Resend**.

## 🚀 Despliegue Rápido desde el Panel de Cloudflare

1. Entra a tu panel de **Cloudflare** -> **Workers & Pages** -> **Create application** -> **Worker**.
2. Dale un nombre (ej: `saturnalia-contact`).
3. Haz clic en **Deploy**, luego en **Quick edit** y pega todo el contenido de `contact-worker.js`.
4. Guarda y despliega (**Save and deploy**).

### 🔑 Configurar Variables de Entorno (Secrets)

En el Worker, ve a la pestaña **Settings** -> **Variables and Secrets**:

| Variable | Tipo | Valor |
|---|---|---|
| `RESEND_API_KEY` | Secret | Tu clave de API de Resend (empieza con `re_...`) |
| `FORWARD_EMAIL` | Plain text | Tu correo personal donde recibirás los mensajes (ej: `tu_correo@gmail.com`) |
| `FROM_EMAIL` | Plain text | Remitente verificado en Resend (ej: `onboarding@resend.dev` o `contact@saturnalia999.art`) |

### 🌐 Vincular Ruta o Subdominio

En Cloudflare, ve a **Settings** -> **Domains & Routes**:
- Puedes asignarle una ruta personalizada como `https://saturnalia999.art/api/contact*` en tu zona de DNS de `saturnalia999.art`.
- O usar la URL directa que te da Cloudflare (ej: `https://saturnalia-contact.<tu-subdominio>.workers.dev`).
