import Link from "next/link";
import { Logo } from "./logo";
import { Twitter, Linkedin, Github, Facebook, Instagram } from "lucide-react";

export function Footer() {
  const pages = [
    { title: "All Products", href: "#" },
    { title: "Features", href: "#product" },
    { title: "Pricing", href: "#pricing" },
    { title: "Blog", href: "#" },
  ];

  const socials = [
    { title: "Facebook", href: "#" },
    { title: "Instagram", href: "#" },
    { title: "Twitter", href: "#" },
    { title: "LinkedIn", href: "#" },
  ];

  const legal = [
    { title: "Privacy Policy", href: "#" },
    { title: "Terms of Service", href: "#" },
    { title: "Cookie Policy", href: "#" },
  ];

  return (
    <footer className="w-full max-w-7xl mx-auto rounded-xl m-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div className="flex items-start flex-col">
            <Logo />
            <h2 className="text-2xl font-medium mt-8 max-w-md">
              AI-powered Alzheimer&apos;s disease detection for clinical analysis.
            </h2>
          </div>

          <div className="grid justify-self-end grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h3 className="font-semibold">Pages</h3>
              <ul className="space-y-3">
                {pages.map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="text-muted-foreground hover:text-foreground">{item.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="font-semibold">Socials</h3>
              <ul className="space-y-3">
                {socials.map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="text-muted-foreground hover:text-foreground">{item.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="font-semibold">Legal</h3>
              <ul className="space-y-3">
                {legal.map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="text-muted-foreground hover:text-foreground">{item.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-16 max-w-xs mx-auto">
          <p className="text-sm text-muted-foreground">© NeuroScan AI</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-muted-foreground hover:text-foreground"><Twitter size={20} /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground"><Linkedin size={20} /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground"><Github size={20} /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground"><Facebook size={20} /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground"><Instagram size={20} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
