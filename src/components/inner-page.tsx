import type { ReactNode } from "react";

import { SiteMenu } from "@/components/site-menu";
import type { CopyCta, CopyList, CopyStep } from "@/page-copy";
import { WHATSAPP_CONSULT, WHATSAPP_HELLO } from "@/site-content";

/**
 * The frame every inner page is built from.
 *
 * The home page is a film; these are reading. So they keep the site's dark
 * wood and gilt but drop the motion: a headline, a column of prose set at a
 * width the eye can track, and the lists and steps raised onto cards so the
 * page can be skimmed as well as read.
 *
 * The pieces here are the ones the old site repeats on every inner page --
 * the intro, the bulleted lists, the numbered steps and the closing card --
 * so each page is a short file that supplies copy rather than layout.
 */

export function InnerPage({
  children,
  eyebrow,
  lead,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  lead?: string;
  title: string;
}) {
  return (
    <>
      <SiteMenu />
      <main className="page">
        <header className="page__intro">
          <p className="page__eyebrow">{eyebrow}</p>
          <h1 className="page__title">{title}</h1>
          {lead ? <p className="page__lead">{lead}</p> : null}
        </header>
        {children}
      </main>
    </>
  );
}

/** The run of prose. Paragraphs come through in the order the old site set. */
export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <section className="page__prose">
      {paragraphs.map((text) => (
        <p key={text.slice(0, 40)}>{text}</p>
      ))}
    </section>
  );
}

/**
 * The bulleted lists: what a service includes, who it suits, and the
 * questions that keep coming up.
 *
 * Side by side where there is room. The old site stacks them, but they are
 * short and they answer different questions, so a reader comparing them
 * should not have to scroll between them.
 */
export function Lists({ lists }: { lists: CopyList[] }) {
  if (lists.length === 0) {
    return null;
  }
  return (
    <section className="page__lists">
      {lists.map((list) => (
        <div className="page-list" key={list.heading}>
          <h2 className="page-list__head">{list.heading}</h2>
          <ul className="page-list__items">
            {list.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/** The numbered walk-through. The numerals are the old site's own. */
export function Steps({ steps, title }: { steps: CopyStep[]; title: string }) {
  if (steps.length === 0) {
    return null;
  }
  return (
    <section className="page__steps">
      <h2 className="page__h2">{title}</h2>
      <ol className="steps">
        {steps.map((step) => (
          <li className="step" key={step.num + step.title}>
            <span aria-hidden="true" className="step__num">
              {step.num}
            </span>
            <div className="step__body">
              <h3 className="step__title">{step.title}</h3>
              <p className="step__text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * The closing card. Both openers are the old site's own pre-written WhatsApp
 * messages, so a message that lands on the phone reads the way it always has.
 */
export function Cta({ back, cta }: { back?: { href: string; label: string }; cta: CopyCta }) {
  return (
    <section className="page__cta">
      <div className="page-cta">
        <h2 className="page-cta__title">{cta.title}</h2>
        {cta.text ? <p className="page-cta__text">{cta.text}</p> : null}
        <div className="page-cta__actions">
          <a
            className="page-cta__primary"
            href={WHATSAPP_CONSULT}
            rel="noreferrer"
            target="_blank"
          >
            קביעת שיחת ייעוץ
          </a>
          <a
            className="page-cta__secondary"
            href={WHATSAPP_HELLO}
            rel="noreferrer"
            target="_blank"
          >
            דברו איתנו בווטסאפ
          </a>
        </div>
        {back ? (
          <a className="page-cta__back" href={back.href}>
            {back.label}
          </a>
        ) : null}
      </div>
    </section>
  );
}
