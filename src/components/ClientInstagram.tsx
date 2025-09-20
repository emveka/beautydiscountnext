"use client";

import dynamic from "next/dynamic";

// On charge InstagramGallery uniquement côté client
const InstagramGallery = dynamic(() => import("./InstagramGallery"), {
  ssr: false,
  loading: () => null,
});

export default function ClientInstagram() {
  return <InstagramGallery />;
}
