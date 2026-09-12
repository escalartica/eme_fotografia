import { notFound } from 'next/navigation';
import { services } from '@/content/services';
import { breadcrumbSchema, jsonLd } from '@/lib/schema';
import { buildMetadata, ogImage } from '@/lib/seo';
import { ServicioDetalle } from '../ServicioDetalle';
import styles from '../page.module.css';

const service = services.find((s) => s.slug === 'video');

export const metadata = service
  ? buildMetadata({
      title: service.metaTitle,
      description: service.metaDescription,
      path: service.route,
      // La tarjeta de enlace es la MISMA fotografía que abre la página, la que
      // el propio servicio declara en content/services.ts. Antes era el
      // logotipo: la página que vende fotografía se compartía por WhatsApp
      // como un wordmark. `ogImage()` cambia la extensión al derivado JPEG de
      // 1200x630 que vive al lado (WhatsApp no pinta WebP; ver lib/seo.ts).
      image: ogImage(service.previewImage),
    })
  : {};

export default function Page() {
  // El contenido de esta página vive entero en content/services.ts. Si algún
  // día se retira de ahí el servicio, la ruta tiene que devolver un 404 real
  // y no una página en blanco con menú y pie.
  if (!service) notFound();
  return (
    <div className={styles.page}>
      {/* La vuelta al índice es un enlace suelto arriba del todo
          (components/ui/VolverA), no una miga de pan: una miga enseña la ruta
          entera y con dos niveles eso es mobiliario. Aquí va el MARCADO de
          `BreadcrumbList`, que es otra cosa -- lo que Google pinta en el
          resultado de búsqueda, donde sí sirve ver la jerarquía. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema([
              { name: 'Inicio', path: '/' },
              { name: 'Servicios', path: '/servicios' },
              { name: service.name, path: service.route },
            ]),
          ),
        }}
      />
      <ServicioDetalle service={service} />
    </div>
  );
}
