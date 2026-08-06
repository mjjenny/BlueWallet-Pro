import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "THE BLUE WALLET",
  description: "BlueWallet Pro stable app.",
};

export default function Home() {
  redirect("/legacy-root-pwa.html");
}
