import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/training")({
  component: () => <PagePlaceholder eyebrow="הדרכות" title="הדרכות" />,
});
