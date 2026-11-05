/**
 * Cloudflare Worker: Contact Forwarder con Resend API para Saturnalia999
 * Dominio: saturnalia999.art
 * 
 * Variables de Entorno en Cloudflare Worker:
 * - RESEND_API_KEY: Clave de API de Resend (re_...)
 * - FORWARD_EMAIL: Tu correo de destino donde deseas recibir los mensajes (ej: admin@saturnalia999.com)
 * - FROM_EMAIL: Correo remitente verificado en Resend (ej: transmissions@saturnalia999.art o onboarding@resend.dev)
 */

const ALLOWED_ORIGINS = [
  'https://saturnalia999.art',
  'https://www.saturnalia999.art',
  'http://localhost:4321',
  'http://localhost:9002',
  'http://192.168.1.118:9002',
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.saturnalia999.art');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://saturnalia999.art',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request);

    // 1. Manejo de Preflight OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2. Solo aceptar método POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método no permitido. Solo se acepta POST.' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const data = await request.json();
      const { name, email, message } = data;

      // Validación de datos
      if (!name || name.trim().length < 2) {
        return new Response(JSON.stringify({ error: 'El nombre debe tener al menos 2 caracteres.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!email || !email.includes('@') || !email.includes('.')) {
        return new Response(JSON.stringify({ error: 'Ingresa un correo electrónico válido.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!message || message.trim().length < 10) {
        return new Response(JSON.stringify({ error: 'El mensaje debe tener al menos 10 caracteres.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const resendApiKey = env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error('RESEND_API_KEY no está configurada en las variables de entorno de Cloudflare Worker.');
        return new Response(JSON.stringify({ error: 'Error de configuración del servidor de correo.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const destinationEmail = env.FORWARD_EMAIL || 'saturnalia999@gmail.com';
      const senderEmail = env.FROM_EMAIL || 'onboarding@resend.dev';

      // 3. Enviar correo mediante Resend API
      const emailHtml = `
        <div style="background-color: #020202; color: #1ca1e5; font-family: monospace, sans-serif; padding: 24px; border: 1px solid #1ca1e5;">
          <h2 style="color: #67cdf7; text-transform: uppercase; letter-spacing: 2px; margin-top: 0;">
            [SATURNALIA999] Nuevo Mensaje de Contacto
          </h2>
          <hr style="border: 0; border-top: 1px solid #157fc9; margin: 16px 0;" />
          <p style="margin: 8px 0; font-size: 14px;"><strong>Nombre / Remitente:</strong> ${escapeHtml(name)}</p>
          <p style="margin: 8px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color: #33aaff;">${escapeHtml(email)}</a></p>
          <p style="margin: 8px 0; font-size: 14px;"><strong>Fecha:</strong> ${new Date().toUTCString()}</p>
          <div style="background-color: #070707; border-left: 3px solid #1ca1e5; padding: 16px; margin-top: 16px; color: #e0f2fe; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
            ${escapeHtml(message)}
          </div>
          <hr style="border: 0; border-top: 1px solid #0f415b; margin: 24px 0 16px 0;" />
          <p style="font-size: 11px; color: #64748b; margin: 0; text-transform: uppercase;">
            Mensaje enviado desde https://saturnalia999.art/contact
          </p>
        </div>
      `;

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Saturnalia999 Contact <${senderEmail}>`,
          to: [destinationEmail],
          reply_to: email,
          subject: `[Saturnalia999] Nuevo Mensaje de ${name}`,
          html: emailHtml,
        }),
      });

      if (!resendResponse.ok) {
        const resendError = await resendResponse.text();
        console.error('Error desde la API de Resend:', resendError);
        return new Response(JSON.stringify({ error: 'No se pudo entregar el correo a través de Resend.', details: resendError }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const resendResult = await resendResponse.json();

      return new Response(JSON.stringify({
        success: true,
        message: 'Mensaje recibido y enviado con éxito.',
        id: resendResult.id,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Error en Cloudflare Worker:', err);
      return new Response(JSON.stringify({ error: 'Error procesando la solicitud.', details: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
