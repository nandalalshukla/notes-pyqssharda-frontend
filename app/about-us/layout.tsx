import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Sharda Social — Built by Sharda Students",
  description:
    "Sharda Social is an independent, student-run community and online library for Sharda University, Greater Noida. Learn who builds it, why it exists and how to contribute notes and past papers.",
  alternates: { canonical: "/about-us" },
  openGraph: {
    title: "About Sharda Social — Built by Sharda Students",
    description:
      "An independent, student-run community and online library for Sharda University, Greater Noida.",
    url: "/about-us",
    type: "website",
    images: ["/shardasocial.png"],
  },
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
