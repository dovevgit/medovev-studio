import { useEffect, useRef } from "react";

/**
 * The knight who rappels down the page.
 *
 * A rope runs down the left margin from where the film ends to the memory
 * game. He hangs on it, `position: sticky`, so he holds his place on the
 * screen while the page scrolls past him -- what moves is the rope behind
 * him and his own hands, a frame at a time. Scrolling up runs the cycle
 * backwards and he climbs.
 *
 * The rope sprite is one strip of eight cells, every cell cut around the
 * rope rather than around the knight, so the rope in the picture lines up
 * with the rope the page draws above and below him.
 *
 * At the foot of the rope he lets go, and from there he paces back and
 * forth above the board -- a walk cycle on a timer, nothing to do with
 * scroll any more, and clear of the cards.
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

      lane.style.setProperty(
        "--knight-frame",
        String(Math.floor(travelled / (PULL / FRAMES)) % FRAMES),
      );

      // He lands when the end of the rope comes into view, which is the
      // moment it looks right -- and, unlike a distance along the lane, it
      // is a point the page can always actually reach.
      lane.dataset.landed = box.bottom <= window.innerHeight * 0.92 ? "true" : "";
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
      <div className="rappel__climber" />
      <div className="rappel__walker">
        <span />
      </div>
    </div>
  );
}
