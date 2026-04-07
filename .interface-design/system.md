# Interface Design System: Groot-Type

## Core Direction
**Concept:** Centro de Control Técnico (Technical Control Center).
**Feel:** Preciso, industrial-moderno, eficiente. El diseño emerge de la estructura y la jerarquía de datos.
**Variant - Fintech Ledger:** Aplicado a módulos financieros (Monedas, Facturación). Introduce una tipografía más audaz (`Space Grotesk`) y composiciones editoriales para enfatizar el valor y la precisión.

## Depth & Surfaces
- **Strategy:** Subtle Layering / Borders-only.
- **Base Surface:** `theme.bg`
- **Elevated Surface:** `theme.bg2` (para inputs, cajas de iconos y hover states).
- **Glassmorphism:** Uso de `backdrop-filter: blur(10px)` con fondos semi-transparentes (`CC` o `80` hex) para buscadores y modales.
- **Borders:** 1px solid con opacidad reducida (`33` o `22` hex) sobre `theme.bg3`.
- **Shadows:** Evitar sombras pesadas. Usar `box-shadow: 0 40px 80px rgba(0,0,0,0.05)` para contenedores de grandes conjuntos de datos (LedgerCard).

## Spacing & Alignment
- **Base Unit:** 4px.
- **Scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 60.
- **Page Padding:** 40px para desktops, 24px para móviles.
- **Editorial Header:** 60px de margen inferior con borde de separación.

## Typography
- **Display (Fintech Ledger):** `Space Grotesk`. Headlines (800, letter-spacing -2px, size 3.5rem).
- **Headlines (Standard):** Weight 800, letter-spacing -0.02em.
- **Group Headers:** Weight 700, uppercase, letter-spacing 0.1em, size 0.85rem.
- **Labels/Body:** Inter o System Sans.
- **Data/Symbols:** `JetBrains Mono`. Para valores numéricos, códigos ISO, SKUs o IDs técnicos.

## Component Patterns
### ModuleCard (Navigation)
- **Radius:** 16px.
- **Interaction:** `translateY(-2px)` en hover + cambio de borde a `theme.bg4` (acentuado).
- **Signature:** Icono de flecha (`FiChevronRight`) con opacidad variable (0.3 -> 1) en hover.

### LedgerCard (Data Container)
- **Structure:** Contenedor con borde sutil y sombra profunda que agrupa tablas y filtros.
- **Feel:** Sensación de "Libro Mayor" físico traducido a digital.

### StatsStrip / StatItem
- **Layout:** Grid de 200px min-width.
- **Style:** Fondos ligeros, etiquetas en monoespaciado y valores en tipografía display.

### IconBox
- **Radius:** 12px.
- **Background:** `theme.bg2`.
- **Border:** 1px solid `theme.bg3`22.
