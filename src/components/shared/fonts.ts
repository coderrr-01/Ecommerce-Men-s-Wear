import { Cormorant_Garamond, DM_Sans } from "next/font/google";

export const bodyFont = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-body",
});

export const editorialFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
  variable: "--font-editorial",
});

export const fontVariables = `${bodyFont.variable} ${editorialFont.variable} font-theme`;
