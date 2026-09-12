import type { FaqEntry } from './types';

// Voice: close, plain Spanish, second person plural (the couple). Questions
// are phrased the way people type them into Google. Entries marked
// isPendingConfirmation carry a commercial claim the studio must confirm.
export const faqs: FaqEntry[] = [
  {
    id: 'disponibilidad',
    question: '¿Cómo sé si tenéis libre mi fecha?',
    answer:
      'Escribidnos con la fecha y el lugar por el formulario o por WhatsApp y os contestamos personalmente, normalmente el mismo día. Si esa fecha sigue abierta os lo decimos en la misma respuesta, con quién del equipo estaría disponible.',
  },
  {
    id: 'antelacion',
    question: '¿Con cuánta antelación hay que reservar un fotógrafo de bodas en Sevilla?',
    answer:
      'Las fechas de primavera y de septiembre-octubre suelen cerrarse con un año de antelación. Si vuestra boda es en otra época, con seis meses suele ser suficiente, pero preguntad igualmente: a veces hay hueco.',
    isPendingConfirmation: true,
  },
  {
    id: 'precio',
    question: '¿Cuánto cuesta un fotógrafo de bodas en Sevilla?',
    answer:
      'Depende de lo que queráis: solo fotografía, solo vídeo o las dos cosas, las horas de cobertura, si añadís preboda o álbum, y el desplazamiento. Tenemos packs montados para las combinaciones que más nos piden, y presupuestos a medida para las bodas que no encajan en ninguno. Por eso no publicamos una tarifa cerrada: contadnos cómo es la vuestra y os enviamos un presupuesto claro, sin sorpresas ni extras escondidos.',
  },
  {
    id: 'foto-y-video',
    question: '¿Hacéis fotografía y vídeo de boda a la vez?',
    answer:
      'Sí, y es como mejor trabajamos. Somos un mismo equipo, con la misma mirada y el mismo color en foto y en vídeo, así que no tenéis que coordinar a dos proveedores que no se conocen ni aguantar a dos equipos peleando por el mismo sitio.',
  },
  {
    // La pregunta que separa a este estudio de casi todos sus competidores en
    // Sevilla: las 29 fichas de /trabajos publican el reportaje entero, no una
    // selección de diez fotos buenas. Se puede comprobar abriendo cualquiera.
    id: 'ver-boda-entera',
    question: '¿Podemos ver una boda entera antes de decidir?',
    answer:
      'Sí, y es lo que os pedimos que hagáis. En Trabajos cada reportaje está publicado completo, de los preparativos al último baile, no una selección de diez fotos buenas. Cuando nos veamos os enseñamos además galerías enteras, para que sepáis qué recibiréis vosotros y no solo lo que enseñamos por ahí.',
  },
  {
    id: 'cuantos-sois',
    question: '¿Cuántas personas venís el día de la boda?',
    answer:
      'Los que haga falta, que casi nunca son los cinco. El equipo lo forman cinco personas fijas, pero quién va a vuestra boda depende de lo que contratéis y de cómo sea el día: una boda de sesenta invitados con solo fotografía no necesita lo mismo que una de trescientos con foto, vídeo y dron. Lo que no cambia es de dónde sale quien va: del equipo de siempre, no de una lista de cámaras sueltos contratados para ese sábado. En el presupuesto veréis exactamente cuántos y quiénes.',
  },
  {
    id: 'dron',
    question: '¿Voláis dron en la boda?',
    answer:
      'Sí, cuando el sitio lo permite. El dron da los planos de llegada, de la finca entera y del cortejo desde arriba, y lo usamos como complemento, nunca como el grueso del reportaje. Antes de contarlo comprobamos el espacio aéreo del lugar: hay fincas cerca de aeropuertos o de espacios protegidos donde no se puede volar, y en ese caso os lo decimos desde el principio.',
  },
  {
    id: 'reserva',
    question: '¿Cómo se reserva la fecha?',
    answer:
      'Con un contrato sencillo y una señal a cuenta del presupuesto total. A partir de ahí el equipo que hayamos acordado queda reservado para vosotros y empezamos a planificar el día juntos.',
    isPendingConfirmation: true,
  },
  {
    id: 'entrega',
    question: '¿Cuánto se tarda en recibir las fotos y el vídeo?',
    answer:
      'Unas fotos de adelanto en los días siguientes, para que tengáis algo que enseñar. La galería completa, entre tres y seis meses. La película, entre seis meses y un año: el montaje de una boda entera lleva mucho más trabajo del que parece y preferimos deciros el plazo de verdad antes que uno bonito que no vamos a cumplir.',
  },
  {
    // La pregunta la trae el propio material: quien ve un tráiler con música
    // encima da por hecho que la película larga lleva las voces del día. No
    // las lleva, y es mejor decirlo aquí que dejar que se descubra al abrir
    // la entrega.
    id: 'sonido-video',
    question: '¿La película lleva el sonido de la ceremonia?',
    answer:
      'La película se monta sobre hilo musical, con música con licencia elegida para vuestra boda. No entregamos las voces ni el sonido directo del día: ni los votos, ni los discursos, ni el ambiente. Es una decisión de montaje, no un extra que se pueda añadir, así que preferimos que lo sepáis antes de contratar y no al abrir el enlace.',
  },
  {
    id: 'desplazamiento',
    question: '¿Os desplazáis fuera de Sevilla?',
    answer:
      'Sí. Trabajamos en toda Andalucía (Cádiz, Huelva, Córdoba, Málaga, Granada, Jaén y Almería) y también fuera. El desplazamiento se calcula según la distancia y os lo incluimos en el presupuesto desde el principio.',
  },
  {
    id: 'preboda',
    question: '¿Hacéis sesiones de preboda o postboda?',
    answer:
      'Sí, y os las recomendamos. Es una sesión tranquila, sin horarios ni invitados, en un lugar que os diga algo: las calles de Santa Cruz, la sierra, la playa. Además sirve para que el día de la boda la cámara ya sea alguien conocido.',
  },
  {
    id: 'lluvia',
    question: '¿Qué pasa si llueve el día de la boda?',
    answer:
      'Se trabaja igual. Cuando planificamos el día con vosotros miramos también el plan B: qué espacios cubiertos tiene el sitio, cuáles aguantan a todos los invitados y a qué hora conviene mover cada cosa. Además la lluvia da fotos que no se pueden repetir: los paraguas a la salida de la iglesia, los reflejos en el suelo, la carrera hasta el coche.',
  },
  {
    id: 'galeria',
    question: '¿Cómo recibimos las fotos?',
    answer:
      'En una galería online privada, protegida con clave, que podéis compartir con familia e invitados. Desde ella veis todas las fotos, las descargáis y marcáis vuestras favoritas; si lleváis álbum, esa selección es con la que lo montamos.',
  },
  {
    id: 'derechos-imagen',
    question: '¿Quién tiene los derechos de las fotos y los vídeos?',
    answer:
      'Las imágenes son para vuestro uso personal y el de vuestros invitados. EME Fotografía Sevilla puede mostrar una selección en su web, redes y portfolio, salvo que prefiráis que no; basta con decírnoslo.',
    isPendingConfirmation: true,
  },
  {
    id: 'cancelacion',
    question: '¿Qué pasa si tenemos que cambiar la fecha?',
    answer:
      'Pasa más de lo que parece y no es ningún drama. Escribidnos en cuanto lo sepáis y buscamos juntos la mejor solución según nuestra disponibilidad.',
    isPendingConfirmation: true,
  },
];
