export const SITE_NAME = "JapanWorld Toys";
export const SITE_DESCRIPTION =
  "La gran comiquería y tienda de mangas de Tucumán. Figuras, Funkos, Manga, Comics, Sanrio y más.";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "54381527280";

export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export const INSTAGRAM_URL = "https://instagram.com/japanworldtoys";

export const STORE_ADDRESS = {
  street: "San Martín 650",
  gallery: "Galería Pezza (locales 46-47)",
  city: "San Miguel de Tucumán",
  province: "Tucumán",
  country: "Argentina",
};

export const STORE_CONTACT = {
  phone: "+54 381 527 280",
  email: "japanworldtoys22@gmail.com",
};

export const NAV_ITEMS = [
  {
    label: "Productos",
    href: "/productos",
    children: [
      {
        label: "Funkos",
        href: "/productos/figuras/funkos",
        image: "/images/mega-menu/boton_funkos.webp",
        alt: "Funko Pop de Naruto Uzumaki",
      },
      {
        label: "Peluches",
        href: "/productos/peluches",
        image: "/images/mega-menu/boton_peluches.webp",
        alt: "Peluche de Totoro",
      },
      {
        label: "Mangas",
        href: "/productos/mangas",
        image: "/images/mega-menu/boton_mangas.webp",
        alt: "Tomo de manga de One Piece con Monkey D. Luffy",
      },
      {
        label: "Sanrio",
        href: "/productos/sanrio",
        image: "/images/mega-menu/boton_sanrio.webp",
        alt: "Hello Kitty de Sanrio",
      },
      {
        label: "Comics",
        href: "/productos/comics",
        image: "/images/mega-menu/boton_comics.webp",
        alt: "Cómic de Dragon Ball con Goku",
      },
      {
        label: "Figuras",
        href: "/productos/figuras",
        image: "/images/mega-menu/boton_figuras.webp",
        alt: "Figura coleccionable de Roronoa Zoro",
      },
    ],
  },
  {
    label: "Franquicias",
    href: "/franquicia",
    children: [
      { label: "One Piece", href: "/franquicia/one-piece" },
      { label: "Naruto", href: "/franquicia/naruto" },
      { label: "Dragon Ball", href: "/franquicia/dragon-ball" },
      { label: "Demon Slayer", href: "/franquicia/demon-slayer" },
      { label: "Jujutsu Kaisen", href: "/franquicia/jujutsu-kaisen" },
      { label: "Otros", href: "/franquicia" },
    ],
  },
  { label: "Ofertas", href: "/ofertas" },
  { label: "Próximamente", href: "/proximamente" },
  { label: "Nosotros", href: "/nosotros" },
];

export const TOP_BAR_MESSAGES = [
  "🚀 Retirá en el local sin cargo",
  "💳 Hasta 12 cuotas sin interés",
  "📦 Envíos a todo el país por Correo Argentino",
  "🎌 Las mejores figuras de anime en Tucumán",
  "🔥 Nuevo: Demon Slayer Collection disponible",
];

export const PAYMENT_METHODS = [
  "Visa",
  "Mastercard",
  "American Express",
  "Naranja",
  "Maestro",
  "Mercado Pago",
  "Transferencia",
];

export const SHIPPING_METHODS = [
  { name: "Correo Argentino", icon: "truck" },
  { name: "Retiro en el local", icon: "store" },
  { name: "A coordinar", icon: "handshake" },
];

export const INSTALLMENTS_DEFAULT = 12;

export const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  NUEVO: { bg: "bg-jw-red", text: "text-white" },
  PREVENTA: { bg: "bg-jw-gold", text: "text-jw-black" },
  EXCLUSIVO: { bg: "bg-jw-gold", text: "text-jw-black" },
  OFERTA: { bg: "bg-jw-error", text: "text-white" },
  "POCAS UNIDADES": { bg: "bg-jw-warning", text: "text-jw-black" },
  PROXIMAMENTE: { bg: "bg-jw-gray-700", text: "text-white" },
  "SIN STOCK": { bg: "bg-jw-gray-500", text: "text-white" },
};
