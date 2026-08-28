import { Hero } from "@/components/sections/hero";
import { IcebergStory } from "@/components/sections/iceberg-story";
import { Leistungen } from "@/components/sections/leistungen";
import { CtaBand } from "@/components/sections/cta-band";
import { UeberUns } from "@/components/sections/ueber-uns";
import { Referenzen } from "@/components/sections/referenzen";
import { Kontakt } from "@/components/sections/kontakt";

/**
 * Startseite.
 *
 * Die Reihenfolge ist zugleich die Dramaturgie der Kamerafahrt: Hero an der
 * Wasseroberfläche, danach der Abstieg entlang des Eisbergs, und ab
 * „Leistungen“ die inhaltlichen Sektionen vor abgedunkeltem Hintergrund.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <IcebergStory />
      <Leistungen />
      <CtaBand />
      <UeberUns />
      <Referenzen />
      <Kontakt />
    </>
  );
}
