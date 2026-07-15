"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((registration) => registration.update())
        .catch(() => undefined);

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (sessionStorage.getItem("zion-sw-refreshed") === "true") return;
        sessionStorage.setItem("zion-sw-refreshed", "true");
        window.location.reload();
      });
    }
  }, []);

  return null;
}
