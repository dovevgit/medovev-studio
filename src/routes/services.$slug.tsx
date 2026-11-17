import { createFileRoute, useParams } from "@tanstack/react-router";

import { Cta, InnerPage, Lists, Prose, Steps } from "@/components/inner-page";
import { PagePlaceholder } from "@/components/page-placeholder";
import { ServiceMedia } from "@/components/service-media";
import { PHOTO_CHECKS, SERVICE_PAGES } from "@/page-copy";
import { serviceIcon } from "@/site-content";

export const Route = createFileRoute("/services/$slug")({
  component: ServicePage,
});

function ServicePage() {
  const { slug } = useParams({ from: "/services/$slug" });
  const page = SERVICE_PAGES[slug];

  // An unknown slug is still a service URL, so it gets the services heading
  // rather than a 404 -- the nine real ones are all that link here.
  if (!page) {
    return <PagePlaceholder eyebrow="שירות" title="השירותים שלנו" />;
  }

  return (
    <InnerPage
      eyebrow="השירותים שלנו"
      icon={serviceIcon(slug)}
      lead={page.lead}
      title={page.title}
    >
      {/* Four of the nine have work to show -- a showreel, a gallery,
          episodes, recordings -- and it goes above the prose, where the old
          site puts it. */}
      <ServiceMedia slug={slug} />
      <Prose paragraphs={page.body} />
      {/* The photo page keeps one more list -- what a shoot includes --
          outside its body copy on the old site, so it is carried separately
          rather than folded into the others. */}
      <Lists lists={slug === "photo" ? [...page.lists, PHOTO_CHECKS] : page.lists} />
      <Steps steps={page.steps} title="איך זה עובד" />
      <Cta back={{ href: "/#services", label: "לכל השירותים" }} cta={page.cta} />
    </InnerPage>
  );
}
