import type { Service } from './types';

export const services: Service[] = [
  {
    slug: 'boda',
    name: 'Fotografía de Boda',
    tagline: 'Cada boda, contada como una historia editorial.',
    includes: ['Cobertura completa del día', 'Preboda opcional', 'Álbum editorial impreso', 'Galería digital privada'],
    idealFor: 'Parejas que quieren fotografías con dirección artística, no solo un reportaje.',
    // Genuinely real client asset — the same raquel-y-fran cover photo
    // shown on /trabajos and the Home SelectedWork grid.
    previewImage: '/images/trabajos/raquel-y-fran/cover.webp',
    process: [
      { step: 1, title: 'Primera conversación', description: 'Conocemos la pareja, el lugar y el estilo que buscan.' },
      { step: 2, title: 'Planificación', description: 'Diseñamos la cobertura del día junto a la pareja y el resto de proveedores.' },
      { step: 3, title: 'El gran día', description: 'Cobertura discreta y dirigida a la vez, sin interrumpir la celebración.' },
      { step: 4, title: 'Entrega', description: 'Selección editada y álbum en un plazo acordado.' },
    ],
    ctaLabel: 'Reservar fecha',
  },
  {
    slug: 'video',
    name: 'Vídeo',
    tagline: 'Cine de bodas y eventos, no un simple resumen.',
    includes: ['Vídeo resumen cinematográfico', 'Audio ambiente y votos', 'Teaser para redes sociales', 'Entrega en 4K'],
    idealFor: 'Quienes quieren revivir el día en movimiento, con ritmo y banda sonora propia.',
    // Genuinely real client asset — the same boda-real-01 poster frame used
    // in Hero (Task 1) and the masked-wordmark moment (Task 9).
    previewImage: '/videos/posters/real-boda-01-full.webp',
    process: [
      { step: 1, title: 'Guion emocional', description: 'Definimos qué momentos deben protagonizar el vídeo.' },
      { step: 2, title: 'Rodaje', description: 'Cámara en mano y fija, sonido ambiente capturado en directo.' },
      { step: 3, title: 'Montaje', description: 'Edición narrativa con música con licencia y color grading propio.' },
      { step: 4, title: 'Entrega', description: 'Vídeo final y teaser corto para compartir.' },
    ],
    ctaLabel: 'Consultar disponibilidad',
  },
  {
    slug: 'fotomaton',
    name: 'Fotomatón',
    tagline: 'Diversión instantánea con acabado editorial.',
    includes: ['Fotomatón con atrezzo a medida', 'Impresión instantánea ilimitada', 'Álbum de firmas de invitados', 'Copia digital de todas las fotos'],
    idealFor: 'Bodas, comuniones y eventos de empresa que buscan un momento memorable para los invitados.',
    process: [
      { step: 1, title: 'Diseño del rincón', description: 'Adaptamos el fotomatón a la estética del evento.' },
      { step: 2, title: 'Montaje', description: 'Instalación y prueba técnica antes de la llegada de invitados.' },
      { step: 3, title: 'Durante el evento', description: 'Personal presente para asistir a los invitados.' },
      { step: 4, title: 'Entrega', description: 'Galería digital completa al día siguiente.' },
    ],
    ctaLabel: 'Pedir presupuesto',
  },
  {
    slug: '360',
    name: 'Experiencia 360°',
    tagline: 'La plataforma que convierte a los invitados en protagonistas.',
    includes: ['Plataforma 360° con cámara elevada', 'Vídeos a cámara lenta editados al instante', 'Compartición inmediata por QR', 'Iluminación y atrezzo temático'],
    idealFor: 'Eventos que buscan el momento más compartido en redes sociales de la noche.',
    process: [
      { step: 1, title: 'Ubicación', description: 'Elegimos el punto del evento con mejor flujo de invitados.' },
      { step: 2, title: 'Montaje técnico', description: 'Calibración de la plataforma e iluminación.' },
      { step: 3, title: 'Durante el evento', description: 'Operador dedicado durante todo el horario contratado.' },
      { step: 4, title: 'Entrega', description: 'Todos los vídeos disponibles para descarga inmediata.' },
    ],
    ctaLabel: 'Pedir presupuesto',
  },
];
