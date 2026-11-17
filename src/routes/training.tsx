import { createFileRoute } from "@tanstack/react-router";

import { Cta, InnerPage, Lists, Prose } from "@/components/inner-page";
import { TRAINING } from "@/page-copy";

export const Route = createFileRoute("/training")({
  component: TrainingPage,
});

function TrainingPage() {
  return (
    <InnerPage eyebrow={TRAINING.eyebrow} lead={TRAINING.lead} title={TRAINING.title}>
      <Prose paragraphs={TRAINING.body} />
      <Lists lists={TRAINING.lists} />
      <section className="page__prose">
        <a className="page-link" href={TRAINING.link.href}>
          {TRAINING.link.label}
        </a>
      </section>
      <Cta back={{ href: "/", label: "חזרה לדף הבית" }} cta={TRAINING.cta} />
    </InnerPage>
  );
}
