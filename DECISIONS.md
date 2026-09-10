# DECISIONS.md — JapanWorld Toys

## Paleta de colores
- **Rojo primario**: `#E10600` — rojo japonés/manga saturado, usado en CTAs y acentos
- **Rojo oscuro**: `#A30400` — hover states, sombras, degradados
- **Negro**: `#0E0E0F` — texto principal, header alternativo
- **Blanco**: `#FFFFFF` — fondos limpios
- **Off-white**: `#F7F5F3` — fondos de secciones alternas
- **Gold accent**: `#FFC700` — badges "Exclusivo", "Preventa"
- **Gray secundario**: `#6B7280` — texto secundario, metadata

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Prisma + PostgreSQL (Docker)
- Zustand (carrito, persist en localStorage)
- Framer Motion (animaciones)
- Auth.js (autenticación)
- Mercado Pago SDK (pagos)
- Lucide React (iconos)
- class-variance-authority + clsx + tailwind-merge (utilidades CSS)
- Recharts (gráficos admin)

## Decisiones de arquitectura
- **Docker multi-service**: PostgreSQL + Next.js en docker-compose
- **Categorías jerárquicas**: modelo de self-relation en Category (parent/children)
- **Franchise como entidad separada**: permite landing pages por anime y filtros cruzados
- **Carrito dual**: localStorage para guests, DB para logueados (sincronizar al login)
- **Precios mayoristas**: campo separado en Product, visible solo si rol=mayorista
- **Badges de estado**: ACTIVO, PREVENTA, PROXIMAMENTE, AGOTADO, DESCONTINUADO
- **SEO**: SSR/ISR en PDP y categorías, schema.org generado automáticamente
- **Legal**: arrepentimiento de compra obligatorio (Res. 424/2020)

## Naming conventions
- Slugs en español, lowercase, sin tildes, separados por guiones
- Componentes en PascalCase (ProductCard, HeroCarousel)
- Utilidades en camelCase (formatPrice, cn)
- Archivos CSS con .module.css o Tailwind utility classes

## CSS
- Custom properties en `:root` para todos los tokens
- Tailwind v4 con `@theme` para extender con los tokens JW
- Responsive breakpoints: sm(640), md(768), lg(1024), xl(1280), 2xl(1536)

## Placeholder strategy
- Logo: imagen real del archivo "logo japan world toys.png"
- Productos: 2 Funko Pops reales (Warner Bros Horror Mystery + Xena Warrior Princess)
- Seed con categorías y productos reales del catálogo conocido
