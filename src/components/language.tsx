import { useEffect, useState } from "react";

/**
 * Hebrew, English, Russian.
 *
 * The dictionaries carried over from the old site are keyed by the Hebrew
 * string itself -- `{"צילום": "Photography"}` -- not by an id in the markup.
 * That is what makes this cheap: the new site renders the same Hebrew, so the
 * same dictionary applies to it unchanged, and 94% of what is on the page is
 * already translated without anyone writing a line of it.
 *
 * So the translation is a pass over the rendered page rather than a thousand
 * call sites threaded through the components: walk the text nodes, swap the
 * ones the dictionary knows, and do the same for the attributes a reader
 * hears but does not see -- alt, aria-label, title, placeholder -- and for the
 * pre-written WhatsApp messages, so a message sent from the English site
 * arrives in English.
 *
 * The catch with doing that under React is that a re-render puts the Hebrew
 * back: open the menu, switch a gallery chapter, and that subtree is Hebrew
 * again. Hence the observer -- it re-runs the pass over whatever React has
 * just replaced. It disconnects while it works, or it would see its own
 * writing and call itself forever.
 *
 * A string with no translation stays in Hebrew, which is the right failure:
 * the reader sees a word they may not know rather than a gap where a word
 * should be.
 */

const LANGS = ["he", "en", "ru"] as const;
type Lang = (typeof LANGS)[number];

const NAMES: Record<Lang, string> = { he: "עברית", en: "English", ru: "Русский" };
const KEY = "lang";
const HEBREW = /[֐-׿]/;

/** Marks a node this pass has already dealt with, so it is not re-examined. */
const DONE = "__dgLang";

type Dict = Record<string, string>;
const cache = new Map<Lang, Dict>();

async function dictionary(lang: Lang): Promise<Dict> {
  const held = cache.get(lang);
  if (held) {
    return held;
  }
  // Loaded only when a language is chosen: the dictionaries are a quarter of
  // a megabyte each and most visitors read Hebrew.
  const loaded = (await (lang === "en"
    ? import("@/i18n/en.json")
    : import("@/i18n/ru.json"))) as { default: Dict };
  cache.set(lang, loaded.default);
  return loaded.default;
}

function saved(): Lang {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && (LANGS as readonly string[]).includes(q)) {
      localStorage.setItem(KEY, q);
    }
    const v = localStorage.getItem(KEY);
    return (LANGS as readonly string[]).includes(v ?? "") ? (v as Lang) : "he";
  } catch {
    return "he";
  }
}

function translateIn(root: Node, dict: Dict) {
  const look = (s: string) => dict[s.replace(/\s+/g, " ").trim()];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, .lang-pick")) {
        return NodeFilter.FILTER_REJECT;
      }
      return HEBREW.test(node.nodeValue ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const texts: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    texts.push(node as Text);
    node = walker.nextNode();
  }
  for (const text of texts) {
    const value = text.nodeValue ?? "";
    const hit = look(value);
    if (hit) {
      // Keep whatever space sat around the original: the markup relies on it
      // to separate inline pieces.
      text.nodeValue = (/^\s/.test(value) ? " " : "") + hit + (/\s$/.test(value) ? " " : "");
    }
  }

  const scope = root instanceof Element ? root : document.body;
  for (const attr of ["alt", "aria-label", "title", "placeholder"]) {
    for (const el of scope.querySelectorAll(`[${attr}]`)) {
      if (el.closest(".lang-pick")) {
        continue;
      }
      const value = el.getAttribute(attr) ?? "";
      const hit = HEBREW.test(value) ? look(value) : undefined;
      if (hit) {
        el.setAttribute(attr, hit);
      }
    }
  }

  // The pre-written WhatsApp message, so a message sent from the English
  // page arrives in English rather than in Hebrew the sender cannot read.
  for (const link of scope.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"]')) {
    try {
      const url = new URL(link.href);
      const text = url.searchParams.get("text");
      const hit = text ? look(text) : undefined;
      if (hit) {
        url.searchParams.set("text", hit);
        link.href = url.toString();
      }
    } catch {
      // A malformed link is not worth failing the page over.
    }
  }
}

function translateHead(dict: Dict) {
  const look = (s: string) => dict[s.replace(/\s+/g, " ").trim()];
  const title = look(document.title);
  if (title) {
    document.title = title;
  }
  for (const meta of document.querySelectorAll<HTMLMetaElement>(
    'meta[name="description"], meta[property^="og:"]',
  )) {
    const value = meta.content;
    const hit = HEBREW.test(value) ? look(value) : undefined;
    if (hit) {
      meta.content = hit;
    }
  }
}

export function LanguagePicker() {
  const [lang, setLang] = useState<Lang>("he");

  // Hebrew on the server and on the first client render, so the markup
  // matches and hydration has nothing to complain about; the saved choice
  // arrives a tick later.
  useEffect(() => setLang(saved()), []);

  useEffect(() => {
    const root = document.documentElement;
    if (lang === "he") {
      root.lang = "he";
      root.dir = "rtl";
      return;
    }

    let live = true;
    let observer: MutationObserver | undefined;

    void dictionary(lang).then((dict) => {
      if (!live) {
        return;
      }
      root.lang = lang;
      root.dir = "ltr";
      translateHead(dict);
      translateIn(document.body, dict);

      // React puts the Hebrew back whenever it re-renders a subtree -- the
      // menu opening, a gallery chapter changing. Translate what it just
      // wrote. Disconnected while working, or it would see its own writing.
      observer = new MutationObserver((records) => {
        observer?.disconnect();
        for (const record of records) {
          for (const added of record.addedNodes) {
            if (added.nodeType === Node.ELEMENT_NODE || added.nodeType === Node.TEXT_NODE) {
              translateIn(added.parentNode ?? added, dict);
            }
          }
          if (record.type === "characterData" && record.target.parentNode) {
            translateIn(record.target.parentNode, dict);
          }
        }
        observer?.observe(document.body, {
          characterData: true,
          childList: true,
          subtree: true,
        });
      });
      observer.observe(document.body, { characterData: true, childList: true, subtree: true });
    });

    return () => {
      live = false;
      observer?.disconnect();
    };
  }, [lang]);

  const choose = (next: Lang) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // A browser that refuses to remember still gets the switch; it just
      // forgets it on the next page.
    }
    // A full load rather than a state change: going back to Hebrew means
    // undoing a pass over the whole document, and the shortest correct way
    // to undo it is to render the page again from its own markup.
    const url = new URL(location.href);
    url.searchParams.delete("lang");
    location.href = url.toString();
  };

  return (
    <div aria-label="Language" className="lang-pick" role="group">
      {LANGS.map((code) => (
        <button
          aria-current={lang === code ? "true" : undefined}
          aria-label={NAMES[code]}
          className="lang-pick__btn"
          key={code}
          lang={code}
          onClick={() => choose(code)}
          type="button"
        >
          <Flag code={code} />
          <span>{NAMES[code]}</span>
        </button>
      ))}
    </div>
  );
}

function Flag({ code }: { code: Lang }) {
  if (code === "he") {
    return (
      <svg aria-hidden="true" viewBox="0 0 22 16">
        <rect fill="#fff" height="16" width="22" />
        <rect fill="#0038b8" height="2.4" width="22" y="2" />
        <rect fill="#0038b8" height="2.4" width="22" y="11.6" />
        <path
          d="M11 4.9 13.6 9.4H8.4zM11 11.1 8.4 6.6H13.6z"
          fill="none"
          stroke="#0038b8"
          strokeWidth=".9"
        />
      </svg>
    );
  }
  if (code === "en") {
    return (
      <svg aria-hidden="true" viewBox="0 0 22 16">
        <rect fill="#012169" height="16" width="22" />
        <path d="M0 0 22 16M22 0 0 16" stroke="#fff" strokeWidth="3.2" />
        <path d="M0 0 22 16M22 0 0 16" stroke="#c8102e" strokeWidth="1.3" />
        <path d="M11 0v16M0 8h22" stroke="#fff" strokeWidth="5.2" />
        <path d="M11 0v16M0 8h22" stroke="#c8102e" strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 22 16">
      <rect fill="#fff" height="16" width="22" />
      <rect fill="#0039a6" height="5.34" width="22" y="5.33" />
      <rect fill="#d52b1e" height="5.33" width="22" y="10.67" />
    </svg>
  );
}
