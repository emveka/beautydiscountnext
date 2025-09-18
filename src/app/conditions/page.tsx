import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldCheck, ShoppingBag, Truck, CreditCard, Undo2, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Termes & Conditions | BeautyDiscount Maroc",
  description:
    "Conditions générales de vente, livraison, paiement et retours de BeautyDiscount au Maroc.",
  alternates: { canonical: "/conditions" },
  openGraph: {
    title: "Termes & Conditions | BeautyDiscount",
    description: "Consultez nos conditions générales de vente et d’utilisation.",
    url: "/conditions",
    type: "article",
  },
};

export default function ConditionsPage() {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header */}
      <header className="mb-10 lg:mb-14">
        <div className="flex items-start gap-3">
          <FileText className="h-7 w-7 shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Termes & Conditions
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Conditions générales de vente et d’utilisation de BeautyDiscount Maroc.
            </p>
          </div>
        </div>
      </header>

      {/* Sections */}
      <section className="space-y-8">
        {/* Général */}
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <ShieldCheck className="h-5 w-5" /> Généralités
          </h2>
          <p className="text-sm text-gray-700">
            Les présentes conditions générales s’appliquent à toutes les ventes de
            produits réalisées via le site{" "}
            <Link href="/" className="underline">beautydiscount.ma</Link>.
            En validant une commande, le client accepte pleinement ces conditions.
          </p>
        </article>

        {/* Commandes */}
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <ShoppingBag className="h-5 w-5" /> Commandes
          </h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
            <li>Les produits sont proposés dans la limite des stocks disponibles.</li>
            <li>BeautyDiscount se réserve le droit d’annuler toute commande en cas de rupture ou erreur manifeste.</li>
            <li>Une confirmation est envoyée par email/WhatsApp après validation.</li>
          </ul>
        </article>

        {/* Livraison */}
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <Truck className="h-5 w-5" /> Livraison
          </h2>
          <p className="text-sm text-gray-700">
            Les délais et frais de livraison sont indiqués sur la page{" "}
            <Link href="/livraison" className="underline">Livraison</Link>.
            BeautyDiscount n’est pas responsable des retards liés au transporteur.
          </p>
        </article>

        {/* Paiement */}
<article className="rounded-2xl border bg-white p-6 shadow-sm">
  <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
    <CreditCard className="h-5 w-5" /> Paiement
  </h2>
  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
    <li>
      <strong>Paiement à la livraison (COD)</strong> : vous réglez en espèces au
      livreur lors de la réception de votre commande.
    </li>
    <li>
      <strong>Virement instantané</strong> : disponible sur demande, après
      confirmation par notre équipe. La commande est expédiée après réception du
      virement.
    </li>
  </ul>
  <p className="text-sm text-gray-700 mt-3">
    Toute tentative de fraude ou de non-paiement entraînera l’annulation
    immédiate de la commande.
  </p>
</article>


        {/* Retours */}
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <Undo2 className="h-5 w-5" /> Retours & Réclamations
          </h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
            <li>Les retours sont acceptés sous 48h après réception.</li>
            <li>Les produits d’hygiène/cosmétiques ouverts ne sont pas repris sauf défaut.</li>
            <li>Les frais de retour sont à la charge du client sauf erreur de préparation.</li>
          </ul>
        </article>

        {/* Données & confidentialité */}
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-lg mb-3">
            <UserCheck className="h-5 w-5" /> Données personnelles
          </h2>
          <p className="text-sm text-gray-700">
            Vos informations sont traitées conformément à notre{" "}
            <Link href="/confidentialite" className="underline">Politique de confidentialité</Link>.
            BeautyDiscount s’engage à protéger vos données et ne les partage jamais sans votre accord.
          </p>
        </article>
      </section>

      {/* Footer note */}
      <p className="text-xs text-gray-500 mt-10">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-MA")}
      </p>
    </main>
  );
}
