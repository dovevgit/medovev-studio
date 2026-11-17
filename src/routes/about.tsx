import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/about")({
  component: () => (
    <PagePlaceholder
      blurb="מי עומד מאחורי הסטודיו."
      eyebrow="אודות"
      title="דובב גרינברג"
    />
  ),
});
