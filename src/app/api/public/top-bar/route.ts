import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TOP_BAR_MESSAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const [messagesSetting, visibleSetting] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "top_bar_messages" } }),
    prisma.siteSetting.findUnique({ where: { key: "top_bar_visible" } }),
  ]);

  let messages: string[] = [];
  try {
    messages = messagesSetting ? (JSON.parse(messagesSetting.value) as string[]) : [];
  } catch {
    messages = [];
  }

  let visible = true;
  if (visibleSetting) {
    try {
      visible = Boolean(JSON.parse(visibleSetting.value));
    } catch {
      visible = true;
    }
  }

  return NextResponse.json({
    visible,
    messages: Array.isArray(messages) && messages.length > 0 ? messages : TOP_BAR_MESSAGES,
  });
}