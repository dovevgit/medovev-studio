import { createFileRoute, useParams } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/page-placeholder";
import { SERVICES } from "@/site-content";

export const Route = createFileRoute("/services/$slug")({
  component: ServicePage,
});

function ServicePage() {
  const { slug } = useParams({ from: "/services/$slug" });
  const service = SERVICES.find((entry) => entry.slug === slug);

  // An unknown slug is still a service URL, so it gets the services heading
  // rather than a 404 -- the nine real ones are all that link here.
  return (
    <PagePlaceholder
      blurb={service?.blurb}
      eyebrow="שירות"
      title={service?.title ?? "השירותים שלנו"}
    />
  );
}
