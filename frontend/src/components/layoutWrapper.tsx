"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  console.log(`pathname: ${pathname}`);
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    if (pathname.includes("/agrihcmAdmin")) {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }
  }, [pathname]);

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}
