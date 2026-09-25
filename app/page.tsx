import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { blogPosts } from "./blog/_data/posts";
import { education, experience, links } from "./_data/resume";
import site from "@/components/site/site.module.css";
import list from "@/components/site/list.module.css";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={site.page}>
      <section>
        <h1 className={styles.headline}>
          Head of Product & Strategy at KovaaK Games.
        </h1>
        <p className={styles.lede}>
          I guide roadmap, design, development, budgets, and day-to-day
          execution, and stay hands-on across UI/UX, feature specs,
          prototyping, and implementation.
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

      <section className={styles.section} aria-labelledby="experience">
        <h2 id="experience" className={list.heading}>
          Experience
        </h2>
        <ul className={list.list}>
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
                    <svg
                      className={styles.chevron}
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 3.5 5 6.5 8 3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
      </section>

      <section className={styles.section} aria-labelledby="writing">
        <h2 id="writing" className={list.heading}>
          Writing
        </h2>
        <ul className={list.list}>
          {blogPosts.slice(0, 4).map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}/`}
                className={`${list.row} ${list.interactive}`}
              >
                <span className={list.primary}>{post.title}</span>
                <time className={list.meta} dateTime={post.date}>
                  {formatDate(post.date, "short")}
                </time>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/blog/" className={list.more}>
          All writing <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className={styles.section} aria-labelledby="education">
        <h2 id="education" className={list.heading}>
          Education
        </h2>
        <ul className={list.list}>
          {education.map((item) => (
            <li key={item.degree} className={list.row}>
              <span className={list.primary}>
                {item.degree}
                <span className={list.secondary}>{item.school}</span>
              </span>
              <span className={list.meta}>{item.years}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
