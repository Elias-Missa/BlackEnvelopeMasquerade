import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Black Envelope Masquerade — The Consensus",
  description:
    "An elegant multiplayer strategy game. Guess 2/3 of the average to win.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
