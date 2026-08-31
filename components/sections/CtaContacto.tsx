import Link from 'next/link';

export function CtaContacto() {
  return (
    <section aria-labelledby="cta-heading">
      <h2 id="cta-heading">¿Celebras algo importante?</h2>
      <p>Cuéntanos tu fecha y hagamos que se recuerde.</p>
      <Link href="/contacto" data-cursor="ver">Empezar un proyecto</Link>
    </section>
  );
}
