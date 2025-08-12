import localFont from "next/font/local";

export const mollieGlaston = localFont({
  src: [{ path: "./MollieGlaston.ttf", weight: "400", style: "normal" }],
  variable: "--font-mollie-glaston",
  display: "swap",
});

export const lato = localFont({
  src: [{ path: "./LatoRegular.ttf", weight: "400", style: "normal" }],
  variable: "--font-lato",
  display: "swap",
});