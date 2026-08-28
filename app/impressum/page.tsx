import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressum und Anbieterkennzeichnung von ${siteConfig.name}.`,
  robots: { index: false, follow: true },
};

export default function Impressum() {
  return (
    <LegalPage title="Impressum">
      {/* PLATZHALTER – vor dem Livegang durch die tatsächlichen Angaben
          nach § 5 DDG ersetzen. */}
      <p>Angaben gemäss § 5 DDG.</p>

      <h2>Anbieter</h2>
      <p>
        {siteConfig.name}
        <br />
        Musterstrasse 1<br />
        00000 Musterstadt
        <br />
        {siteConfig.contact.city}
      </p>

      <h2>Vertreten durch</h2>
      <p>Vor- und Nachname der vertretungsberechtigten Person</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: {siteConfig.contact.phone}
        <br />
        E-Mail: <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
      </p>

      <h2>Umsatzsteuer-Identifikationsnummer</h2>
      <p>USt-IdNr. gemäss § 27 a UStG: DE000000000</p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>Vor- und Nachname, Anschrift wie oben</p>

      <h2>Streitschlichtung</h2>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor
        einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </LegalPage>
  );
}
