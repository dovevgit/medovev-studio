/**
 * Scene data for the scroll-scrub journey.
 *
 * Single-shot build: the chapters of the journey read over the generated film.
 * Every `poster` is the exact first frame of the encoded clip beside it.
 *
 * WebP, not PNG. A poster is on screen for the moment before its clip is
 * ready to play, and the six of them in PNG were 6.7 MB of the home page's
 * weight -- which on a phone meant the film appeared after nearly four
 * seconds of dark screen, and after twelve on a weak signal. At 0.35 MB the
 * difference is 1.3 of 255 per colour channel: nothing the eye can find at
 * the size and for the length of time these are shown.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";

/** Brand tokens for the journey layer. */
export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#6E7FB3",
  background: "#0B0A09",
  ink: "#F3EFE8",
  muted: "#A79C8C",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    // The page is RTL, so the engine's logical "right" renders on the
    // PHYSICAL LEFT of the frame -- which is where the copy belongs, clear
    // of the knight and the king on the right.
    align: "right",
    body: "לפני הקמפיין, לפני האתר ולפני המצלמה מחליטים מה הכיוון.",
    clip: "/assets/world/scene-01.mp4",
    id: "strategy",
    label: "אסטרטגיה",
    linger: 0.2,
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobileObjectPosition: "50% 30%",
    mobilePoster: "/assets/world/scene-01-mobile-poster.webp",
    poster: "/assets/world/scene-01-poster.webp",
    scroll: 2.2,
    title: "כל מהלך מתחיל באסטרטגיה",
  },
  {
    // The page is RTL, so the engine's logical "right" renders on the
    // PHYSICAL LEFT of the frame -- which is where the copy belongs, clear
    // of the knight and the king on the right.
    align: "right",
    body: "בלי אסטרטגיה אין כיוון ברור.",
    clip: "/assets/world/scene-02.mp4",
    id: "strategy-decided",
    label: "ההכרעה",
    linger: 0.15,
    mobileClip: "/assets/world/scene-02-mobile.mp4",
    mobileObjectPosition: "50% 30%",
    mobilePoster: "/assets/world/scene-02-mobile-poster.webp",
    poster: "/assets/world/scene-02-poster.webp",
    scroll: 2.1,
    title: "משם הכל מתחיל",
  },
  {
    // The page is RTL, so the engine's logical "right" renders on the
    // PHYSICAL LEFT of the frame -- clear of the knight, who glides into the
    // centre, and of the banners standing across the foreground.
    align: "right",
    // This chapter says what it has to say on the banners inside the film,
    // so it carries no line of its own. An empty body renders nothing.
    body: "",
    clip: "/assets/world/scene-03.mp4",
    id: "presence",
    label: "נוכחות",
    linger: 0.15,
    mobileClip: "/assets/world/scene-03-mobile.mp4",
    mobileObjectPosition: "50% 30%",
    mobilePoster: "/assets/world/scene-03-mobile-poster.webp",
    poster: "/assets/world/scene-03-poster.webp",
    scroll: 2.1,
    title: "להיות בכל מקום ולדבר באותה השפה",
  },
];
