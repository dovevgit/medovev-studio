/**
 * A service presented as one of the film's own banners.
 *
 * The artwork is a single cut-out: the hanging cloth, its gold frame and
 * fringe, and the fallen king lying across the lower edge — half on the
 * cloth, half off it. It carries no lettering of its own.
 *
 * The words are live HTML laid over the cloth, not drawn into the picture.
 * That is the lesson the film taught twice over: live text stays sharp at
 * every size, costs nothing to reword, and is there for a crawler to read.
 *
 * Where the text sits was measured, not eyeballed. The clear run of velvet —
 * the part no gold ornament and no king overlaps — starts 31% across the
 * image and ends at 95%, and runs from 10% down to 73%. The box below sits
 * inside that, with room to spare. Re-measure if the artwork is ever
 * replaced.
 */
export function FlagCard({
  title,
  line,
  cta,
  href,
  art,
  artWidth,
  artHeight,
}: {
  title: string;
  line: string;
  cta: string;
  href: string;
  art: string;
  artWidth: number;
  artHeight: number;
}) {
  return (
    <article className="flag-card">
      <img
        alt=""
        className="flag-card__art"
        height={artHeight}
        src={art}
        width={artWidth}
      />
      <div className="flag-card__text">
        <h3 className="flag-card__title">{title}</h3>
        <p className="flag-card__line">{line}</p>
        <a className="flag-card__cta" href={href}>
          {cta}
        </a>
      </div>
    </article>
  );
}
