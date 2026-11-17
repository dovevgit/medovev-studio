import { useEffect, useRef, useState } from "react";

import { Reel } from "@/components/reel";

import { SHOWREEL, SPONSOR_REELS, VOICE_SAMPLES } from "@/page-copy";

/**
 * The three blocks the voice page carries beyond its prose: a showreel, the
 * telephony samples, and the reels the voice has been heard in.
 *
 * Nothing is embedded until it is asked for. Eleven YouTube players on one
 * page is eleven third-party frames, each with its own scripts and cookies,
 * loading before anyone has pressed anything; so each reel is a still with a
 * play button over it, and the frame is created on the click that asks for
 * it. The audio is one element reused by all seven samples rather than seven
 * elements, which also makes "only one plays at a time" a property of the
 * markup instead of something to police.
 */

function time(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "";
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** The telephony samples: one audio element, seven buttons. */
function PhonePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(0);
  const [length, setLength] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const onTime = () => setAt(audio.currentTime);
    const onMeta = () => setLength(audio.duration);
    const onEnd = () => {
      setPlaying(false);
      setAt(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("play", () => setPlaying(true));
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = (src: string) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (current === src) {
      if (audio.paused) {
        void audio.play();
      } else {
        audio.pause();
      }
      return;
    }
    // A different sample: point the one element at it and start. The browser
    // stops whatever was playing by itself, because it is the same element.
    setCurrent(src);
    setAt(0);
    setLength(0);
    audio.src = src;
    void audio.play();
  };

  return (
    <div className="phone">
      <div className="phone__head">
        <p className="phone__eyebrow">דוגמאות לטלפוניה</p>
        <p className="phone__hint">לחצו על דוגמה ושמעו אותה</p>
      </div>

      {/* The horn. It opens while a sample is playing and closes when it
          stops -- the page's one moving part, and it moves only while there
          is sound to go with it. */}
      <div aria-hidden="true" className="phone__stage" data-playing={playing ? "true" : ""}>
        <svg focusable="false" viewBox="0 0 320 320">
          <defs>
            <radialGradient cx="50%" cy="42%" id="voice-cone" r="60%">
              <stop offset="0" stopColor="#8a6a22" />
              <stop offset="1" stopColor="#201506" />
            </radialGradient>
            <radialGradient cx="50%" cy="50%" id="voice-glow" r="50%">
              <stop offset=".55" stopColor="#e3b94a" stopOpacity=".4" />
              <stop offset="1" stopColor="#e3b94a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className="phone__rip phone__rip--1" cx="160" cy="160" r="58" />
          <circle className="phone__rip phone__rip--2" cx="160" cy="160" r="58" />
          <circle className="phone__rip phone__rip--3" cx="160" cy="160" r="58" />
          <circle cx="160" cy="160" fill="url(#voice-glow)" r="86" />
          <circle cx="160" cy="160" fill="#2a1e0c" r="66" stroke="#e3b94a" strokeWidth="4" />
          <circle
            cx="160"
            cy="160"
            fill="url(#voice-cone)"
            r="50"
            stroke="#e3b94a"
            strokeOpacity=".55"
            strokeWidth="2"
          />
          <circle
            cx="160"
            cy="160"
            fill="none"
            r="34"
            stroke="#e3b94a"
            strokeOpacity=".33"
            strokeWidth="2"
          />
          <circle cx="160" cy="160" fill="#140d04" r="15" stroke="#e3b94a" strokeWidth="3" />
        </svg>
      </div>

      <ul className="phone__list">
        {VOICE_SAMPLES.map((sample) => {
          const live = current === sample.src;
          return (
            <li key={sample.src}>
              <button
                className="track"
                data-live={live ? "true" : ""}
                onClick={() => toggle(sample.src)}
                type="button"
              >
                <span aria-hidden="true" className="track__ico">
                  <svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
                    {live && playing ? (
                      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                    ) : (
                      <path d="M8 5.5v13l11-6.5z" />
                    )}
                  </svg>
                </span>
                <span className="track__title">{sample.title}</span>
                <span aria-hidden="true" className="track__time">
                  {live ? time(at) : ""}
                </span>
                <span aria-hidden="true" className="track__bar">
                  <i style={{ width: live && length ? `${(at / length) * 100}%` : "0%" }} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Not `controls`: the buttons above are the controls. It is in the
          markup so one element serves every sample. */}
      <audio preload="none" ref={audioRef} />
    </div>
  );
}

export function VoiceExtras() {
  return (
    <>
      <section className="page__showreel">
        <Reel eager id={SHOWREEL.id} label={SHOWREEL.label} />
        <div className="showreel__links">
          <a
            className="page-link"
            href="https://www.medovev.co.il/"
            rel="noreferrer"
            target="_blank"
          >
            לאתר הקריינות
          </a>
          <a
            className="showreel__yt"
            href={`https://youtu.be/${SHOWREEL.id}`}
            rel="noreferrer"
            target="_blank"
          >
            לצפייה ביוטיוב
          </a>
        </div>
      </section>

      <section className="page__phone">
        <PhonePlayer />
      </section>

      <section className="page__sponsors">
        <h2 className="page__h2">חסויות, פרסומות ועוד</h2>
        <div className="sponsors">
          {SPONSOR_REELS.map((id) => (
            <Reel id={id} key={id} label="נגן תשדיר" />
          ))}
        </div>
      </section>
    </>
  );
}
