import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/articles")({
  component: () => <PagePlaceholder eyebrow="מאמרים" title="מאמרים" />,
});
