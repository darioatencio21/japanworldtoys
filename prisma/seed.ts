import { PrismaClient, Rol, EstadoProducto, TipoCupon } from "@prisma/client";
import { hash } from "crypto";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Seeding JapanWorld Toys...");

  // ─── CATEGORÍAS ───────────────────────────────
  const catFiguras = await prisma.category.create({
    data: { nombre: "Figuras", slug: "figuras", orden: 1 },
  });

  const subFunkos = await prisma.category.create({
    data: { nombre: "Funkos", slug: "funkos", parentId: catFiguras.id, orden: 1 },
  });

  const subSHFiguarts = await prisma.category.create({
    data: { nombre: "S.H.Figuarts", slug: "sh-figuarts", parentId: catFiguras.id, orden: 2 },
  });

  const subMcFarlane = await prisma.category.create({
    data: { nombre: "McFarlane", slug: "mcfarlane", parentId: catFiguras.id, orden: 3 },
  });

  const subBanpresto = await prisma.category.create({
    data: { nombre: "Banpresto / Bandai", slug: "banpresto-bandai", parentId: catFiguras.id, orden: 4 },
  });

  const catComics = await prisma.category.create({
    data: { nombre: "Comics", slug: "comics", orden: 2 },
  });

  const catMangas = await prisma.category.create({
    data: { nombre: "Mangas", slug: "mangas", orden: 3 },
  });

  const catSanrio = await prisma.category.create({
    data: { nombre: "Sanrio", slug: "sanrio", orden: 4 },
  });

  const catPeluches = await prisma.category.create({
    data: { nombre: "Peluches", slug: "peluches", orden: 5 },
  });

  const catVideojuegos = await prisma.category.create({
    data: { nombre: "Videojuegos", slug: "videojuegos", orden: 6 },
  });

  console.log("✅ Categorías creadas");

  // ─── MARCAS ───────────────────────────────────
  const marcaFunko = await prisma.brand.create({
    data: { nombre: "Funko", slug: "funko" },
  });

  const marcaBandai = await prisma.brand.create({
    data: { nombre: "Bandai", slug: "bandai" },
  });

  const marcaMcFarlane = await prisma.brand.create({
    data: { nombre: "McFarlane Toys", slug: "mcfarlane-toys" },
  });

  const marcaBanpresto = await prisma.brand.create({
    data: { nombre: "Banpresto", slug: "banpresto" },
  });

  const marcaSanrio = await prisma.brand.create({
    data: { nombre: "Sanrio", slug: "sanrio" },
  });

  console.log("✅ Marcas creadas");

  // ─── FRANQUICIAS ──────────────────────────────
  const franchises = [
    { nombre: "One Piece", slug: "one-piece", color: "#FF4500", mensaje: "Mugis, Yonkous y aventuras legendarias en alta mar" },
    { nombre: "Naruto", slug: "naruto", color: "#FF6B00", mensaje: "El ninja más famoso de Konoha y su gran camino" },
    { nombre: "Dragon Ball", slug: "dragon-ball", color: "#FFD700", mensaje: "La historia que todo coleccionista quiere tener" },
    { nombre: "Demon Slayer", slug: "demon-slayer", color: "#1A1A2E", mensaje: "Figuras exclusivas de Kimetsu no Yaiba — Tanjiro, Nezuko, Zenitsu y más" },
    { nombre: "Jujutsu Kaisen", slug: "jujutsu-kaisen", color: "#2D0A3E", mensaje: "Maldiciones, hechiceros y el mundo de Gojo" },
    { nombre: "Attack on Titan", slug: "attack-on-titan", color: "#8B0000", mensaje: "La batalla por la humanidad contra los titanes" },
    { nombre: "My Hero Academia", slug: "my-hero-academia", color: "#1B5E20", mensaje: "Héroes con quirk para formar tu propia academia" },
    { nombre: "Sanrio", slug: "sanrio-characters", color: "#FFB6C1", mensaje: "Hello Kitty, Kuromi y todos los personajes kawaii" },
    { nombre: "Warner Bros", slug: "warner-bros", color: "#1C1C1C", mensaje: "Batman, Superman y los íconos de DC en Figuarts" },
    { nombre: "Xena", slug: "xena", color: "#8B4513", mensaje: "La princesa guerrera en figuras de colección" },
  ];

  const createdFranchises: Record<string, string> = {};
  for (const f of franchises) {
    const created = await prisma.franchise.create({ data: f });
    createdFranchises[f.slug] = created.id;
  }

  console.log("✅ Franquicias creadas");

  // ─── USUARIO ADMIN ────────────────────────────
  // Password: admin123 (hash SHA-256 para demo, en prod usar bcrypt)
  const adminHash = require("crypto")
    .createHash("sha256")
    .update("admin123")
    .digest("hex");

  const admin = await prisma.user.create({
    data: {
      nombre: "Admin JapanWorld",
      email: "admin@japanworldtoys.com",
      passwordHash: adminHash,
      rol: Rol.SUPERADMIN,
      telefono: "+543813652079",
    },
  });

  const clienteDemo = await prisma.user.create({
    data: {
      nombre: "Cliente Demo",
      email: "cliente@demo.com",
      passwordHash: adminHash,
      rol: Rol.CLIENTE,
    },
  });

  console.log("✅ Usuarios creados");

  // ─── PRODUCTOS (con datos reales conocidos) ────
  const prod1 = await prisma.product.create({
    data: {
      nombre: "Pop! Mystery Warner Bros. Horror",
      slug: "pop-mystery-warner-bros-horror",
      descripcion:
        "Figura Funko Pop! Mystery de Warner Bros. Horror. Figura coleccionable de edición misteriosa con personajes de las franquicias de terror de Warner Bros. Altura aproximada: 10cm. Vinyl figure.",
      sku: "FUNKO-MYST-WBH-001",
      precio: 12500.0,
      precioComparativo: 15000.0,
      stock: 8,
      categoriaId: subFunkos.id,
      marcaId: marcaFunko.id,
      estado: EstadoProducto.ACTIVO,
      destacado: true,
      metaTitle: "Pop! Mystery Warner Bros. Horror | JapanWorld Toys",
      metaDescription: "Figura Funko Pop! Mystery Warner Bros. Horror. Comprala en JapanWorld Toys, la gran comiquería de Tucumán.",
      imagenes: {
        create: [
          { url: "/images/products/mystery-warner-horror-1.webp", alt: "Pop Mystery Warner Bros Horror - Vista 1", orden: 0, esPrincipal: true },
          { url: "/images/products/mystery-warner-horror-2.webp", alt: "Pop Mystery Warner Bros Horror - Vista 2", orden: 1 },
        ],
      },
      franquicias: {
        connect: [{ id: createdFranchises["warner-bros"] }],
      },
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      nombre: "Xena Warrior Princess Exclusive Mini Button",
      slug: "xena-warrior-princess-exclusive-mini-button",
      descripcion:
        "Figura coleccionable Xena: Warrior Princess Exclusive Mini Button por Funko. Edición exclusiva de la icónica guerrera. Ideal para coleccionistas de figuras y fanáticos de la serie.",
      sku: "FUNKO-XENA-MB-001",
      precio: 9800.0,
      stock: 5,
      categoriaId: subFunkos.id,
      marcaId: marcaFunko.id,
      estado: EstadoProducto.ACTIVO,
      destacado: true,
      metaTitle: "Xena Warrior Princess Exclusive Mini Button | JapanWorld Toys",
      metaDescription: "Figura Funko Xena Warrior Princess Exclusive Mini Button. Edición exclusiva disponible en JapanWorld Toys.",
      imagenes: {
        create: [
          { url: "/images/products/xena-mini-button-1.webp", alt: "Xena Warrior Princess Mini Button - Vista 1", orden: 0, esPrincipal: true },
          { url: "/images/products/xena-mini-button-2.webp", alt: "Xena Warrior Princess Mini Button - Vista 2", orden: 1 },
        ],
      },
      franquicias: {
        connect: [{ id: createdFranchises["xena"] }],
      },
    },
  });

  // Productos de ejemplo adicionales (placeholder)
  const prod3 = await prisma.product.create({
    data: {
      nombre: "Figura Monkey D. Luffy - Gear 5",
      slug: "figura-monkey-d-luffy-gear-5",
      descripcion: "Figura Banpresto de Monkey D. Luffy en su forma Gear 5 de One Piece. Altura: 23cm. PVC de alta calidad.",
      sku: "BAN-OP-LF5-001",
      precio: 28500.0,
      precioComparativo: 32000.0,
      stock: 3,
      categoriaId: subBanpresto.id,
      marcaId: marcaBanpresto.id,
      estado: EstadoProducto.PREVENTA,
      destacado: true,
      metaTitle: "Figura Luffy Gear 5 One Piece | JapanWorld Toys",
      imagenes: {
        create: [
          { url: "/images/placeholders/figure-placeholder.svg", alt: "Figura Luffy Gear 5", orden: 0, esPrincipal: true },
        ],
      },
      franquicias: {
        connect: [{ id: createdFranchises["one-piece"] }],
      },
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      nombre: "Pop! Naruto Uzumaki (Six Paths)",
      slug: "pop-naruto-uzumaki-six-paths",
      descripcion: "Funko Pop! de Naruto Uzumaki en modo Seis Caminos. Figura coleccionable de la saga Naruto Shippuden.",
      sku: "FUNKO-NAR-SP-001",
      precio: 14200.0,
      stock: 0,
      categoriaId: subFunkos.id,
      marcaId: marcaFunko.id,
      estado: EstadoProducto.AGOTADO,
      destacado: false,
      metaTitle: "Pop! Naruto Uzumaki Six Paths | JapanWorld Toys",
      imagenes: {
        create: [
          { url: "/images/placeholders/figure-placeholder.svg", alt: "Pop Naruto Six Paths", orden: 0, esPrincipal: true },
        ],
      },
      franquicias: {
        connect: [{ id: createdFranchises["naruto"] }],
      },
    },
  });

  const prod5 = await prisma.product.create({
    data: {
      nombre: "Figura S.H.Figuarts Goku Ultra Instinct",
      slug: "sh-figuarts-goku-ultra-instinct",
      descripcion: "Figura articulada S.H.Figuarts de Goku en forma Ultra Instinct. Escala 1/12, alta movilidad y detalles excepcionales.",
      sku: "SHF-DB-UI-001",
      precio: 45000.0,
      precioComparativo: 52000.0,
      stock: 2,
      categoriaId: subSHFiguarts.id,
      marcaId: marcaBandai.id,
      estado: EstadoProducto.ACTIVO,
      destacado: true,
      metaTitle: "S.H.Figuarts Goku Ultra Instinct | JapanWorld Toys",
      imagenes: {
        create: [
          { url: "/images/placeholders/figure-placeholder.svg", alt: "S.H.Figuarts Goku Ultra Instinct", orden: 0, esPrincipal: true },
        ],
      },
      franquicias: {
        connect: [{ id: createdFranchises["dragon-ball"] }],
      },
    },
  });

  // Productos demo con 2 imágenes (vista previa al pasar el mouse)
  const demoProducts = [
    {
      nombre: "Pop! Harley Quinn (Arkham)", slug: "pop-harley-quinn-arkham",
      descripcion: "Figura Funko Pop! de Harley Quinn en su versión Arkham Knight. Vinyl figure coleccionable, altura aproximada 10cm. Producto de demostración.",
      sku: "FUNKO-HQ-ARK-001", precio: 14900.0, precioComparativo: 17500.0, stock: 12,
      categoriaId: subFunkos.id, marcaId: marcaFunko.id, estado: EstadoProducto.ACTIVO, destacado: true, esNovedad: true,
      metaTitle: "Pop! Harley Quinn Arkham | JapanWorld Toys",
      img: "pop-harley-quinn-arkham", imgAlt: "Pop! Harley Quinn Arkham", franquicia: null,
    },
    {
      nombre: "Pop! Batman (The Dark Knight)", slug: "pop-batman-dark-knight",
      descripcion: "Figura Funko Pop! de Batman según su aparición en The Dark Knight. Vinyl figure coleccionable de 10cm. Producto de demostración.",
      sku: "FUNKO-BM-DK-001", precio: 13800.0, precioComparativo: null, stock: 7,
      categoriaId: subFunkos.id, marcaId: marcaFunko.id, estado: EstadoProducto.ACTIVO, destacado: true, esNovedad: false,
      metaTitle: "Pop! Batman The Dark Knight | JapanWorld Toys",
      img: "pop-batman-dark-knight", imgAlt: "Pop! Batman The Dark Knight", franquicia: "warner-bros",
    },
    {
      nombre: "Figura Tanjiro Kamado Vol. 20", slug: "figura-tanjiro-kamado-vol-20",
      descripcion: "Figura Banpresto de Tanjiro Kamado de Kimetsu no Yaiba (Demon Slayer), Vol. 20. PVC de alta calidad, base incluida. Producto de demostración.",
      sku: "BAN-KNY-TJ20-001", precio: 22500.0, precioComparativo: 26000.0, stock: 4,
      categoriaId: subBanpresto.id, marcaId: marcaBanpresto.id, estado: EstadoProducto.ACTIVO, destacado: true, esNovedad: false,
      metaTitle: "Figura Tanjiro Kamado Vol. 20 | JapanWorld Toys",
      img: "figura-tanjiro-kamado", imgAlt: "Figura Tanjiro Kamado", franquicia: "demon-slayer",
    },
    {
      nombre: "S.H.Figuarts Vegeta Super Saiyan", slug: "shf-figuarts-vegeta-ssj",
      descripcion: "Figura articulada S.H.Figuarts de Vegeta Super Saiyan. Escala ~1/12 con accesorios y efectos intercambiables. Producto de demostración.",
      sku: "SHF-DB-VSSJ-001", precio: 48900.0, precioComparativo: 55000.0, stock: 2,
      categoriaId: subSHFiguarts.id, marcaId: marcaBandai.id, estado: EstadoProducto.ACTIVO, destacado: true, esNovedad: false,
      metaTitle: "S.H.Figuarts Vegeta Super Saiyan | JapanWorld Toys",
      img: "shf-vegeta-ssj", imgAlt: "S.H.Figuarts Vegeta Super Saiyan", franquicia: "dragon-ball",
    },
    {
      nombre: "One Piece Vol. 101", slug: "one-piece-vol-101",
      descripcion: "Manga One Piece Vol. 101 de Eiichiro Oda. Edición argentina. Producto de demostración.",
      sku: "MANGA-OP-101", precio: 3200.0, precioComparativo: null, stock: 20,
      categoriaId: catMangas.id, marcaId: null, estado: EstadoProducto.ACTIVO, destacado: true, esNovedad: true,
      metaTitle: "One Piece Vol. 101 | JapanWorld Toys",
      img: "manga-one-piece-101", imgAlt: "One Piece Vol. 101", franquicia: "one-piece",
    },
    {
      nombre: "Jujutsu Kaisen Vol. 19", slug: "jujutsu-kaisen-vol-19",
      descripcion: "Manga Jujutsu Kaisen Vol. 19 de Gege Akutami. Edición argentina. Producto de demostración.",
      sku: "MANGA-JJK-019", precio: 3400.0, precioComparativo: 3800.0, stock: 15,
      categoriaId: catMangas.id, marcaId: null, estado: EstadoProducto.ACTIVO, destacado: false, esNovedad: false,
      metaTitle: "Jujutsu Kaisen Vol. 19 | JapanWorld Toys",
      img: "manga-jujutsu-kaisen-19", imgAlt: "Jujutsu Kaisen Vol. 19", franquicia: "jujutsu-kaisen",
    },
    {
      nombre: "Comic Batman #1 Facsimile", slug: "comic-batman-facsimile-1",
      descripcion: "Comic Batman #1 (facsimile edition) de DC Comics. Réplica de la primera aparición. Producto de demostración.",
      sku: "COMIC-BM-FAC-001", precio: 6800.0, precioComparativo: 8500.0, stock: 6,
      categoriaId: catComics.id, marcaId: null, estado: EstadoProducto.ACTIVO, destacado: false, esNovedad: false,
      metaTitle: "Comic Batman #1 Facsimile | JapanWorld Toys",
      img: "comic-batman-facsimile", imgAlt: "Comic Batman #1 Facsimile", franquicia: "warner-bros",
    },
    {
      nombre: "Peluche Kuromi 25cm", slug: "peluche-kuromi-25cm",
      descripcion: "Peluche de Kuromi (Sanrio) de 25cm, material súper suave. Producto de demostración.",
      sku: "PLUCH-KRM-025", precio: 19800.0, precioComparativo: 23000.0, stock: 9,
      categoriaId: catPeluches.id, marcaId: marcaSanrio.id, estado: EstadoProducto.ACTIVO, destacado: true, esNovedad: false,
      metaTitle: "Peluche Kuromi 25cm | JapanWorld Toys",
      img: "peluche-kuromi-25cm", imgAlt: "Peluche Kuromi 25cm", franquicia: "sanrio-characters",
    },
    {
      nombre: "Peluche Cinnamoroll Mini", slug: "peluche-cinnamoroll-mini",
      descripcion: "Peluche mini de Cinnamoroll (Sanrio), ideal para coleccionar. Producto de demostración.",
      sku: "PLUCH-CIN-MINI", precio: 9500.0, precioComparativo: null, stock: 3,
      categoriaId: catPeluches.id, marcaId: marcaSanrio.id, estado: EstadoProducto.ACTIVO, destacado: true, esNovedad: false,
      metaTitle: "Peluche Cinnamoroll Mini | JapanWorld Toys",
      img: "peluche-cinnamoroll-mini", imgAlt: "Peluche Cinnamoroll Mini", franquicia: "sanrio-characters",
    },
    {
      nombre: "Figura Levi Ackerman Premium", slug: "figura-levi-ackerman-premium",
      descripcion: "Figura premium de Levi Ackerman de Attack on Titan, con base diorama. Producto de demostración.",
      sku: "FIG-AOT-LEVI-P", precio: 36900.0, precioComparativo: null, stock: 1,
      categoriaId: subBanpresto.id, marcaId: marcaBanpresto.id, estado: EstadoProducto.ACTIVO, destacado: false, esNovedad: true,
      metaTitle: "Figura Levi Ackerman Premium | JapanWorld Toys",
      img: "figura-levi-ackerman", imgAlt: "Figura Levi Ackerman Premium", franquicia: "attack-on-titan",
    },
  ];

  for (const dp of demoProducts) {
    await prisma.product.create({
      data: {
        nombre: dp.nombre,
        slug: dp.slug,
        descripcion: dp.descripcion,
        sku: dp.sku,
        precio: dp.precio,
        precioComparativo: dp.precioComparativo,
        stock: dp.stock,
        categoriaId: dp.categoriaId,
        marcaId: dp.marcaId,
        estado: dp.estado,
        destacado: dp.destacado,
        esNovedad: dp.esNovedad,
        metaTitle: dp.metaTitle,
        imagenes: {
          create: [
            { url: `/images/products/demo/${dp.img}-1.svg`, alt: `${dp.imgAlt} - Frente`, orden: 0, esPrincipal: true },
            { url: `/images/products/demo/${dp.img}-2.svg`, alt: `${dp.imgAlt} - Espalda`, orden: 1, esPrincipal: false },
          ],
        },
        franquicias: dp.franquicia
          ? { connect: [{ id: createdFranchises[dp.franquicia] }] }
          : undefined,
      },
    });
  }

  console.log("✅ Productos creados");

  // ─── BANNERS (hero carousel) ──────────────────
  await prisma.banner.createMany({
    data: [
      {
        titulo: "Nuevos Ingresos Funko",
        subtitulo: "Descubrí las últimas figuras que llegaron a JapanWorld",
        imagenDesktop: "/images/heroes/hero-funko.svg",
        imagenMobile: "/images/heroes/hero-funko.svg",
        textoCTA: "Ver colección",
        linkCTA: "/productos?categoria=funkos",
        tipo: "hero",
        orden: 0,
        activo: true,
      },
      {
        titulo: "Demon Slayer Collection",
        subtitulo: "Figuras exclusivas de Kimetsu no Yaiba",
        imagenDesktop: "/images/heroes/hero-demon-slayer.svg",
        imagenMobile: "/images/heroes/hero-demon-slayer.svg",
        textoCTA: "Explorar",
        linkCTA: "/franquicia/demon-slayer",
        tipo: "hero",
        orden: 1,
        activo: true,
      },
      {
        titulo: "Sanrio para Coleccionistas",
        subtitulo: "Hello Kitty, Kuromi y más — ediciones limitadas",
        imagenDesktop: "/images/heroes/hero-sanrio.svg",
        imagenMobile: "/images/heroes/hero-sanrio.svg",
        textoCTA: "Ver Sanrio",
        linkCTA: "/productos?categoria=sanrio",
        tipo: "hero",
        orden: 2,
        activo: true,
      },
    ],
  });

  console.log("✅ Banners creados");

  // ─── PÁGINAS ESTÁTICAS ────────────────────────
  await prisma.page.createMany({
    data: [
      {
        slug: "nosotros",
        titulo: "Sobre Nosotros",
        contenido: "<p>JapanWorld Toys es la gran comiquería y tienda de mangas de Tucumán. Ubicada en San Martín 650, Galería Pezza (locales 46-7), San Miguel de Tucumán, Argentina.</p>",
      },
      {
        slug: "politica-envios",
        titulo: "Política de Envíos",
        contenido: "<p>Ofrecemos envíos por Correo Argentino, retiro en el local sin costo, y envío a coordinar para el interior del país.</p>",
      },
      {
        slug: "politica-devoluciones",
        titulo: "Política de Devoluciones",
        contenido: "<p>Consultas sobre devoluciones al WhatsApp +54 381 365 2079 o por email a japanworldtoys22@gmail.com</p>",
      },
      {
        slug: "terminos-y-condiciones",
        titulo: "Términos y Condiciones",
        contenido: "<p>Términos y condiciones de uso de la tienda online JapanWorld Toys.</p>",
      },
      {
        slug: "arrepentimiento-compra",
        titulo: "Arrepentimiento de Compra",
        contenido: "<p>De conformidad con la Resolución 424/2020 de la Secretaría de Comercio Interior, el comprador podrá ejercer el derecho de retracto dentro de los plazos establecidos por la ley.</p>",
      },
    ],
  });

  console.log("✅ Páginas estáticas creadas");

  // ─── BLOQUES PROMOCIONALES DE LA HOME ──────
  await prisma.promoBlock.createMany({
    data: [
      {
        badge: "COLECCIÓN",
        titulo: "Demon Slayer",
        descripcion: "Figuras exclusivas de Kimetsu no Yaiba — Tanjiro, Nezuko, Zenitsu y más.",
        backgroundImage: "/img/banners/bg_card_demonslayer.webp",
        textoCTA: "Explorar colección",
        linkCTA: "/franquicia/demon-slayer",
        orden: 0,
        activo: true,
      },
      {
        badge: "SANRIO",
        titulo: "Hello Kitty & Friends",
        descripcion: "Peluches, figuras y accesorios de Sanrio — ediciones limitadas disponibles.",
        backgroundImage: "/img/banners/bg_card_sanrio.webp",
        textoCTA: "Ver Sanrio",
        linkCTA: "/productos/sanrio",
        orden: 1,
        activo: true,
      },
    ],
  });

  console.log("✅ Bloques promocionales creados");
  console.log("🎉 Seed completado!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
