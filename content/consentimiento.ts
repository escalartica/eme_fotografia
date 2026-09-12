/**
 * EL TEXTO EXACTO QUE LA PAREJA ACEPTA AL ENVIAR EL FORMULARIO, y su versión.
 *
 * No es una frase decorativa: el RGPD (art. 7.1) exige poder DEMOSTRAR que
 * hubo consentimiento, y demostrarlo significa poder decir qué texto concreto
 * se aceptó y cuándo. Antes de esto el formulario no pedía consentimiento de
 * ninguna forma y en el mensaje guardado no quedaba constancia de nada.
 *
 * VIVE EN UN SOLO SITIO porque lo usan dos: el formulario lo pinta y el
 * servidor lo GUARDA. Y lo guarda de aquí, nunca de lo que mande el
 * navegador: si el texto viajara en la petición, cualquiera podría afirmar
 * haber aceptado algo distinto de lo que la web enseñó, que es exactamente lo
 * contrario de una prueba.
 *
 * LA VERSIÓN CAMBIA CUANDO CAMBIE EL TEXTO, con la fecha del cambio. Los
 * mensajes antiguos conservan la versión que aceptaron en su momento, así que
 * reescribir esta frase no reescribe el pasado -- que es justo lo que haría
 * inútil el registro.
 */
export const CONSENTIMIENTO_VERSION = '2026-09-12';

export const CONSENTIMIENTO_TEXTO =
  'He leído la política de privacidad y acepto que EME Fotografía Sevilla trate mis datos para responder a esta consulta.';

/**
 * LA VERSIÓN DE LA POLÍTICA A LA QUE APUNTA ESE TEXTO.
 *
 * Va aparte de `CONSENTIMIENTO_VERSION` porque son dos cosas distintas y
 * cambian por separado: una es la frase que la pareja lee bajo la casilla, la
 * otra es el documento de /privacidad que esa frase referencia. Guardar sólo
 * la primera deja el registro a medias -- dice qué frase se aceptó, pero no
 * qué documento decía esa frase que se había leído, que es la otra mitad de
 * lo que hay que poder demostrar.
 *
 * Al tocar app/(site)/privacidad/page.tsx, sube esta fecha.
 */
export const POLITICA_VERSION = '2026-09-12';
