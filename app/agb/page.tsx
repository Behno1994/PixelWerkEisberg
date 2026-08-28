import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "AGB",
  description: `Allgemeine Geschäftsbedingungen von ${siteConfig.name}.`,
  robots: { index: false, follow: true },
};

export default function Agb() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen">
      {/* PLATZHALTER – vor dem Livegang durch geprüfte AGB ersetzen. */}
      <h2>1. Geltungsbereich</h2>
      <p>
        Diese Bedingungen gelten für alle Verträge zwischen {siteConfig.name} und
        Auftraggebern über Konzeption, Gestaltung, Entwicklung und Betrieb
        digitaler Anwendungen.
      </p>

      <h2>2. Angebot und Vertragsschluss</h2>
      <p>
        Angebote sind freibleibend. Ein Vertrag kommt mit schriftlicher
        Auftragsbestätigung oder mit Beginn der Leistungserbringung zustande.
      </p>

      <h2>3. Leistungsumfang und Mitwirkung</h2>
      <p>
        Der Leistungsumfang ergibt sich aus dem jeweiligen Angebot. Der
        Auftraggeber stellt erforderliche Inhalte, Zugänge und Freigaben
        rechtzeitig bereit.
      </p>

      <h2>4. Vergütung</h2>
      <p>
        Sofern nicht anders vereinbart, erfolgt die Abrechnung nach Aufwand.
        Rechnungen sind innerhalb von 14 Tagen ohne Abzug fällig.
      </p>

      <h2>5. Nutzungsrechte</h2>
      <p>
        Nutzungsrechte an den erbrachten Leistungen gehen nach vollständiger
        Bezahlung auf den Auftraggeber über.
      </p>

      <h2>6. Haftung</h2>
      <p>
        Die Haftung richtet sich nach den gesetzlichen Bestimmungen. Für leichte
        Fahrlässigkeit wird nur bei Verletzung wesentlicher Vertragspflichten
        gehaftet, begrenzt auf den vertragstypischen, vorhersehbaren Schaden.
      </p>

      <h2>7. Schlussbestimmungen</h2>
      <p>
        Es gilt deutsches Recht. Gerichtsstand ist – soweit zulässig – der Sitz
        des Auftragnehmers.
      </p>
    </LegalPage>
  );
}
