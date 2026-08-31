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
    answer: 'La fecha queda reservada con la firma de un contrato y el pago de una señal a cuenta del presupuesto total. Así garantizamos que tu boda o evento queda en exclusiva con nosotros.',
    isPendingConfirmation: true,
  },
  {
    id: 'entrega',
    question: '¿Cuánto se tarda en recibir las fotos y el vídeo?',
    answer: 'El plazo habitual es de 6 a 8 semanas para la galería de fotos y de 8 a 12 semanas para el vídeo, según la época del año.',
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
    answer: 'Las fotografías y el vídeo son para tu uso personal y el de tus invitados. EME Fotografía Sevilla se reserva el derecho a utilizar una selección de las imágenes en su web, redes sociales y portfolio, salvo que prefiráis lo contrario.',
    isPendingConfirmation: true,
  },
  {
    id: 'cancelacion',
    question: '¿Qué pasa si tengo que cambiar la fecha?',
    answer: 'Entendemos que a veces hay que cambiar de fecha. Escríbenos en cuanto lo sepas y buscamos juntos la mejor solución según disponibilidad.',
    isPendingConfirmation: true,
  },
];
