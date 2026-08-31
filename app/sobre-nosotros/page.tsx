import Image from 'next/image';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Sobre nosotros',
  description: 'Contamos bodas y eventos como editoriales de moda: dirección de arte, luz cuidada y una narrativa propia.',
  path: '/sobre-nosotros',
});

export default function Page() {
  return (
    <article>
      <h1>{site.brandName}</h1>
      <p>Contamos bodas y eventos como se cuentan los editoriales: con dirección de arte, luz cuidada y una narrativa propia, no como un reportaje al uso.</p>

      <section aria-labelledby="filosofia-heading">
        <h2 id="filosofia-heading">Filosofía</h2>
        <p>Cada encargo empieza por entender a las personas, no solo el evento. La cámara viene después.</p>
      </section>

      <section aria-labelledby="proceso-heading">
        <h2 id="proceso-heading">Proceso</h2>
        <p>De la primera llamada a la entrega final, mantenemos una comunicación cercana y plazos claros.</p>
      </section>

      <section aria-labelledby="equipo-heading">
        <h2 id="equipo-heading">Equipo</h2>
        <Image src="/images/sobre-nosotros/placeholder-team.webp" alt="Equipo de EME Fotografía Sevilla (imagen de muestra)" width={800} height={1200} />
        <p>Al frente del estudio está {site.founderName}, fotógrafa. El resto de la trayectoria del equipo, así como la fotografía real del equipo, está pendiente de confirmación por el cliente — esta sección se actualizará con los datos reales.</p>
      </section>
    </article>
  );
}
