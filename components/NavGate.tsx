"use client";

import { usePathname } from "next/navigation";
import Nav from "./Nav";

// Muestra el menú público en todo el sitio EXCEPTO en el panel /admin.
export default function NavGate() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Nav />;
}
