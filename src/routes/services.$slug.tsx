import { createFileRoute, useParams } from "@tanstack/react-router";

import { Cta, InnerPage, Lists, Prose, Steps } from "@/components/inner-page";
import { PagePlaceholder } from "@/components/page-placeholder";
import { SERVICE_PAGES } from "@/page-copy";

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
    <InnerPage eyebrow="השירותים שלנו" lead={page.lead} title={page.title}>
      <Prose paragraphs={page.body} />
      <Lists lists={page.lists} />
      <Steps steps={page.steps} title="איך זה עובד" />
      <Cta back={{ href: "/#services", label: "לכל השירותים" }} cta={page.cta} />
    </InnerPage>
  );
}
