"use client";

import { useState, useEffect } from "react";
import { TOP_BAR_MESSAGES } from "@/lib/constants";

export function TopBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [visible, setVisible] = useState(true);
  const [messages, setMessages] = useState<string[]>(TOP_BAR_MESSAGES);

  useEffect(() => {
    fetch("/api/public/top-bar")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (typeof data.visible === "boolean") setVisible(data.visible);
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 300);
    }, 7000);

    return () => clearInterval(interval);
  }, [messages.length]);

  if (!visible || messages.length === 0) return null;

  return (
    <div className="bg-jw-black text-white text-xs py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
        <span
          className={`transition-all duration-300 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2"
          }`}
        >
          {messages[currentIndex]}
        </span>
      </div>
    </div>
  );
}