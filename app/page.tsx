import { Hero } from '@/components/sections/Hero';
import { Manifiesto } from '@/components/sections/Manifiesto';
import { SelectedWork } from '@/components/sections/SelectedWork';
import { ServiciosPreview } from '@/components/sections/ServiciosPreview';
import { SobreEmePreview } from '@/components/sections/SobreEmePreview';
import { Testimonios } from '@/components/sections/Testimonios';
import { CtaContacto } from '@/components/sections/CtaContacto';

export default function Page() {
  return (
    <>
      <Hero />
      <Manifiesto />
      <SelectedWork />
      <ServiciosPreview />
      <SobreEmePreview />
      <Testimonios />
      <CtaContacto />
    </>
  );
}
