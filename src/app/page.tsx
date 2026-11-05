import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Postproof — Proof worth posting",
  description: "Collect customer reviews with one link. Post them as branded graphics.",
};

export default function Home() {
  return <LandingPage />;
}
