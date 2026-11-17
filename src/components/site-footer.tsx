/**
 * The credit line, on every page.
 *
 * It lives in the root route rather than in each page, so it appears once
 * per document and a page added later gets it without anyone remembering
 * to. It carries its own near-black so it reads as a deliberate closing bar
 * on both the home page, which ends on pale wood, and the inner pages,
 * which end in the dark.
 */
export function SiteFooter() {
  return (
    <footer className="site-foot">
      <p className="site-foot__line">נבנה על ידי דובב גרינברג</p>
    </footer>
  );
}
