import Link from "next/link";
import { blogPosts } from "./blog/_data/posts";
import { education, experience, links } from "./_data/resume";
import site from "@/components/site/site.module.css";
import list from "@/components/site/list.module.css";
import { ProjectReel } from "@/components/site/project-reel";
import { PostPreview } from "./_components/post-preview";
import styles from "./page.module.css";

// The grid holds the reel, six posts and the record. Older posts live on /blog.
const FEATURED_POSTS = 6;

export default function Home() {
  return (
    <main className={`${site.page} ${site.wide}`}>
      <section className={styles.intro}>
        <h1 className={styles.say}>
          I lead product and strategy at{" "}
          <a href="https://www.kovaak.com" target="_blank" rel="noreferrer">
            KovaaK Games
          </a>{" "}
          — roadmap, budgets, specs, and a fair share of the UI myself.
        </h1>
        <p className={`${styles.say} ${styles.soft}`}>
          On the side I’m building{" "}
          <a href="https://effortkeeper.com" target="_blank" rel="noreferrer">
            Effort Keeper
          </a>{" "}
          and writing about how interfaces move. Before games, I studied audio
          science and spent four years on studio gear at Stam Audio.
        </p>
        <ul className={styles.links}>
          {links.map((link) => {
            const external = link.href.startsWith("http");
            return (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={styles.link}
                  {...(external && { target: "_blank", rel: "noreferrer" })}
                >
                  {link.label}
                  {external && <span aria-hidden="true"> ↗</span>}
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.bench} aria-labelledby="work">
        <h2 id="work" className={styles.hidden}>
          Building and writing
        </h2>

        <article className={styles.feature}>
          <ProjectReel
            src={{
              light: "/work/effort-keeper/reel-light.mp4",
              dark: "/work/effort-keeper/reel-dark.mp4",
            }}
            label="Effort Keeper interface reel: one shape morphs through a loader, an effort row, a sheet that completes with confetti, a timer, a toggle, tabs, the Blossom colour picker, a stats grid, a command palette and a toast."
          />
          <div className={styles.caption}>
            <h3 className={styles.title}>
              <a href="https://effortkeeper.com" target="_blank" rel="noreferrer">
                Effort Keeper<span aria-hidden="true"> ↗</span>
              </a>
            </h3>
            <p className={styles.description}>
              A quota tracker for intentional effort. The reel is its interface
              and motion: one shape through the app’s controls, with the app’s
              own sounds.
            </p>
          </div>
        </article>

        {blogPosts.slice(0, FEATURED_POSTS).map((post) => (
          <article key={post.slug} className={styles.item}>
            <div
              className={styles.stage}
              role="group"
              aria-label={`Demo from “${post.title}”`}
            >
              <PostPreview slug={post.slug} fallback={post.description} />
            </div>
            <h3 className={styles.title}>
              <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
            </h3>
          </article>
        ))}

        <section className={styles.record} aria-labelledby="experience">
          <h3 id="experience" className={styles.title}>
            Experience
          </h3>
          <ul className={styles.rows}>
            {experience.map((job) => (
              <li key={`${job.role}-${job.years}`}>
                <span>
                  {job.role} <span className={styles.weak}>· {job.company}</span>
                </span>
                <span className={styles.weak}>{job.years}</span>
              </li>
            ))}
          </ul>
          <h3 className={`${styles.title} ${styles.subtitle}`}>Education</h3>
          <ul className={styles.rows}>
            {education.map((item) => (
              <li key={item.degree}>
                <span>
                  {item.degree} <span className={styles.weak}>· {item.school}</span>
                </span>
                <span className={styles.weak}>{item.years}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <div className={styles.after}>
        <Link href="/blog/" className={list.more}>
          All writing <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* The roles in detail open below the grid, so the grid never reflows. */}
      <details className={styles.full}>
        <summary className={styles.fullSummary}>
          What each role involved
          <Chevron />
        </summary>
        <ul className={`${list.list} ${styles.fullList}`}>
          {experience.map((job) => (
            <li key={`${job.role}-${job.years}`}>
              <details className={styles.job}>
                <summary className={`${list.row} ${list.interactive}`}>
                  <span className={list.primary}>
                    {job.role}
                    <span className={list.secondary}>{job.company}</span>
                  </span>
                  <span className={list.meta}>
                    {job.years}
                    <Chevron />
                  </span>
                </summary>
                <ul className={styles.highlights}>
                  {job.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </details>
    </main>
  );
}

function Chevron() {
  return (
    <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path
        d="M2 3.5 5 6.5 8 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
