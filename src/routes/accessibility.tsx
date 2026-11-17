import { createFileRoute } from "@tanstack/react-router";

import { InnerPage } from "@/components/inner-page";
import { ACCESSIBILITY } from "@/page-copy";

export const Route = createFileRoute("/accessibility")({
  component: AccessibilityPage,
});

function AccessibilityPage() {
  return (
    <InnerPage
      eyebrow={ACCESSIBILITY.eyebrow}
      lead={ACCESSIBILITY.lead}
      title={ACCESSIBILITY.title}
    >
      <section className="page__prose">
        {ACCESSIBILITY.sections.map((section) => (
          <article className="page-part" key={section.heading}>
            <h2 className="page__h2">{section.heading}</h2>
            {section.body.map((text) => (
              <p key={text.slice(0, 40)}>{text}</p>
            ))}
          </article>
        ))}
        <p className="page__updated">{ACCESSIBILITY.updated}</p>
        <a className="page-link" href="/">
          לדף הבית
        </a>
      </section>
    </InnerPage>
  );
}
