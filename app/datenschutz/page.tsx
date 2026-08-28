import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: `Informationen zur Verarbeitung personenbezogener Daten bei ${siteConfig.name}.`,
  robots: { index: false, follow: true },
};

export default function Datenschutz() {
  return (
    <LegalPage title="Datenschutzerklärung">
      {/* PLATZHALTER – vor dem Livegang rechtlich prüfen und an die
          tatsächlich eingesetzten Dienste anpassen. */}
      <p>
        Diese Erklärung beschreibt, welche personenbezogenen Daten beim Besuch
        dieser Website verarbeitet werden und zu welchem Zweck.
      </p>

      <h2>Verantwortlicher</h2>
      <p>
        {siteConfig.name}, Musterstrasse 1, 00000 Musterstadt,{" "}
        <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
      </p>

      <h2>Server-Logfiles</h2>
      <p>
        Der Hosting-Anbieter erhebt automatisch Informationen, die Ihr Browser
        übermittelt (IP-Adresse, Datum und Uhrzeit, angeforderte Datei,
        Referrer, Browsertyp). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO;
        das berechtigte Interesse liegt im sicheren und stabilen Betrieb.
      </p>

      <h2>Kontaktformular</h2>
      <p>
        Die im Formular eingegebenen Daten (Name, Unternehmen, E-Mail-Adresse,
        optional Telefonnummer sowie Ihre Nachricht) verarbeiten wir
        ausschliesslich zur Bearbeitung Ihrer Anfrage. Rechtsgrundlage ist
        Art. 6 Abs. 1 lit. b DSGVO bzw. lit. f DSGVO. Die Daten werden gelöscht,
        sobald sie für den Zweck nicht mehr erforderlich sind und keine
        gesetzlichen Aufbewahrungspflichten entgegenstehen.
      </p>

      <h2>Schriftarten</h2>
      <p>
        Die verwendeten Schriftarten werden zur Bauzeit heruntergeladen und vom
        eigenen Server ausgeliefert. Beim Seitenaufruf entsteht dadurch keine
        Verbindung zu Servern Dritter.
      </p>

      <h2>Ihre Rechte</h2>
      <ul>
        <li>Auskunft über die verarbeiteten Daten (Art. 15 DSGVO)</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
        <li>Löschung (Art. 17 DSGVO) und Einschränkung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
      </ul>
    </LegalPage>
  );
}
