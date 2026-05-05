import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Inventory Receiving",
    short_name: "Receiving",
    description: "Receive inventory into ShipStation from a mobile device.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfcfb",
    theme_color: "#173f35",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
