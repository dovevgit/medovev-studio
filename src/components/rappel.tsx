import { useEffect, useRef } from "react";

/**
 * The knight who rappels down the page.
 *
 * A rope runs down the left margin from where the film ends to the contact
 * banner, and the knight hangs on it. He is `position: sticky`, so he holds
 * his place on the screen while the page scrolls past him -- what moves is
 * the rope behind him and his own hands, a frame at a time. Scrolling up
 * runs the cycle backwards and he climbs.
 *
 * The sprite is one strip of eight cells, every cell cut around the rope
 * rather than around the knight, so the rope in the picture lines up with
 * the rope the page draws above and below him.
 *
 * At the foot of the rope sticky releases on its own and he arrives at the
 * bottom of the lane, where he swaps to the landing pose -- down on one
 * knee, beside the contact banner.
 */

/** Scroll distance for one full pull of the rope, in pixels. */
const PULL = 170;
const FRAMES = 8;

export function Rappel() {
  const laneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lane = laneRef.current;
    if (!lane || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;

    const draw = () => {
      frame = 0;
      const box = lane.getBoundingClientRect();
      // How far the lane has travelled up the screen, which is the distance
      // the knight has covered: the rope's own length, not the page's.
      const travelled = Math.max(0, -box.top);
      const run = Math.max(1, lane.offsetHeight - window.innerHeight * 0.4);

      lane.style.setProperty(
        "--knight-frame",
        String(Math.floor(travelled / (PULL / FRAMES)) % FRAMES),
      );
      // The last stretch is the landing, so the pose has somewhere to change.
      lane.dataset.landed = travelled >= run ? "true" : "";
    };

    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = requestAnimationFrame(draw);
    };

    draw();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden="true" className="rappel" ref={laneRef}>
      <div className="rappel__rope" />
      <div className="rappel__knight" />
    </div>
  );
}
