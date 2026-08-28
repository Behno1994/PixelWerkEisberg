import { CinematicScene } from "@/components/canvas/cinematic-scene";
import { Maschinenbau } from "@/components/sections/maschinenbau";
import { Leistungen } from "@/components/sections/leistungen";
import { CtaBand } from "@/components/sections/cta-band";
import { UeberUns } from "@/components/sections/ueber-uns";
import { Referenzen } from "@/components/sections/referenzen";
import { Kontakt } from "@/components/sections/kontakt";

/**
 * Startseite.
 *
 * Zuerst die durchgehende Kino-Szene: 500vh Scrollstrecke, in der das Bild von
 * der hellen Wasseroberfläche in die dunkle Tiefe fährt und die drei Textstufen
 * nacheinander erscheinen. Danach folgen die inhaltlichen Sektionen.
 */
export default function Home() {
  return (
    <>
      <CinematicScene />
      <Maschinenbau />
      <Leistungen />
      <CtaBand />
      <UeberUns />
      <Referenzen />
      <Kontakt />
    </>
  );
}
