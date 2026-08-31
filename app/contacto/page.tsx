import { ContactForm } from '@/components/ui/ContactForm';
import { site } from '@/content/site';

export default function Page() {
  return (
    <div>
      <h1>Contacto</h1>
      <p>Cuéntanos tu proyecto. También puedes escribirnos a <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
      <p>Con cita previa — {site.legalCity}, España.</p>
      <ContactForm />
    </div>
  );
}
