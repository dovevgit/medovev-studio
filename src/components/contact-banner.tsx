import { type FormEvent, useState } from "react";

type Status = { kind: "error" | "ok"; text: string } | null;

const SAID = {
  // Said when a bot fills the hidden field: the same polite nothing the real
  // form gives it, so the demonstration behaves the way the real one does.
  ok: "תודה, קיבלנו. נחזור אליך בהקדם.",
  // Said to everyone else. This is a portfolio piece, so the form shows what
  // sending feels like and says plainly that it kept nothing -- a form that
  // answers "we will get back to you" and then does not is a small lie told
  // to whoever tried it.
  demo: "הטופס עובד — זהו אתר להצגה, אז הפרטים לא נשמרו ולא נשלחו לאיש.",
  invalid: "נא לבדוק את השם, הטלפון והמייל",
  missing: "נא למלא שם וטלפון תקין",
};

/**
 * The contact form, written on the herald's banner.
 *
 * The cloth is three pictures rather than one -- horn and swag, a single
 * repeating row of velvet, then the gold border and fringe -- so it grows to
 * whatever height the form needs. A form is tall and a banner is a fixed
 * shape, and on a phone the whole picture would be 195px with about 130 of
 * cloth inside it: nowhere near four fields. See the stylesheet for how the
 * three layers meet.
 *
 * Where it goes when you press send: NOWHERE. This site is a demonstration,
 * not the studio's own site, so the form shows what sending feels like and
 * stores nothing. It used to post to the live /api/contact, which writes to
 * the real leads table -- a public demo wired into a production inbox turns
 * every person trying the form into a lead somebody has to answer.
 *
 * The endpoint is gone from the repository too, rather than merely unused:
 * a live write path into the studio's database has no business sitting on a
 * demonstration site, called or not.
 */
export function ContactBanner() {
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (field: string) => String(data.get(field) ?? "").trim();

    const body = {
      email: read("email"),
      message: read("message"),
      name: read("name"),
      phone: read("phone"),
      // A bot fills every field it is given; a person never sees this one,
      // and the endpoint answers a filled one with a polite nothing.
      website: read("website"),
    };

    if (!body.name || body.phone.replace(/\D/g, "").length < 9) {
      setStatus({ kind: "error", text: SAID.missing });
      return;
    }

    // The honeypot still decides, so the demonstration behaves the way the
    // real form does for a bot: a polite nothing.
    setStatus(null);
    setSending(true);
    await new Promise((done) => setTimeout(done, 450));
    form.reset();
    setStatus({ kind: "ok", text: body.website ? SAID.ok : SAID.demo });
    setSending(false);
  };

  return (
    <section className="contact" id="contact">
      <header className="contact__head">
        <p className="contact__eyebrow">צור קשר</p>
        <h2 className="contact__title">השאירו פרטים ונחזור אליכם</h2>
      </header>

      <div className="contact__cloth">
        <p className="contact__lede">
          ספרו לנו בקצרה מה אתם מחפשים, ונחזור אליכם בהקדם.
        </p>

        <form className="contact__form" noValidate onSubmit={onSubmit}>
          <div className="contact__row">
            <label className="contact__field">
              <span>שם</span>
              <input
                autoComplete="name"
                name="name"
                placeholder="איך קוראים לך?"
                type="text"
              />
            </label>

            <label className="contact__field">
              <span>טלפון</span>
              <input
                autoComplete="tel"
                inputMode="tel"
                name="phone"
                placeholder="050-0000000"
                type="tel"
              />
            </label>
          </div>

          <label className="contact__field">
            <span>מייל (לא חובה)</span>
            <input
              autoComplete="email"
              name="email"
              placeholder="name@example.com"
              type="email"
            />
          </label>

          <label className="contact__field">
            <span>הודעה (לא חובה)</span>
            <textarea name="message" placeholder="במה נוכל לעזור?" rows={3} />
          </label>

          {/* The spam trap the old site uses, kept with the same name. */}
          <input
            aria-hidden="true"
            autoComplete="off"
            className="contact__trap"
            name="website"
            tabIndex={-1}
            type="text"
          />

          <div className="contact__send">
            <button className="contact__submit" disabled={sending} type="submit">
              {sending ? "שולח…" : "שליחה"}
            </button>
            <p
              aria-live="polite"
              className="contact__status"
              data-kind={status?.kind}
            >
              {status?.text}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
