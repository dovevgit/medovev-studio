import { createFileRoute } from "@tanstack/react-router";

import { Cta, InnerPage } from "@/components/inner-page";
import { ABOUT } from "@/page-copy";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <InnerPage eyebrow={ABOUT.eyebrow} lead={ABOUT.lead} title={ABOUT.title}>
      {/* The portrait, before anything else on the page. "About" is a page
          about a person, and a face answers more of that question in a
          glance than the four facts below it do in a sentence each. */}
      <figure className="portrait">
        <img
          alt="דובב גרינברג יושב על כס עץ מגולף ומחזיק פרש שחמט"
          className="portrait__img"
          height={900}
          src="/assets/about-portrait.webp"
          width={900}
        />
      </figure>

      {/* The four standing facts, before the prose: a visitor who reads
          nothing else should still come away with them. */}
      <section className="page__stats">
        <ul className="stats">
          {ABOUT.stats.map((stat) => (
            <li className="stats__item" key={stat.value}>
              <strong className="stats__value">{stat.value}</strong>
              <span className="stats__label">{stat.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="page__prose">
        {ABOUT.sections.map((section) => (
          <article className="page-part" key={section.heading}>
            <h2 className="page__h2">{section.heading}</h2>
            {section.body.map((text) => (
              <p key={text.slice(0, 40)}>{text}</p>
            ))}
            {section.quote ? (
              <blockquote className="page-quote">{section.quote}</blockquote>
            ) : null}
          </article>
        ))}
        <a className="page-link" href={ABOUT.link.href}>
          {ABOUT.link.label}
        </a>
      </section>

      <Cta back={{ href: "/", label: "חזרה לדף הבית" }} cta={ABOUT.cta} />
    </InnerPage>
  );
}
