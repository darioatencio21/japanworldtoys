import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConfigManager } from "@/components/admin/config-manager";
import { TOP_BAR_MESSAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminConfigPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [messagesSetting, visibleSetting] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "top_bar_messages" } }),
    prisma.siteSetting.findUnique({ where: { key: "top_bar_visible" } }),
  ]);

  let topBarMessages: string[] = TOP_BAR_MESSAGES;
  if (messagesSetting) {
    try {
      const parsed = JSON.parse(messagesSetting.value) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) topBarMessages = parsed;
    } catch {
      // mantener default
    }
  }

  let topBarVisible = true;
  if (visibleSetting) {
    try {
      topBarVisible = Boolean(JSON.parse(visibleSetting.value));
    } catch {
      topBarVisible = true;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-jw-black mb-2">
        Configuración
      </h1>
      <p className="text-jw-gray-500 mb-8">
        Barra de anuncios del home
      </p>

      <ConfigManager
        initialMessages={topBarMessages}
        initialVisible={topBarVisible}
      />
    </div>
  );
}