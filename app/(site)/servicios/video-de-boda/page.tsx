import { notFound } from 'next/navigation';
import { services } from '@/content/services';
import { breadcrumbSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';
import { ServicioDetalle } from '../ServicioDetalle';
import styles from '../page.module.css';

const service = services.find((s) => s.slug === 'video');

export const metadata = service
  ? buildMetadata({
      title: service.metaTitle,
      description: service.metaDescription,
      path: service.route,
    })
  : {};

export default function Page() {
  // El contenido de esta página vive entero en content/services.ts. Si algún
  // día se retira de ahí el servicio, la ruta tiene que devolver un 404 real
  // y no una página en blanco con menú y pie.
  if (!service) notFound();
  return (
    <div className={styles.page}>
      {/* Sin migas visibles: el sitio no las tiene y con dos niveles serían
          mobiliario. El marcado sí, que es lo que Google pinta en el
          resultado -- mismo tratamiento que la ficha de reportaje. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
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
