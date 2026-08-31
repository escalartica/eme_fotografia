import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/content/site';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export function SobreEmePreview() {
  return (
    <ScrollReveal>
      <section aria-labelledby="sobre-heading">
        <Image src="/images/sobre-nosotros/placeholder-team.webp" alt="Equipo de EME Fotografía Sevilla" width={800} height={1000} />
        <h2 id="sobre-heading">Sobre {site.brandName}</h2>
        <p>Un estudio de fotografía y vídeo en {site.legalCity} que trata cada boda y cada evento como una historia editorial, no como un simple reportaje.</p>
        <Link href="/sobre-nosotros">Conocer el estudio</Link>
      </section>
    </ScrollReveal>
  );
}
