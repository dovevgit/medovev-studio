import type { CSSProperties, ReactNode } from "react";

/**
 * Where the open parchment sits on one piece of art, as percentages of the
 * picture's own box.
 *
 * Every scroll is a different photograph of a different torn edge, so none of
 * them opens at the same place. The field is measured off each file -- the
 * run of pixels that are bright, green enough not to be the wooden rollers
 * and blue enough not to be the gold -- and the text is laid inside it.
 */
export type Field = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

type Props = {
  /** Buttons, rendered under the scroll rather than on it: the parchment has
   *  room for words, not for words and controls both. */
  actions?: ReactNode;
  art: string;
  artHeight: number;
  artWidth: number;
  field: Field;
  line: string;
  title: string;
  /** Three across on a desktop, or one across the page. */
  wide?: boolean;
};

export function ScrollCard({
  actions,
  art,
  artHeight,
  artWidth,
  field,
  line,
  title,
  wide,
}: Props) {
  const placement = {
    "--field-bottom": `${field.bottom}%`,
    "--field-left": `${field.left}%`,
    "--field-right": `${field.right}%`,
    "--field-top": `${field.top}%`,
  } as CSSProperties;

  return (
    <article className="scroll-card" data-wide={wide || undefined}>
      <div className="scroll-card__stage">
        <img
          alt=""
          className="scroll-card__art"
          height={artHeight}
          src={art}
          width={artWidth}
        />
        <div className="scroll-card__text" style={placement}>
          <h3 className="scroll-card__title">{title}</h3>
          <p className="scroll-card__line">{line}</p>
        </div>
      </div>

      {actions ? <div className="scroll-card__actions">{actions}</div> : null}
    </article>
  );
}
