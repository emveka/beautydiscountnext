import type { Metadata } from "next";
import Link from "next/link";
import {
  Truck,
  Timer,
  PackageCheck,
  ShieldCheck,
  PhoneCall,
  MapPin,
  CreditCard,
  Wallet,
  Undo2,
  BadgeInfo,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Livraison & Retours | BeautyDiscount Maroc",
  description:
    "Délais, frais par ville, paiement à la livraison, suivi de colis et conditions d'expédition partout au Maroc.",
  alternates: { canonical: "/livraison" },
  openGraph: {
    title: "Livraison & Retours",
    description:
      "Tout savoir sur nos délais, frais d'expédition et suivi de vos commandes au Maroc.",
    url: "/livraison",
    type: "article",
  },
};

// ✏️ Modifiez ces données selon votre politique
const CITIES: { name: string; priceDh?: number; note?: string }[] = [
  { name: "Casablanca", priceDh: 25 },
  { name: "Rabat", priceDh: 30 },
  { name: "Marrakech", priceDh: 35 },
  { name: "Fès", priceDh: 35 },
  { name: "Tanger", priceDh: 35 },
  { name: "Agadir", priceDh: 40 },
  { name: "Autres villes", note: "Selon transporteur / poids" },
];

const DELIVERY_RULES = [
  {
    label: "En Stock",
    eta: "1 jour ouvrable",
    details:
      "Préparation le jour même pour les commandes passées avant 14h (hors dimanche et jours fériés).",
  },
  {
    label: "Sur Commande",
    eta: "≈ 7 jours ouvrables",
    details:
      "Inclut l'approvisionnement chez le fournisseur avant expédition.",
  },
  {
    label: "Rupture",
    eta: "—",
    details:
      "Nous vous notifierons dès que le produit sera de nouveau disponible.",
  },
];

export default function LivraisonPage() {
  return (
    <main className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header */}
      <header className="mb-8 lg:mb-12">
        <div className="flex items-start gap-3">
          <Truck className="h-7 w-7 shrink-0" aria-hidden />
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Livraison & Retours</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Suivez nos délais, frais et conditions d&apos;envoi partout au Maroc.
            </p>
          </div>
        </div>
      </header>

      {/* Top highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-10 lg:mb-14">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="h-5 w-5" />
            <h2 className="font-semibold">Délais indicatifs</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            {DELIVERY_RULES.map((r) => (
              <li key={r.label} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-rose-300" />
                <div>
                  <p className="font-medium">{r.label} · {r.eta}</p>
                  <p className="text-gray-600">{r.details}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <PackageCheck className="h-5 w-5" />
            <h2 className="font-semibold">Frais de livraison</h2>
          </div>
          <ul className="divide-y text-sm">
            {CITIES.map((c) => (
              <li key={c.name} className="flex items-center justify-between py-2">
                <span className="text-gray-700">{c.name}</span>
                <span className="font-semibold">
                  {typeof c.priceDh === "number" ? `${c.priceDh.toLocaleString()} dh` : c.note}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="font-semibold">Expédition sécurisée</h2>
          </div>
          <p className="text-sm text-gray-700">
            Emballage renforcé pour protéger vos produits. Colis assurés selon le transporteur.
          </p>
          <ul className="mt-3 text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>Contrôle qualité avant expédition</li>
            <li>Scellés de sécurité sur certains articles</li>
            <li>Numéro de suivi fourni dès la prise en charge</li>
          </ul>
        </article>
      </section>

      {/* Paiement et suivi */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-10 lg:mb-14">
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Paiement</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="rounded-xl bg-gray-50 p-4">
              <h4 className="flex items-center gap-2 font-medium"><Truck className="h-4 w-4" /> Paiement à la livraison (COD)</h4>
              <p className="text-sm text-gray-700 mt-1">Réglez en espèces à la réception dans la plupart des villes.</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <h4 className="flex items-center gap-2 font-medium"><CreditCard className="h-4 w-4" /> Virement Instantané</h4>
              <p className="text-sm text-gray-700 mt-1"> Virement Instantané (Contactez nous pour plus d&apos;informations).</p>
            </div>
            
          </div>
        </article>

        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BadgeInfo className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Suivi de commande</h3>
          </div>
          <p className="text-sm text-gray-700">
            Dès l&apos;expédition, vous recevez un SMS/WhatsApp avec le numéro de suivi. Vous pouvez aussi suivre votre
            commande depuis votre espace client.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="https://cathedis.ma/shipment/" className="px-3 py-2 rounded-lg border hover:bg-gray-50">Suivi Commande</Link>
            <Link href="/contact" className="px-3 py-2 rounded-lg border hover:bg-gray-50">Contacter le support</Link>
          </div>
        </article>
      </section>

      {/* Retours & conditions */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm mb-10 lg:mb-14">
        <div className="flex items-center gap-2 mb-3">
          <Undo2 className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Retours & conditions</h3>
        </div>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          <li>Vous disposez de <strong>48h</strong> après réception pour signaler un article endommagé.</li>
          <li>Les produits d&apos;hygiène/cosmétiques ouverts ne sont pas repris, sauf défaut avéré.</li>
          <li>Les frais de retour sont à la charge du client, sauf erreur de préparation.</li>
        </ul>
        <p className="text-sm text-gray-700 mt-3">
          Voir aussi la page <Link href="/retours" className="underline underline-offset-2">Politique de retours</Link>.
        </p>
      </section>

      {/* Contact & points de retrait (si applicable) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <PhoneCall className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Besoin d&apos;aide ?</h3>
          </div>
          <p className="text-sm text-gray-700">
            Notre équipe est disponible du lundi au samedi, 9h–19h.
          </p>
          <div className="mt-3 text-sm">
            <p>Tél/WhatsApp : <a href="tel:+212771515771" className="font-semibold hover:underline">+212 7 71 51 57 71</a></p>
            <p>Email : <a href="mailto:contact@beautydiscount.ma" className="hover:underline">contact@beautydiscount.ma</a></p>
          </div>
        </article>

        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Adresse & retrait</h3>
          </div>
          <p className="text-sm text-gray-700">Retrait sur place (si disponible) après confirmation par SMS.</p>
          <div className="mt-3 text-sm">
            <p>Adresse : Casablanca — Maroc</p>
            <Link href="https://maps.google.com/?q=Casablanca%20Maroc" className="underline underline-offset-2" target="_blank">Voir sur la carte</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
