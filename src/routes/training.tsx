import { createFileRoute } from "@tanstack/react-router";

import { Cta, InnerPage, Lists, Prose } from "@/components/inner-page";
import { TRAINING, TRAINING_PICTURE } from "@/page-copy";

export const Route = createFileRoute("/training")({
  component: TrainingPage,
});

function TrainingPage() {
  return (
    <InnerPage eyebrow={TRAINING.eyebrow} lead={TRAINING.lead} title={TRAINING.title}>
      <figure className="page__figure">
        <img
          alt={TRAINING_PICTURE.alt}
          height={TRAINING_PICTURE.h}
          src={TRAINING_PICTURE.src}
          width={TRAINING_PICTURE.w}
        />
      </figure>
      {/* The last paragraph closes the page, after the lists, which is where
          the old site puts it -- running every paragraph together above them
          would have ended the prose on an invitation nobody had the details
          for yet. */}
      <Prose paragraphs={TRAINING.body.slice(0, -1)} />
      <Lists lists={TRAINING.lists} />
      <Prose paragraphs={TRAINING.body.slice(-1)} />
      <section className="page__prose">
        <a className="page-link" href={TRAINING.link.href}>
          {TRAINING.link.label}
        </a>
      </section>
      <Cta back={{ href: "/", label: "חזרה לדף הבית" }} cta={TRAINING.cta} />
    </InnerPage>
  );
}
