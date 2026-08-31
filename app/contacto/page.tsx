import { ContactForm } from '@/components/ui/ContactForm';
import { Faq } from '@/components/sections/Faq';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.css';

export const metadata = buildMetadata({
  title: 'Contacto',
  description: 'Cuéntanos tu boda o evento en Sevilla. Respondemos con cita previa.',
  path: '/contacto',
});

export default function Page() {
  return (
    <div className={styles.page}>
      <h1>Contacto</h1>
      <p>Cuéntanos tu proyecto. También puedes escribirnos a <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
      <p>Con cita previa — {site.legalCity}, España.</p>
      <ContactForm />
      <Faq />
    </div>
  );
}
