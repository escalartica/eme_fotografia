import type { FaqEntry } from './types';

export const faqs: FaqEntry[] = [
  {
    id: 'disponibilidad',
    question: '¿Cómo sé si estáis disponibles para mi fecha?',
    answer: 'Escríbenos con la fecha de tu evento a través del formulario de contacto y te confirmamos la disponibilidad lo antes posible.',
  },
  {
    id: 'reserva',
    question: '¿Cómo se reserva la fecha?',
    answer: 'Proceso de reserva pendiente de confirmar con el estudio — lo actualizaremos aquí en cuanto lo tengamos cerrado.',
    isPendingConfirmation: true,
  },
  {
    id: 'entrega',
    question: '¿Cuánto se tarda en recibir las fotos y el vídeo?',
    answer: 'Plazo de entrega pendiente de confirmar con el estudio — lo actualizaremos aquí en cuanto lo tengamos cerrado.',
    isPendingConfirmation: true,
  },
  {
    id: 'desplazamiento',
    question: '¿Os desplazáis fuera de Sevilla?',
    answer: 'Sí, cubrimos bodas y eventos fuera de Sevilla. El coste de desplazamiento depende de la distancia — coméntanoslo al escribirnos y te damos un presupuesto ajustado.',
  },
  {
    id: 'derechos-imagen',
    question: '¿Quién tiene los derechos de las fotos y vídeos?',
    answer: 'Política de derechos de imagen pendiente de confirmar con el estudio — lo actualizaremos aquí en cuanto la tengamos cerrada.',
    isPendingConfirmation: true,
  },
  {
    id: 'cancelacion',
    question: '¿Qué pasa si tengo que cambiar la fecha?',
    answer: 'Política de cambios de fecha pendiente de confirmar con el estudio — lo actualizaremos aquí en cuanto la tengamos cerrada.',
    isPendingConfirmation: true,
  },
];
