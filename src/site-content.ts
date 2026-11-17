/**
 * The site's own map: the pages it has, and the nine services it sells.
 *
 * Every word here is the studio's own, taken from medovev.com rather than
 * written fresh, so the new site says what the old one says. Keep it that
 * way: this file is content, not copywriting.
 *
 * One list feeds three places -- the cards beneath the film, the menu, and
 * each service page's own heading -- so a service is renamed in one edit.
 */

export type ServiceEntry = {
  /** Last segment of the URL, matching the original site's paths. */
  slug: string;
  title: string;
  /** The one line the original site shows under the title. */
  blurb: string;
};

export const SERVICES: ServiceEntry[] = [
  {
    blurb: "הבנה עמוקה של העסק והמלצות לפעולה",
    slug: "strategy",
    title: "סטודיו לאסטרטגיה עסקית",
  },
  {
    blurb: "מה שלקוח מוצא כשהוא מחפש אתכם",
    slug: "digital",
    title: "נוכחות דיגיטלית",
  },
  {
    blurb: "אפיון, עיצוב ובנייה",
    slug: "web",
    title: "אתרים, אפליקציות ומערכות תוכן",
  },
  {
    blurb: "צ'אטבוט, סוכן AI ואוטומציה",
    slug: "ai",
    title: "פתרונות AI מתקדמים",
  },
  {
    blurb: "הדרכה והטמעת תהליכים בארגון",
    slug: "implementer",
    title: "מיישם AI לארגונים ולעסקים",
  },
  {
    blurb: "מקונספט ועד סרט מוגמר",
    slug: "video",
    title: "הפקת וידאו",
  },
  {
    blurb: "נכסים, מוצרים ותדמית",
    slug: "photo",
    title: "צילום",
  },
  {
    blurb: "אפיון, הפקה וחיתוכים",
    slug: "podcast",
    title: "פודקאסטים",
  },
  {
    blurb: "הקריין המושמע ביותר בישראל",
    slug: "voice",
    title: "קריינות מקצועית",
  },
];

export type MenuLink = {
  label: string;
  href: string;
  /** Leaves the site, so it opens in a new tab and says so to a screen reader. */
  external?: boolean;
};

/** The pages that are not services. */
export const PAGES: MenuLink[] = [
  { href: "/", label: "דף הבית" },
  { href: "/about", label: "אודות" },
  { href: "/training", label: "הדרכות" },
  { href: "/articles", label: "מאמרים" },
];

export const SERVICE_LINKS: MenuLink[] = SERVICES.map((service) => ({
  href: `/services/${service.slug}`,
  label: service.title,
}));

export const ELSEWHERE: MenuLink[] = [
  {
    external: true,
    href: "https://www.youtube.com/@Dovev-Greenberg",
    label: "ערוץ היוטיוב",
  },
  {
    external: true,
    href: "https://www.medovev.co.il/",
    label: "אתר הקריינות",
  },
];

export const WHATSAPP_URL = "https://wa.me/972545008001";

/**
 * The two WhatsApp openers the old site uses, carried over word for word so
 * a message that lands on the phone reads the same as it always has.
 */
export const WHATSAPP_HELLO =
  "https://wa.me/972545008001?text=%D7%A9%D7%9C%D7%95%D7%9D%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%9E%D7%94%D7%90%D7%AA%D7%A8%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A4%D7%A8%D7%98%D7%99%D7%9D.";
export const WHATSAPP_CONSULT =
  "https://wa.me/972545008001?text=%D7%A9%D7%9C%D7%95%D7%9D%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A7%D7%91%D7%95%D7%A2%20%D7%A9%D7%99%D7%97%D7%AA%20%D7%99%D7%99%D7%A2%D7%95%D7%A5.";
export const PHONE_NUMBER = "0545008001";
