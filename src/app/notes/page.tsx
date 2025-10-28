import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { NoteList } from "@/components/notes/NoteList";
import { getNotes } from "@/lib/notes";
import type { Metadata } from "next";

const BASE_PATH = "/notes";

export const metadata: Metadata = {
  title: "Notes | Paula Livingstone",
  description: "Short observations and technical reflections.",
  alternates: {
    canonical: BASE_PATH,
  },
  openGraph: {
    title: "Notes",
    description: "Short observations and technical reflections.",
    url: BASE_PATH,
    images: [
      {
        url: "/window.svg",
        width: 1200,
        height: 630,
        alt: "Paula Livingstone window mark",
      },
    ],
  },
  twitter: {
    title: "Notes",
    description: "Short observations and technical reflections.",
    images: ["/window.svg"],
  },
};

export default async function NotesIndexPage() {
  const notes = await getNotes({ includeDrafts: false });

  return (
    <PageShell as="main" className="u-pad-block-3xl">
      <section className="u-stack u-gap-2xl">
        <MotionFade>
          <header className="u-stack u-gap-sm u-max-w-md">
            <h1 className="u-heading-display">Notes</h1>
            <p className="u-text-lead">
              Short, self-contained updates from the workbench&mdash;less formal
              than essays, still public by default.
            </p>
          </header>
        </MotionFade>

        <MotionFade delay={0.05}>
          <NoteList notes={notes} />
        </MotionFade>
      </section>
    </PageShell>
  );
}
