"""Propone dónde anclar el recorte de una fotografía, como `object-position`:
el mismo formato que usa la tabla de content/focus-points.ts.

PARA QUÉ. Todas las fotos del sitio se pintan con `object-fit: cover` dentro
de cajas cuya forma la decide la maquetación, no la fotografía. Cuando las dos
formas no coinciden el navegador tira parte de la imagen, y con el `50% 50%`
por defecto la tira por arriba y por abajo a partes iguales: en una foto de
boda eso son las cabezas.

EL ANCLA ES LA CORONILLA, NO LA CARA. `object-position: 50% p%` hace coincidir
el punto que está a la fracción p de la fotografía con el punto que está a la
fracción p de la caja, así que el borde superior del recorte SIEMPRE cae por
encima de p. Anclando un poco por encima de la cabeza más alta, «no se corta
ninguna cabeza» pasa a ser una propiedad de la aritmética y no un juicio.

ESTO NO REGENERA content/focus-points.ts, Y NO PRETENDE HACERLO.

La herramienta original no llegó a guardarse en el repositorio y la tabla se
quedó sin ella. Esto repite el método que describe la cabecera de esa tabla
(cuatro cascadas de Haar, fusión de detecciones, descarte del fondo, ancla en
la coronilla), pero NO son los mismos parámetros: medido con `--comprobar`
sobre cuarenta fotos de las que ya están en la tabla, dos salen idénticas,
doce caen a tres puntos o menos y veintiséis dan otra cosa. Así que la tabla
publicada se deja como está --funciona, está mirada-- y esto sirve para lo
otro: proponer un punto de partida para una fotografía nueva.

Y LO QUE PROPONE HAY QUE MIRARLO. Sobre las quince fotos nuevas de María y
Francisco Manuel acertó en trece; en dos se enganchó al fondo (un invitado de
espaldas, la espadaña de una iglesia) y habría dejado a los novios fuera del
recorte. La forma de comprobarlo es recortar la foto a la caja en la que va a
caer de verdad --4/5 en la cuadrícula de un reportaje-- con el valor
propuesto, y mirar si se corta alguna cabeza. Los valores de esas quince no
están en la tabla: van como `focus` en su entrada de content/projects.ts, que
es la excepción escrita a mano que siempre gana.

Uso:
  python scripts/measure-focus.py public/images/trabajos/<slug>   # mide y escribe en stdout
  python scripts/measure-focus.py --comprobar                     # dice en cuánto se parece a la tabla
"""
import argparse
import os
import sys

import cv2

RAIZ_PUBLICA = 'public'
CASCADAS = [
    'haarcascade_frontalface_default.xml',
    'haarcascade_frontalface_alt2.xml',
    'haarcascade_profileface.xml',
]
# Cuánto por encima de la ceja empieza el pelo, en alturas de cara. 0,35 es el
# valor con el que dos fotos de la tabla publicada salen clavadas (el retrato
# de Antonio, 49% 0%, y el detalle de Rocío y Juanje, 47% 25%). Dos no son una
# calibración: ver la nota de arriba sobre en qué se parece esto a la tabla y
# en qué no.
CORONILLA = 0.35
# Una cara que mide menos de esto respecto a la mayor es alguien del fondo, y
# encuadrar por el fondo es peor que no encuadrar.
FONDO = 0.45


def _detectar(gris, ancho, alto):
    """Las cuatro pasadas. La cuarta es la de perfil sobre la imagen
    espejada, que es como se detecta un perfil mirando al otro lado."""
    base = os.path.join(cv2.data.haarcascades, '')
    cajas = []
    minimo = max(24, int(min(ancho, alto) * 0.02))
    for intento, (escala, vecinos) in enumerate([(1.1, 5), (1.05, 3)]):
        for nombre in CASCADAS:
            c = cv2.CascadeClassifier(base + nombre)
            for (x, y, w, h) in c.detectMultiScale(gris, escala, vecinos, minSize=(minimo, minimo)):
                cajas.append((int(x), int(y), int(w), int(h)))
        espejo = cv2.flip(gris, 1)
        c = cv2.CascadeClassifier(base + CASCADAS[2])
        for (x, y, w, h) in c.detectMultiScale(espejo, escala, vecinos, minSize=(minimo, minimo)):
            cajas.append((int(ancho - x - w), int(y), int(w), int(h)))
        if cajas:
            # La segunda pasada solo se hace si la primera no encontró nada:
            # bajar los vecinos con caras ya encontradas solo añade ruido.
            break
    return cajas


def _fusionar(cajas):
    """Las cascadas encuentran la misma cara varias veces. Dos cajas que se
    solapan de verdad son una sola, y su caja es la media de las dos."""
    fusionadas = []
    for caja in sorted(cajas, key=lambda c: -c[2] * c[3]):
        for i, otra in enumerate(fusionadas):
            if _solapan(caja, otra) > 0.3:
                fusionadas[i] = tuple(round((a + b) / 2) for a, b in zip(caja, otra))
                break
        else:
            fusionadas.append(caja)
    return fusionadas


def _solapan(a, b):
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    x = max(0, min(ax + aw, bx + bw) - max(ax, bx))
    y = max(0, min(ay + ah, by + bh) - max(ay, by))
    interseccion = x * y
    union = aw * ah + bw * bh - interseccion
    return interseccion / union if union else 0.0


def medir(ruta):
    """Devuelve '<x>% <y>%', o None si en esta foto no hay ninguna cara de la
    que fiarse (una espalda, un detalle, una sala vacía): ésas se quedan con
    el 50% 50% del navegador, que para ellas es lo correcto."""
    imagen = cv2.imread(ruta)
    if imagen is None:
        return None
    alto, ancho = imagen.shape[:2]
    gris = cv2.equalizeHist(cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY))
    cajas = _fusionar(_detectar(gris, ancho, alto))
    if not cajas:
        return None
    mayor = max(c[2] for c in cajas)
    cajas = [c for c in cajas if c[2] >= mayor * FONDO]
    alta = min(cajas, key=lambda c: c[1])
    x, y, w, h = alta
    cx = (x + w / 2) / ancho * 100
    cy = (y - h * CORONILLA) / alto * 100
    return f'{round(min(100, max(0, cx)))}% {round(min(100, max(0, cy)))}%'


def _tabla_publicada():
    import re
    texto = open('content/focus-points.ts', encoding='utf-8').read()
    return dict(re.findall(r"'(/images/[^']+)': '([^']+)'", texto))


def _clave(ruta):
    return '/' + os.path.relpath(ruta, RAIZ_PUBLICA).replace(os.sep, '/')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('carpeta', nargs='?')
    ap.add_argument('--comprobar', action='store_true')
    args = ap.parse_args()

    if args.comprobar:
        tabla = _tabla_publicada()
        iguales = cerca = distintos = perdidos = 0
        for clave, esperado in sorted(tabla.items()):
            ruta = os.path.join(RAIZ_PUBLICA, clave.lstrip('/'))
            if not os.path.exists(ruta):
                continue
            obtenido = medir(ruta)
            if obtenido is None:
                perdidos += 1
            elif obtenido == esperado:
                iguales += 1
            else:
                ex, ey = (int(v.rstrip('%')) for v in esperado.split())
                ox, oy = (int(v.rstrip('%')) for v in obtenido.split())
                if abs(ex - ox) <= 3 and abs(ey - oy) <= 3:
                    cerca += 1
                else:
                    distintos += 1
                    print(f'  {clave}: tabla {esperado}  ahora {obtenido}')
        print(f'iguales {iguales}  a <=3 puntos {cerca}  distintos {distintos}  sin cara {perdidos}')
        return

    if not args.carpeta:
        ap.error('hace falta una carpeta, o --comprobar')
    for nombre in sorted(os.listdir(args.carpeta)):
        if not nombre.endswith('.webp'):
            continue
        ruta = os.path.join(args.carpeta, nombre)
        valor = medir(ruta)
        if valor:
            print(f"  '{_clave(ruta)}': '{valor}',")
        else:
            print(f'  // {_clave(ruta)}: sin cara de la que fiarse', file=sys.stderr)


if __name__ == '__main__':
    main()
