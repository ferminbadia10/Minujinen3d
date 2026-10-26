export interface Artwork {
  id: string;
  title: string;
  year: string;
  medium: string;
  dimensions: string;
  description: string;
  curatorialNote: string;
  aspectRatio: number; // width / height
  colorAccent: string;
}

export const MINUJIN_ARTWORKS: Artwork[] = [
  {
    id: 'energia_multidireccional',
    title: 'Energía multidireccional',
    year: '2016',
    medium: 'Acrílico sobre tiras de lienzo cortadas a mano pegadas sobre tela',
    dimensions: '100 x 100 cm',
    description: 'Composición cinética de cintas de tela superpuestas en múltiples ángulos, generando una vibración visual pura y tensión espacial.',
    curatorialNote: 'Esta obra condensa la madurez geométrica de Minujín: cada tira es cortada manualmente y encolada con acrílico flúor, evocando la energía del movimiento perpetuo.',
    aspectRatio: 1.0,
    colorAccent: '#FF007F',
  },
  {
    id: 'laberinto_minujinda_1985',
    title: 'Laberinto Minujinda',
    year: '1985',
    medium: 'Pintura acrílica sobre tela y módulos de colchones',
    dimensions: '80 x 200 cm',
    description: 'Franjas ondulantes psicodélicas que reinterpretan la estética blanda y envolvente de sus célebres laberintos multisensoriales.',
    curatorialNote: 'El colchón representa para Minujín el ciclo vital humano: donde nacemos, soñamos y morimos. Las ondas de color transforman el objeto cotidiano en experiencia estética.',
    aspectRatio: 0.4,
    colorAccent: '#FAFF00',
  },
  {
    id: 'sin_titulo_2013',
    title: 'Sin título (Entramado)',
    year: '2013',
    medium: 'Técnica mixta sobre tela',
    dimensions: '30 x 30 cm',
    description: 'Micro-universo de bandas multicolores cruzadas en diagonales dinámicas, con saturación cromática pop y ritmo sincopado.',
    curatorialNote: 'Una pieza íntima donde las capas de color crean profundidad óptica tridimensional mediante franjas de pintura industrial y tintas saturadas.',
    aspectRatio: 1.0,
    colorAccent: '#00F0FF',
  },
  {
    id: 'laberinto_minujinda_vertical',
    title: 'Laberinto Minujinda (Franja Vertical)',
    year: '1985',
    medium: 'Acrílico sobre tela',
    dimensions: '200 x 80 cm',
    description: 'Estructura vertical monumental de ritmos ondulantes en zigzag, jugando con la ilusión óptica y el arte óptico (Op Art) latinoamericano.',
    curatorialNote: 'Instalada como columna cromática, la pieza altera la percepción del espacio arquitectónico tradicional invitando al espectador a una inmersión sensorial.',
    aspectRatio: 0.4,
    colorAccent: '#FF5500',
  },
  {
    id: 'arte_mediatico_happening',
    title: 'Arte Mediático & Happenings',
    year: '1965 – 1985',
    medium: 'Registro de acción performática e instalación inmersiva',
    dimensions: 'Registro documental de sala',
    description: 'Fotografía documental del universo de happenings de Marta Minujín, mamelucos de rayas fluorescentes e instalaciones de arte participativo.',
    curatorialNote: 'Pionera del arte conceptual y el happening en el Instituto Di Tella, Minujín proclama que el arte debe ser vivido por el cuerpo entero y no contemplado pasivamente.',
    aspectRatio: 1.25,
    colorAccent: '#8B00FF',
  },
  {
    id: 'iconicos_anteojos',
    title: 'La Mirada Pop: Anteojos Espejados',
    year: 'Instalación Contemporánea',
    medium: 'Escultura espejada policromática y esmalte industrial',
    dimensions: 'Escala monumental de sala',
    description: 'El emblema identitario de Marta Minujín: una lente caleidoscópica que refracta la realidad en fragmentos de color flúor.',
    curatorialNote: 'Los anteojos no son mero accesorio: son el prisma a través del cual la artista filtra el mundo para proclamar su eterno manifiesto: ¡ARTE, ARTE, ARTE!',
    aspectRatio: 1.6,
    colorAccent: '#00FF66',
  },
];
