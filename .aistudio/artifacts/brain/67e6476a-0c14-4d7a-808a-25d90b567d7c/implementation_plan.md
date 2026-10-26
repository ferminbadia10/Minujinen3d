# Pabellón Minujín: Sala de Arte Contemporáneo & Happenings (Pestaña Única)

Reconstrucción integral desde cero de la aplicación web inmersiva para presentar la obra de **Marta Minujín** en una **sala de exposición de arte contemporáneo** unificada, sofisticada y libre de clichés genéricos de IA, manteniendo la arquitectura de Three.js a 60 FPS, los sensores móviles (giroscopio 360°, acelerómetro, micrófono, cámara AR opcional y hápticos) y la escultura 3D cinética de **"ARTE ARTE ARTE"**.

---

## Decisiones Críticas y Confirmaciones del Usuario

> [!IMPORTANT]
> A partir de las respuestas de clarificación, se define la nueva dirección arquitectónica y curatorial:

- **Concepto Espacial (Confirmado)**: **Sala de exposición contemporánea con colchones y cuadros flotantes**. Un espacio museístico diáfano con piso pulido de hormigón/resina blanca y acentos de goma, paredes laterales con los colchones escultóricos rayados (*Minujinda*) y una galería circular de cuadros flotantes en gran formato con las obras originales del documento.
- **Exploración en Pestaña Única (Confirmado)**: **Rotación libre 360° con ficha curatorial al enfocar cada obra**. Navegación sin pestañas divididas: el usuario recorre la galería con el giroscopio o arrastre táctil; al tocar o centrar la mirada en un cuadro, la cámara realiza una transición suave (*lerp cinematic focus*) y despliega una ficha técnica curatorial (título, año, técnica, dimensiones y notas históricas).
- **Presencia del Texto 3D (Confirmado)**: **Objeto cinético suspendido que gira y proyecta sombras pop art**. En el centro del atrio superior cuelga la escultura tridimensional extruida de **"ARTE ARTE ARTE"**, rotando suavemente en 3D, reaccionando con pulsos cromáticos a la voz del usuario y proyectando sombras pop art.

---

## 1. Obras Curadas a Exhibir (Fuente: Documento SDD & Minujín)

La sala expone las 6 obras y registros clave del catálogo:

1. **Energía Multidireccional (2016)**
   - *Técnica*: Acrílico sobre tiras de lienzo cortadas a mano pegadas sobre tela.
   - *Dimensiones*: 100 x 100 cm.
   - *Concepto*: El ritmo vibratorio de las cintas de color que se cruzan y crean una tensión espacial infinita.
2. **Laberinto Minujinda (1985)**
   - *Técnica*: Pintura acrílica sobre tela / colchones rellenos.
   - *Dimensiones*: 80 x 200 cm.
   - *Concepto*: Ondulaciones cromáticas y psicodelia blanda inspirada en los happenings del Instituto Di Tella.
3. **Sin Título (2013)**
   - *Técnica*: Técnica mixta sobre tela.
   - *Dimensiones*: 30 x 30 cm.
   - *Concepto*: Tiras superpuestas con matriz geométrica en diagonal y alto contraste pop.
4. **Laberinto Minujinda (Franja Vertical, 1985)**
   - *Técnica*: Acrílico sobre tela.
   - *Dimensiones*: 200 x 80 cm.
   - *Concepto*: Patrones ópticos que desafían la percepción de verticalidad y escala.
5. **Registro de Happening: Arte Mediático & Esculturas Blandas**
   - *Registro Fotográfico Documental*: Marta Minujín en el laberinto de colchones y su indumentaria flúor de mamelucos rayados.
6. **Los Icónicos Anteojos de Sol Espejados**
   - *Instalación Escultórica*: El tótem pop de la mirada transformadora del artista sobre el espectador.

---

## 2. Experiencia de Usuario & Diseño Visual (Anti-AI Slop)

### Espacio Arquitectónico
- **Pabellón de Galería**: Techo con claraboyas cenitales de luz suave y rieles de iluminación museográfica (*spotlights* cálidos focalizados en cada cuadro flotante).
- **Piso de Resina con Reflejos Sutiles**: Refleja suavemente la escultura cinética central y los cuadros flotantes.
- **Pared de Colchones**: Estructura perimetral con los módulos almohadillados rayados flúor, rindiendo homenaje a *La Menesunda* y las galerías del Di Tella.
- **Escultura Cinética Central**: El texto 3D *"ARTE ARTE ARTE"* levita en el centro, girando lentamente a baja velocidad con un cable de tensión estético de galería.

### Controles Mínimos y Flujo en Pestaña Única
- **Sin pantallas secundarias ni menús laberínticos**: Toda la experiencia vive en una sola pantalla inmersiva.
- **Top Bar**: Título discreto en tipografía editorial sans (*"Marta Minujín — Sala de Arte Contemporáneo"*), sensor de giro activo y botón de audio.
- **Ficha Curatorial Desplegable**: Cuando el usuario toca una obra en el espacio 3D, una tarjeta editorial lateral/inferior limpia (sin bordes de píldora de IA, tipografía humanista nítida, datos de ficha de museo) se desliza con la información de la obra y botón de volver o recorrer la siguiente.
- **Interacción de Sensores**:
  - *Giroscopio / Acelerómetro*: Mover físicamente el teléfono orienta la mirada 360° en la sala con paralaje volumétrico real.
  - *Micrófono*: Al hablar o exclamar *"Arte, arte, arte"*, la escultura 3D y las luces cenitales emiten un pulso cromático flúor con leve vibración háptica.
  - *Cámara (Modo Ventana AR)*: Botón discreto para abrir un ventanal translúcido de la galería hacia la cámara real del usuario.

---

## 3. Arquitectura Técnica en Three.js

```
┌────────────────────────────────────────────────────────┐
│                   SINGLE-VIEW HUD                      │
│   - Header Curatorial Editorial                        │
│   - Ficha Técnica de la Obra Activa (Deslizable)       │
│   - Controles de Visita (Giroscopio / Audio / Reset)   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              SALA CONTEMPORÁNEA THREE.JS               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Galería Circular de Cuadros Flotantes (6 Obras)  │  │
│  │ (Marcos PBR, sombras de contacto, canvas HQ)     │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Escultura Central Cinética 3D "ARTE ARTE ARTE"   │  │
│  │ (ExtrudeGeometry, rotación suave, luz puntual)   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Pared Escultórica de Colchones Minujinda         │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Arquitectura de Galería (Piso resina, focos)     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

- **Renderizado de Cuadros en Alta Fidelidad**: Cuadros modelados con marcos minimalistas de galería (madera laqueada negra/blanca, bisel fino, lienzo con textura acrílica de alta resolución basada en las obras originales).
- **Raycasting Óptico Suave**: Detección de toque en pantallas táctiles o clic en escritorio para centrar suavemente la cámara sobre la obra inspeccionada con animación de amortiguación `damp`.
- **Rendimiento Móvil**: 60 FPS garantizados, `pixelRatio` acotado a 2.0, reutilización estricta de geometrías y materiales, cero recolección de basura (*GC*) en el render loop.

---

## 4. Pasos de Ejecución
1. **Reemplazo Integral de `SceneManager.ts`**:
   - Construir la sala contemporánea (iluminación de focos cálidos de galería, muro perimetral de colchones acolchados, techo abovedado Minujín).
   - Ensamblar los cuadros flotantes con marcos de galería y lienzos texturizados basados fielmente en las obras de Minujín.
   - Instanciar la escultura cinética 3D de *"ARTE ARTE ARTE"*.
2. **Suelo Animado de Mar de Nubes PNG con Parallax Lento**:
   - Se removieron por completo todas las geometrías y partículas 3D de nubes que generaban oclusión visual.
   - Se implementó un sistema de doble capa horizontal en el suelo (`y = 0` y `y = 0.012`) utilizando la textura PNG de alta resolución de nubes suaves.
   - Ambas capas se desplazan continuamente a velocidades y ángulos opuestos (`(0.012, 0.007)` y `(-0.008, 0.011)` UV/s), generando un efecto visual orgánico de olas y nubes ondulantes en cámara lenta sin saltos bruscos.
   - La capa superior translúcida posee una sutil ondulación vertical milimétrica (respiración suave de ±6mm), creando la sensación inmersiva de estar flotando o suspendido sobre un mar de nubes vivas.
   - Al ser planos horizontales en el suelo, garantizan 100% de visibilidad despejada hacia las 6 obras y el monumento tridimensional.
3. **Sistema de Enfoque Curatorial & Raycasting**:
   - Implementar el desplazamiento cinemático suave hacia la obra seleccionada y retorno a la vista panorámica general.
4. **Verificación & Optimización**:
   - Compilación exitosa (`compile_applet`), TypeScript verificado sin errores (`npm run lint` / `tsc --noEmit`) y rendimiento fluido a 60 FPS.
