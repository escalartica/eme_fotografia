"""Deshace la PARTE DE COLOR del etalonado de la casa sobre un fichero YA
publicado, para los casos en los que no queda el original de cámara.

POR QUÉ EXISTE. `grade-photos.py` hace cinco cosas: curva de tono, viraje
partido (altas luces cálidas, sombras frías), un +2% de saturación, viñeta y
grano. En una toma a contraluz sobre fondo blanco --el retrato de la novia con
el ramo de Eva y Rafa-- las tres del medio se pelean con la fotografía en vez
de ayudarla: el viraje convierte la calidez que la toma YA traía en un tinte
anaranjado, la saturación lo subraya, y la viñeta cierra las esquinas de un
fondo que debería ser blanco liso. El estudio lo describió como «demasiado
rojiza». Es el mismo problema que content/mosaic.ts documenta para su casilla
`grade: 'soft'`, sólo que allí se corrige desde el CSS y aquí hay que corregir
el fichero.

QUÉ DESHACE Y QUÉ NO. Viñeta, saturación y viraje, que son las tres
operaciones invertibles exactamente. La curva de tono y el grano se quedan:
son el «papel» de este sitio, no son lo que chirría, y además no se pueden
invertir sin inventar información.

EL ORDEN IMPORTA, y es el inverso del de `grade-photos.py`: viñeta, luego
saturación, luego viraje. Si se deshace el viraje primero, sus pesos `hi`/`sh`
se calculan sobre una imagen que todavía lleva la viñeta encima --hasta un 16%
más oscura en las esquinas--, la luminancia sale subestimada y la corrección
del canal azul se equivoca en unos dos niveles de 255 justo donde más se nota,
que es el fondo.

EL ÚNICO ERROR QUE QUEDA es estimar la luminancia del viraje sobre la imagen
ya virada en vez de sobre la de antes. El viraje mueve como mucho un 5,85% (el
canal azul en las altas luces: 0,935 atenuado por 0,9), así que es un error de
segundo orden.

EL RECUENTO DE PÍXELES RECORTADOS QUE IMPRIME NO ES ADORNO. Quitar el viraje
DIVIDE, o sea que sube valores, y un fondo que ya estaba casi en blanco se
sale por arriba. En el retrato del ramo eso es un 7,7% de muestras, todas en
la pared: no se pierde detalle porque ahí no había ninguno. Si sale un número
así en una fotografía con altas luces que sí importan (un vestido al sol), hay
que bajar `--tinte` en vez de aceptarlo.

Uso: python scripts/desetalonar.py <entrada.webp> <salida.webp> [--tinte 1.0]
     [--vineta 1.0] [--calidad 90]
"""
import argparse
import numpy as np
from PIL import Image

# Los mismos valores que aplica grade-photos.py. Si cambian allí, cambian aquí.
WARM = np.array([1.000, 0.980, 0.935], np.float32)
COOL = np.array([0.955, 0.985, 1.055], np.float32)
SAT = 1.02


def _lum(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722


def desvinetar(a, fuerza=1.0):
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / np.sqrt(2)
    vig = 1.0 - 0.16 * np.clip(r - 0.30, 0, 1) ** 1.5 / (0.70 ** 1.5)
    return a / (1.0 - (1.0 - vig) * fuerza)[..., None]


def dessaturar(a, fuerza=1.0):
    l = _lum(a)[..., None]
    return l + (a - l) / (1.0 + (SAT - 1.0) * fuerza)


def desvirar(a, fuerza=1.0):
    l = _lum(a)[..., None]
    hi = np.clip(l, 0, 1) ** 2.0
    sh = np.clip(1.0 - l, 0, 1) ** 2.0
    m = 1.0 + (WARM - 1.0) * hi * 0.9 + (COOL - 1.0) * sh * 0.9
    return a / (1.0 + (m - 1.0) * fuerza)


def es_bn(im, umbral=12.0):
    """La misma prueba que usa grade-photos.py para saltarse el viraje."""
    hsv = np.asarray(im.convert('RGB').resize((64, 64)).convert('HSV'), np.float32)
    return float(hsv[..., 1].mean()) < umbral


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('dst')
    ap.add_argument('--tinte', type=float, default=1.0)
    ap.add_argument('--vineta', type=float, default=1.0)
    ap.add_argument('--calidad', type=int, default=90)
    args = ap.parse_args()
    # Fuera de [0,1] el divisor de cualquiera de las dos inversiones cambia de
    # signo (la viñeta a partir de 6,25, el viraje a partir de 15,4) y lo que
    # sale son inf y nan que `clip` no limpia y `uint8` convierte en basura.
    for nombre, valor in (('--tinte', args.tinte), ('--vineta', args.vineta)):
        if not 0.0 <= valor <= 1.0:
            raise SystemExit(f'{nombre} tiene que estar entre 0 y 1 (recibido {valor})')

    im = Image.open(args.src).convert('RGB')
    # En un blanco y negro grade-photos.py NO aplica ni viraje ni saturación,
    # así que deshacerlos aquí sería AÑADIR un tinte a una foto que no lo
    # tiene. La viñeta sí se le aplica, y sí se deshace.
    bn = es_bn(im)
    a = np.asarray(im, np.float32) / 255.0
    a = desvinetar(a, args.vineta)
    if not bn:
        a = dessaturar(a, args.tinte)
        a = desvirar(a, args.tinte)
    recortados = int((a > 1.0).sum() + (a < 0.0).sum())
    out = Image.fromarray((np.clip(a, 0, 1) * 255.0 + 0.5).astype(np.uint8), 'RGB')
    out.save(args.dst, 'WEBP', quality=args.calidad, method=6)
    print(f'{args.dst} {out.size} bn={bn} '
          f'recortados={recortados} ({100 * recortados / a.size:.3f}%)')
