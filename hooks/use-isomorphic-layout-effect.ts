import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect`, das beim Server-Rendering nicht warnt.
 * GSAP-Setups laufen bevorzugt vor dem Paint – daher Layout-Effect im Browser.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
