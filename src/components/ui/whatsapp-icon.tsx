import Image from "next/image";
import { cn } from "@/lib/utils";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/images/icons/whatsapp-anime.png"
      alt="WhatsApp"
      width={20}
      height={20}
      className={cn("h-5 w-5 rounded-full object-cover", className)}
    />
  );
}