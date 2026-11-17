import { useEffect, useRef } from "react";

/**
 * The knight who climbs down the page.
 *
 * A rope ladder runs down the left margin from the very top -- over the film
 * as well, so the descent starts the moment anything moves. He hangs on it,
 * `position: sticky`, keeping his place on the screen while the page scrolls
 * past: what moves is the ladder behind him and his own hands, a frame at a
 * time. Scroll back up and the cycle runs backwards and he climbs.
 *
 * The rungs are the point. A rope is a smooth line with nothing to measure
 * movement against, so at this size it read as a hairline; a ladder has
 * horizontal marks that stream past him, which is what makes a descent look
 * like a descent.
 *
 * The climb cells were cut around the LADDER rather than around the knight,
 * so the rails in the picture sit at the same place in every frame and line
 * up with the ladder the page draws above and below him.
 *
 * How far down it goes depends on how much room there is beside it: a
 * desktop has wide margins and the ladder runs the whole page, while on a
 * phone the board is the full width, so it stops above the game -- a knight
 * crossing the cards is a knight in the way.
 */

/** Scroll distance for one full cycle of the climb, in pixels. */
const PULL = 150;
const CLIMB_FRAMES = 15;

export function Ladder() {
  const laneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lane = laneRef.current;
    if (!lane || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;

    const draw = () => {
      frame = 0;

      // Where the ladder ends, in pixels up from the foot of its container.
      // Measured rather than written in the stylesheet: it is the distance
      // to another element, which CSS has no way to ask for.
      const page = lane.parentElement;
      const game = document.getElementById("memory-game");
      const narrow = matchMedia("(max-width: 860px)").matches;
      lane.style.setProperty(
        "--lane-end",
        narrow && page && game
          ? `${Math.max(0, Math.round(page.getBoundingClientRect().bottom - game.getBoundingClientRect().top))}px`
          : "0px",
      );

      const box = lane.getBoundingClientRect();
      // How far the ladder has travelled up the screen, which is the
      // distance he has covered: the ladder's own length, not the page's.
      const travelled = Math.max(0, -box.top);

      lane.style.setProperty(
        "--knight-frame",
        String(Math.floor(travelled / (PULL / CLIMB_FRAMES)) % CLIMB_FRAMES),
      );

      // He steps off when the foot of the ladder comes into view, which is
      // the moment it looks right -- and, unlike a distance along the lane,
      // it is a point the page can always actually reach.
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
    <div aria-hidden="true" className="ladder" ref={laneRef}>
      <div className="ladder__rails" />
      {/* The climber hangs in a column of its own. Laid out as a plain block
          in a right-to-left page, a box with a width and a left margin is
          over-constrained and it is the LEFT margin the browser drops: he
          ended up against the right edge while his ladder was drawn down the
          left. Positioned, there is nothing to resolve. */}
      <div className="ladder__column">
        <div className="ladder__climber" />
      </div>
      <div className="ladder__dismount" />
      <div className="ladder__walker">
        <span />
      </div>
    </div>
  );
}
