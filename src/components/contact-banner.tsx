import { type FormEvent, useState } from "react";

type Status = { kind: "error" | "ok"; text: string } | null;

const SAID = {
  error: "משהו השתבש, נסו שוב או כתבו לנו בוואטסאפ.",
  invalid: "נא לבדוק את השם, הטלפון והמייל",
  limit: "פנית אלינו כבר כמה פעמים היום. אפשר לכתוב לנו בוואטסאפ.",
  missing: "נא למלא שם וטלפון תקין",
  ok: "תודה, קיבלנו. נחזור אליך בהקדם.",
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
 * Where it goes when you press send: `/api/contact`, the same endpoint the
 * old site uses, carried over with it. It writes the lead to the leads
 * screen in the business-management system and, when the two Resend values
 * are set in the environment, sends the notification email as well.
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

    setStatus(null);
    setSending(true);

    try {
      const answer = await fetch("/api/contact", {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await answer.json()) as { ok?: boolean; reason?: string };

      if (result.ok) {
        form.reset();
        setStatus({ kind: "ok", text: SAID.ok });
        return;
      }

      const reason = result.reason === "limit" || result.reason === "invalid"
        ? result.reason
        : "error";
      setStatus({ kind: "error", text: SAID[reason] });
    } catch {
      setStatus({ kind: "error", text: SAID.error });
    } finally {
      setSending(false);
    }
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
