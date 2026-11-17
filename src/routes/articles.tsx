import { createFileRoute } from "@tanstack/react-router";

import { InnerPage } from "@/components/inner-page";
import { ARTICLES } from "@/page-copy";

export const Route = createFileRoute("/articles")({
  component: ArticlesPage,
});

function ArticlesPage() {
  return (
    <InnerPage eyebrow={ARTICLES.eyebrow} lead={ARTICLES.lead} title={ARTICLES.title}>
      <section className="page__articles">
        <ul className="art-list">
          {ARTICLES.items.map((item) => (
            <li key={item.href}>
              <a className="art-card" href={item.href}>
                <span className="art-card__meta">{item.meta}</span>
                <strong className="art-card__title">{item.title}</strong>
                <span className="art-card__blurb">{item.blurb}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </InnerPage>
  );
}
