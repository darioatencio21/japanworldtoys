import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  SITE_NAME,
  STORE_ADDRESS,
  STORE_CONTACT,
  INSTAGRAM_URL,
  WHATSAPP_LINK,
} from "@/lib/constants";
import { MapPin, Mail, Phone, Instagram, MessageCircle, Target, Heart, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: `Nosotros · ${SITE_NAME}`,
  description:
    "Conocé la historia de JapanWorld Toys, la gran comiquería y tienda de mangas de Tucumán. Figuras, Funkos, mangas y más para los fans del anime.",
};

export default function NosotrosPage() {
  const values = [
    {
      icon: Target,
      title: "Nuestra misión",
      text: "Acercar el mejor manga, anime y coleccionables a Tucumán y todo el país, con asesoramiento cercano y productos originales.",
    },
    {
      icon: Heart,
      title: "Pasión por el fandom",
      text: "Somos fans como vos. Entendemos lo que buscás y nos aseguramos de que cada figura o manga llegue en las mejores condiciones.",
    },
    {
      icon: Sparkles,
      title: "Calidad garantizada",
      text: "Trabajamos con proveedores confiables para brindarte productos originales y de calidad, respaldados por atención real.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Nosotros" }]} />

      {/* Hero */}
      <section className="relative mt-6 mb-12 rounded-3xl bg-gradient-to-br from-jw-black via-red-950 to-jw-red overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 0%, transparent 45%)",
          }}
        />
        <div className="relative px-8 md:px-14 py-14 md:py-20 text-white">
          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] mb-4 drop-shadow">
            Nuestra historia
          </h1>
          <p className="max-w-2xl text-white/90 md:text-lg leading-relaxed">
            {SITE_NAME} nació en Tucumán con una idea simple: que los fans del
            anime y el manga tengan un lugar donde encontrar eso que tanto
            buscaban. Lo que empezó como una pasión se convirtió en la
            comiquería de referencia de la provincia.
          </p>
        </div>
      </section>

      {/* About text */}
      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-2xl border border-jw-gray-200 p-8">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black mb-4">
            ¿Quiénes somos?
          </h2>
          <p className="text-jw-gray-700 leading-relaxed mb-4">
            Somos un equipo apasionado por el anime, el manga y el coleccionismo.
            En nuestro local vas a encontrar figuras, Funkos, mangas, comics,
            Sanrio, peluches y mucho más, siempre con precios accesibles y la
            mejor atención.
          </p>
          <p className="text-jw-gray-700 leading-relaxed">
            Organizamos lanzamientos, preventas y novedades para que nunca te
            pierdas lo último del mundo geek. Si sos coleccionista, fanático o
            simplemente curioso, te esperamos con los brazos abiertos.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-jw-gray-200 p-8">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black mb-6">
            Nuestros valores
          </h2>
          <div className="space-y-6">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4">
                <div className="h-11 w-11 rounded-xl bg-jw-red/10 flex items-center justify-center flex-shrink-0">
                  <v.icon className="h-5 w-5 text-jw-red" />
                </div>
                <div>
                  <h3 className="font-bold text-jw-black mb-1">{v.title}</h3>
                  <p className="text-sm text-jw-gray-600 leading-relaxed">{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit us */}
      <section className="bg-white rounded-2xl border border-jw-gray-200 p-8 md:p-10">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black mb-8 text-center">
          Visitá nuestro local
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <a
            href={`https://maps.google.com/?q=${STORE_ADDRESS.street}, ${STORE_ADDRESS.city}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-2xl bg-jw-off-white hover:bg-jw-red/5 border border-transparent hover:border-jw-red/30 transition-colors"
          >
            <MapPin className="h-7 w-7 text-jw-red mx-auto mb-3" />
            <p className="font-semibold text-jw-black">{STORE_ADDRESS.street}</p>
            <p className="text-sm text-jw-gray-600">{STORE_ADDRESS.gallery}</p>
            <p className="text-sm text-jw-gray-600">{STORE_ADDRESS.city}</p>
          </a>

          <div className="p-6 rounded-2xl bg-jw-off-white">
            <Phone className="h-7 w-7 text-jw-red mx-auto mb-3" />
            <p className="font-semibold text-jw-black">Teléfono</p>
            <a href={`tel:${STORE_CONTACT.phone.replace(/\s/g, "")}`} className="text-sm text-jw-gray-600 hover:text-jw-red">
              {STORE_CONTACT.phone}
            </a>
          </div>

          <a
            href={`mailto:${STORE_CONTACT.email}`}
            className="p-6 rounded-2xl bg-jw-off-white hover:bg-jw-red/5 border border-transparent hover:border-jw-red/30 transition-colors"
          >
            <Mail className="h-7 w-7 text-jw-red mx-auto mb-3" />
            <p className="font-semibold text-jw-black">Email</p>
            <p className="text-sm text-jw-gray-600 break-all">{STORE_CONTACT.email}</p>
          </a>
        </div>

        {/* Social CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:brightness-95 transition-all shadow-lg"
          >
            <MessageCircle className="h-5 w-5" />
            Escribinos por WhatsApp
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-jw-black text-white text-sm font-bold hover:bg-jw-gray-700 transition-colors shadow-lg"
          >
            <Instagram className="h-5 w-5" />
            Seguinos en Instagram
          </a>
        </div>
      </section>
    </div>
  );
}
