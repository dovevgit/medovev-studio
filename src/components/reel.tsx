/**
 * A YouTube still that becomes a player on click.
 *
 * Nothing is embedded until it is asked for. A page with a dozen reels on it
 * is a dozen third-party frames, each with its own scripts and cookies,
 * loading before anyone has pressed anything -- so the still is YouTube's own
 * thumbnail and the frame is created on the click that asks for it. A visitor
 * who only reads the page is never handed to YouTube at all.
 */
import { useState } from "react";

/** A YouTube still that becomes a player on click. */
export function Reel({ eager, id, label }: { eager?: boolean; id: string; label: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="reel reel--live">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={label}
        />
      </div>
    );
  }

  return (
    <div className="reel">
      <button
        aria-label={label}
        className="reel__btn"
        onClick={() => setPlaying(true)}
        type="button"
      >
        <img
          alt=""
          height={360}
          // The showreel is the first thing on the page, so it is not
          // deferred: a lazy image above the fold is a blank box while the
          // browser works out that it was visible all along.
          loading={eager ? "eager" : "lazy"}
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          width={480}
        />
        <span aria-hidden="true" className="reel__play">
          <svg fill="currentColor" height="28" viewBox="0 0 24 24" width="28">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </span>
      </button>
    </div>
  );
}
