import { useEffect } from "react";

/**
 * Interface Adaptativa Aurora/Crepúsculo
 * Shifts CSS custom properties subtly based on time of day:
 * - Aurora (6-12): warm sunrise tones
 * - Dia (12-17): standard vibrant
 * - Crepúsculo (17-20): warm sunset amber
 * - Noite (20-6): cool deep tones
 */
export const useAdaptiveTheme = () => {
  useEffect(() => {
    const applyTimeTheme = () => {
      const hour = new Date().getHours();
      const root = document.documentElement;

      // Remove all time classes
      root.classList.remove("time-aurora", "time-dia", "time-crepusculo", "time-noite");

      if (hour >= 6 && hour < 12) {
        root.classList.add("time-aurora");
      } else if (hour >= 12 && hour < 17) {
        root.classList.add("time-dia");
      } else if (hour >= 17 && hour < 20) {
        root.classList.add("time-crepusculo");
      } else {
        root.classList.add("time-noite");
      }
    };

    applyTimeTheme();
    // Recheck every 10 minutes
    const interval = setInterval(applyTimeTheme, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
};
