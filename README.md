# EME Fotografía Sevilla

Sitio web de EME Fotografía Sevilla (Next.js + TypeScript).

## Desarrollo

npm install
npm run dev

## Sustituir el contenido de muestra por material real

1. Fotos: sustituye los archivos `placeholder-*.webp` en `public/images/` por las fotos reales del cliente, manteniendo los mismos nombres de archivo (o actualiza las rutas en `content/projects.ts`).
2. Vídeos: igual que arriba, en `public/videos/`.
3. En cada entrada de `content/projects.ts`, `content/testimonials.ts`, cambia `isPlaceholderMedia`/`isPlaceholder` a `false` una vez sustituido el contenido correspondiente.
4. Cuando todo el contenido de muestra haya sido sustituido, pon `NEXT_PUBLIC_SHOW_PLACEHOLDER_NOTICE=false` en `.env.local` para quitar el aviso del footer (el aviso se muestra por defecto salvo que esta variable valga explícitamente `false`, así que eliminar la variable NO lo desactiva).
5. Confirma con el cliente: la URL real de Facebook (`content/site.ts`), el horario completo, el teléfono de contacto, y el nombre del fundador/equipo para `/sobre-nosotros` — quedan documentados como pendientes en la spec (`docs/superpowers/specs/2026-08-31-eme-fotografia-web-design.md`, sección 12).
