import { createFileRoute, useParams } from "@tanstack/react-router";

import { Cta, InnerPage } from "@/components/inner-page";
import { PagePlaceholder } from "@/components/page-placeholder";
import { ARTICLE_PAGES } from "@/page-copy";

export const Route = createFileRoute("/articles/$slug")({
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = useParams({ from: "/articles/$slug" });
  const page = ARTICLE_PAGES[slug];

  if (!page) {
    return <PagePlaceholder eyebrow="מאמרים" title="מאמרים" />;
  }

  return (
    <InnerPage eyebrow="מאמרים" title={page.title}>
      <p className="page__byline">{page.meta}</p>
      <article className="page__prose">
        {page.blocks.map((block, index) => {
          // The key is the index: an article is a fixed list that is never
          // reordered, and two paragraphs can legitimately read alike.
          const key = `${block.kind}-${index}`;
          if (block.kind === "heading") {
            return (
              <h2 className="page__h2" key={key}>
                {block.text}
              </h2>
            );
          }
          if (block.kind === "quote") {
            return (
              <blockquote className="page-quote" key={key}>
                {block.text}
              </blockquote>
            );
          }
          if (block.kind === "list") {
            return (
              <ul className="page-bullets" key={key}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          }
          return <p key={key}>{block.text}</p>;
        })}
      </article>
      <Cta back={{ href: "/articles", label: "לכל המאמרים" }} cta={page.cta} />
    </InnerPage>
  );
}
