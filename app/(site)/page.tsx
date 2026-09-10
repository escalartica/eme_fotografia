import { Hero } from '@/components/sections/Hero';
import { Manifiesto } from '@/components/sections/Manifiesto';
import { Cifras } from '@/components/sections/Cifras';
import { SelectedReel } from '@/components/sections/SelectedReel';
import { ServicioPanel } from '@/components/sections/ServicioPanel';
import { services } from '@/content/services';
import { SobreEmePreview } from '@/components/sections/SobreEmePreview';
import { Testimonios } from '@/components/sections/Testimonios';
import { GuiaBodasSevilla } from '@/components/sections/GuiaBodasSevilla';
import { CtaContacto } from '@/components/sections/CtaContacto';
import { StackedSections } from '@/components/motion/StackedSections';
import type { Metadata } from 'next';

// El único canónico de la home, y solo suyo. Estaba en app/layout.tsx, desde
// donde se heredaba a las galerías privadas, a /admin y al 404. Título,
// descripción y OG se siguen heredando del layout, que para eso es el fallback
// del sitio entero.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function Page() {
  return (
    <>
      <Hero />
      {/* Proof, immediately under the fold, before anything else.
          These three figures used to sit about 60% down the page, after
          the manifesto, the reel and both service panels -- i.e. after
          every decision a visitor makes about whether this studio is
          real. A trust strip belongs under the hero and nowhere else:
          the hero makes a claim, this is the receipt. It also comes OUT
          of StackedSections deliberately, so it does not pin and slide;
          proof should sit still and be read. */}
      <Cifras />
      {/* Outside StackedSections too, and for the same reason as Cifras but
          sharper: as a pinned panel this section got min-height 100svh for
          one sentence, so the reader crossed a whole screen of empty paper
          to reach a single line. It is now three sticky rows that stack
          within their own height (see Manifiesto's doc comment) -- three
          statements for less scroll than the one used to cost. */}
      <Manifiesto />
      {/* Everything after the hero moves as a stack of cards (Agentura):
          a section that fits the screen pins while the next slides over
          it; taller ones scroll normally and do the covering. */}
      <StackedSections>
        <SelectedReel />
        {services.map((service, i) => (
          <ServicioPanel key={service.slug} service={service} index={i} />
        ))}
        <SobreEmePreview />
        <Testimonios />
        {/* The page's only prose block: what a reportaje is, foto+vídeo,
            where we shoot, price, lead time, delivery -- and the internal
            links to every other public route. See the component's own doc
            comment for why it exists. */}
        <GuiaBodasSevilla />
        <CtaContacto />
      </StackedSections>
    </>
  );
}
