import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { AfterFilm } from "@/components/after-film";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { SiteMenu } from "@/components/site-menu";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

export const Route = createFileRoute("/")({
  component: Index,
});

/**
 * How a chapter's copy behaves inside its own stretch of the journey, as
 * fractions of that chapter's clip:
 *
 *   fadeIn   - how long the block takes to arrive at the chapter's start
 *   buildEnd - the last word of the headline is complete by here
 *   holdTo   - the block stays fully present until here
 *   fadeOut  - how long it takes to leave after that
 *
 * buildEnd sits well before holdTo on purpose, so there is a long stretch in
 * which the finished headline and the finished frame are on screen together.
 */
const COPY = {
  bodyFade: 0.07,
  buildEnd: 0.55,
  fadeIn: 0.05,
  fadeOut: 0.06,
  holdTo: 1,
};

/**
 * What each monolith is carved with, in the presence chapter.
 *
 * These are words, not icons: an icon on a distant stone has to be decoded,
 * and the whole point of the chapter is that the visitor reads the services
 * at a glance. Set as live text, they also stay crisp at every size and are
 * there for a crawler.
 *
 * `x` and `y` are measured against the FILM FRAME, not the screen: the layer
 * that holds them reproduces the video's own box, so a word stays on its
 * stone whether the frame is cropped to fill a desktop window or letterboxed
 * whole on a phone.
 *
 * `at` is when the word lights, as a fraction of its chapter. They start only
 * after the stones have finished rising, and arrive one after another.
 */
/**
 * The service each stretch of the journey is about.
 *
 * The name stays put while the headlines and lines beneath it change, and
 * gives way only when the service itself does -- it is what the whole film is
 * selling, so it outlives any single chapter. It therefore lives in its own
 * layer rather than inside a chapter's copy, which is what used to carry it
 * off screen at the first chapter break.
 */
const SERVICES = [
  { first: 0, label: "אסטרטגיה עסקית", last: 1 },
  { first: 2, label: "נוכחות דיגיטלית", last: 2 },
];

/**
 * Lift each chapter's copy into the pinned stage and drive it from scroll.
 *
 * WHY: the engine parks chapter copy in a tall band and pins it with
 * `position: sticky`. A sticky block always releases one viewport-height
 * before its band ends, so the copy slid away while its clip still had its
 * final beat to play -- the end of each chapter could never be read and
 * watched at the same time, at any percentage.
 *
 * Moving the copy into the stage (which stays pinned for the whole journey)
 * replaces that with direct control: each block is shown and hidden purely as
 * a function of `--ss-progress`, so it can stay until its clip reaches 100%.
 *
 * The copy is MOVED, not cloned: it is server-rendered in the band for
 * crawlers and for a visitor without JavaScript, and exists exactly once in
 * the DOM either way.
 *
 * Everything here runs ONCE on mount (and on resize). Scrolling runs none of
 * it -- the reveal itself is pure CSS reading one variable the engine already
 * updates.
 */
function useChapterCopyLayer() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".scroll-scrub");
    const stage = root?.querySelector<HTMLElement>(".scroll-scrub__stage");
    if (!root || !stage) {
      return;
    }

    const splitTitle = (title: HTMLElement, withCrown: boolean) => {
      if (title.dataset.wordsSplit === "true") {
        return;
      }
      const words = (title.textContent ?? "").trim().split(/\s+/);
      if (words.length < 2) {
        return;
      }

      const fragment = document.createDocumentFragment();
      words.forEach((word, index) => {
        const span = document.createElement("span");
        span.className = "ss-word";
        span.style.setProperty("--i", String(index));

        // The opening headline's last word wears the king's crown on its
        // final letter, so that letter gets a span of its own to hang it
        // from. Only the first chapter is crowned: repeated on every
        // headline the crown stops being a symbol and becomes decoration.
        if (withCrown && index === words.length - 1 && word.length > 1) {
          const characters = [...word];
          const last = characters.pop() ?? "";
          span.append(characters.join(""));
          const crowned = document.createElement("span");
          crowned.className = "ss-crowned";
          crowned.textContent = last;
          span.append(crowned);
        } else {
          span.textContent = word;
        }

        fragment.append(span);
        if (index < words.length - 1) {
          const gap = document.createElement("span");
          gap.className = "ss-space";
          gap.textContent = " ";
          fragment.append(gap);
        }
      });

      title.style.setProperty("--word-count", String(words.length));
      title.replaceChildren(fragment);
      title.dataset.wordsSplit = "true";
    };

    // --- move the copy into the stage, once -------------------------------
    let layer = stage.querySelector<HTMLElement>(".ss-copy-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "ss-copy-layer";
      stage.append(layer);
    }

    let services = stage.querySelector<HTMLElement>(".ss-services");
    if (!services) {
      services = document.createElement("div");
      services.className = "ss-services";
      for (const [index, service] of SERVICES.entries()) {
        const mark = document.createElement("p");
        mark.className = "ss-service";
        mark.dataset.service = String(index);
        mark.textContent = service.label;
        services.append(mark);
      }
      stage.append(services);
    }

    const chapters = [
      ...root.querySelectorAll<HTMLElement>(".scroll-scrub__chapter"),
    ];

    chapters.forEach((chapter, index) => {
      const existing = layer.querySelector<HTMLElement>(
        `[data-chapter="${index}"]`,
      );
      if (existing) {
        return;
      }
      const copy = chapter.querySelector<HTMLElement>(".scroll-scrub__copy");
      if (!copy) {
        return;
      }
      const slot = document.createElement("div");
      slot.className = "ss-copy-slot";
      slot.dataset.chapter = String(index);
      slot.dataset.align = chapter.dataset.align ?? "left";
      slot.append(copy);
      layer.append(slot);

      const title = copy.querySelector<HTMLElement>(".scroll-scrub__title");
      if (title) {
        splitTitle(title, index === 0);
      }
    });

    // --- tell each block which stretch of the journey it owns --------------
    const measure = () => {
      const viewport = window.innerHeight;
      const rootTop = root.getBoundingClientRect().top + window.scrollY;

      // Mirror the engine's own denominator EXACTLY: it publishes
      // `--ss-progress` as (scroll - rootTop) / total, where total is the
      // bottom edge of the last band and the viewport is NOT subtracted.
      const bands = [
        ...root.querySelectorAll<HTMLElement>(".scroll-scrub__chapter"),
      ];
      const lastBand = bands.at(-1);
      if (!lastBand) {
        return;
      }
      const total = Math.max(
        lastBand.getBoundingClientRect().top +
          window.scrollY -
          rootTop +
          lastBand.offsetHeight,
        viewport,
      );

      const bandRange = (index: number) => {
        const band = bands[index];
        if (!band) {
          return null;
        }
        const top =
          band.getBoundingClientRect().top + window.scrollY - rootTop;
        return { from: top / total, to: (top + band.offsetHeight) / total };
      };

      SERVICES.forEach((service, index) => {
        const mark = services?.querySelector<HTMLElement>(
          `[data-service="${index}"]`,
        );
        const start = bandRange(service.first);
        const end = bandRange(service.last);
        if (!mark || !start || !end) {
          return;
        }
        const span = Math.max(end.to - start.from, 0.001);
        mark.style.setProperty("--from", String(start.from));
        mark.style.setProperty("--in-end", String(start.from + 0.04 * span));
        // The LAST service name has nothing to hand over to -- the journey
        // ends on it. Fading it across the final band left it at half
        // strength exactly where the visitor stops scrolling, so its fade is
        // pushed far past the end of the journey: it holds at full strength
        // to the last pixel.
        const isLast = index === SERVICES.length - 1;
        mark.style.setProperty(
          "--out-start",
          String(isLast ? 9 : end.to - 0.02 * span),
        );
        mark.style.setProperty(
          "--out-end",
          String(isLast ? 10 : end.to + 0.02 * span),
        );
      });

      bands.forEach((band, index) => {
        const slot = layer?.querySelector<HTMLElement>(
          `[data-chapter="${index}"]`,
        );
        if (!slot) {
          return;
        }

        // A chapter owns exactly its band: its clip runs 0..1 across it.
        const from = (band.getBoundingClientRect().top + window.scrollY - rootTop) / total;
        const to = from + band.offsetHeight / total;
        const span = Math.max(to - from, 0.001);

        slot.style.setProperty("--from", String(from));
        slot.style.setProperty("--to", String(to));
        slot.style.setProperty("--in-end", String(from + COPY.fadeIn * span));
        slot.style.setProperty("--out-start", String(from + COPY.holdTo * span));
        // The hand-over runs PAST the chapter's end on purpose: the copy is
        // still whole while its clip plays its final frame, and only then
        // crosses with the next chapter's copy coming in.
        slot.style.setProperty("--out-end", String(from + (COPY.holdTo + COPY.fadeOut) * span));

        const title = slot.querySelector<HTMLElement>(".scroll-scrub__title");
        if (title) {
          title.style.setProperty("--build-start", String(from + COPY.fadeIn * span));
          title.style.setProperty("--build-span", String((COPY.buildEnd - COPY.fadeIn) * span));
        }

        // The line beneath waits for the headline to finish. Reading order on
        // the page is top to bottom, so the words have to ARRIVE that way too:
        // a sentence sitting there while the headline above it is still
        // assembling reads backwards.
        const body = slot.querySelector<HTMLElement>(".scroll-scrub__body");
        if (body) {
          body.style.setProperty("--body-from", String(from + COPY.buildEnd * span));
          body.style.setProperty(
            "--body-to",
            String(from + (COPY.buildEnd + COPY.bodyFade) * span),
          );
        }
      });
    };

    // --- publish our own scroll progress ---------------------------------
    // The engine publishes `--ss-progress`, but it stops updating it in some
    // conditions (it sat at 0 on a touch viewport), which left every chapter's
    // copy computing as "not started" and so invisible. We derive it here
    // instead, from the same bands the engine scrubs against.
    //
    // The geometry is read fresh on every update rather than cached. A cached
    // measurement taken before the journey had finished laying out produced a
    // near-zero total, which pinned the progress at 1 and emptied the screen;
    // reading it live costs a layout per frame on three elements and simply
    // cannot go stale.
    const publish = () => {
      const viewport = window.innerHeight;
      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const allBands = [
        ...root.querySelectorAll<HTMLElement>(".scroll-scrub__chapter"),
      ];
      const lastBand = allBands.at(-1);
      if (!lastBand) {
        return;
      }
      const total =
        lastBand.getBoundingClientRect().top +
        window.scrollY -
        rootTop +
        lastBand.offsetHeight;
      if (total <= viewport) {
        return;
      }
      const p = Math.min(Math.max((window.scrollY - rootTop) / total, 0), 1);
      root.style.setProperty("--copy-progress", String(p));
    };

    // Deliberately NOT scheduled through requestAnimationFrame: a browser
    // stops serving animation frames to a page it considers hidden or
    // backgrounded, which froze the whole copy layer mid-journey. The scroll
    // event itself already arrives at most once per frame, so updating from it
    // directly is both cheap enough and immune to that.
    const schedule = () => {
      publish();
    };

    const remeasure = () => {
      measure();
      publish();
    };

    remeasure();

    // The bands only reach their real height once the engine has laid the
    // journey out, which happens after this effect first runs.
    const observer = new ResizeObserver(remeasure);
    observer.observe(root);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
    };
  }, []);
}

function Index() {
  useChapterCopyLayer();

  return (
    <>
      <SiteMenu />
      <main>
        <ScrollScrub scenes={scrollScrubScenes} theme={scrollScrubTheme} />
        <AfterFilm />
      </main>
    </>
  );
}
