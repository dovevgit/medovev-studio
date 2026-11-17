import { PhotoGallery } from "@/components/photo-gallery";
import { Reel } from "@/components/reel";
import { VoiceExtras } from "@/components/voice-extras";
import { AI_PICTURE, PODCAST_REELS, VIDEO_REELS, WEB_SHOWCASE } from "@/page-copy";

/**
 * The work itself, on the four service pages that have any to show.
 *
 * It goes above the prose, where the old site puts it: someone who came to
 * see whether the pictures are any good should not have to read eight
 * paragraphs first.
 */
export function ServiceMedia({ slug }: { slug: string }) {
  if (slug === "voice") {
    return <VoiceExtras />;
  }

  if (slug === "photo") {
    return <PhotoGallery />;
  }

  if (slug === "video") {
    return (
      <section className="page__showreel">
        <Reel eager id={VIDEO_REELS[0]} label="סרטון הדגמה" />
        <div className="showreel__links">
          <a
            className="showreel__yt"
            href={`https://youtu.be/${VIDEO_REELS[0]}`}
            rel="noreferrer"
            target="_blank"
          >
            לצפייה ביוטיוב
          </a>
        </div>
      </section>
    );
  }

  if (slug === "web") {
    return (
      <section className="page__showcase">
        {WEB_SHOWCASE.map((pic) => (
          <figure className="showcase" key={pic.src}>
            <img alt={pic.alt} height={pic.h} loading="lazy" src={pic.src} width={pic.w} />
          </figure>
        ))}
      </section>
    );
  }

  if (slug === "ai") {
    return (
      <section className="page__showcase">
        <figure className="showcase">
          <img
            alt={AI_PICTURE.alt}
            height={AI_PICTURE.h}
            src={AI_PICTURE.src}
            width={AI_PICTURE.w}
          />
        </figure>
      </section>
    );
  }

  if (slug === "podcast") {
    return (
      <section className="page__episodes">
        <div className="sponsors">
          {PODCAST_REELS.map((id, index) => (
            <Reel eager={index < 2} id={id} key={id} label="נגן פרק" />
          ))}
        </div>
      </section>
    );
  }

  return null;
}
