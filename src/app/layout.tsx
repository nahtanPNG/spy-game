import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/contexts/socket-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jogo do Espião",
  description: "Descubra quem é o espião!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
