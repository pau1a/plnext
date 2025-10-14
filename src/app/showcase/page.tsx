"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { NextSeo } from "next-seo";
import { useMemo, useState } from "react";
import Balancer from "react-wrap-balancer";

import "./_showcase.scss";

const capabilityCards = [
  {
    key: "motion",
    title: "Fluid Motion",
    description: "Framer Motion animates elements as visitors explore the page.",
  },
  {
    key: "themes",
    title: "Theme Aware",
    description: "next-themes stores preferences so light and dark designs persist.",
  },
  {
    key: "seo",
    title: "SEO Ready",
    description: "next-seo exposes Open Graph and Twitter tags per page.",
  },
];

const timelineItems = [
  { label: "Ideation", started: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
  { label: "Design Mock", started: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) },
  { label: "Prototype", started: new Date("2025-10-11T09:00:00Z") },
];

export default function ShowcasePage() {
  const [active, setActive] = useState(capabilityCards[0].key);
  const timeline = useMemo(
    () =>
      timelineItems.map((item) => ({
        ...item,
        formatted: format(item.started, "dd MMM yyyy"),
        relative: formatDistanceToNow(item.started, { addSuffix: true }),
      })),
    []
  );

  return (
    <>
      {/* Page-level override demonstrates next-seo's <NextSeo /> API. */}
      <NextSeo
        title="Enhancements Demo"
        description="A sandbox page that highlights motion, theming, SEO, balanced typography, and time formatting."
        openGraph={{
          title: "Enhancements Demo",
          description:
            "A sandbox page that highlights motion, theming, SEO, balanced typography, and time formatting.",
          url: "https://example.com/showcase",
        }}
      />
      <div className="showcase-page py-4 py-lg-5">
        <motion.section
          className="hero text-center mb-5"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="badge rounded-pill text-bg-primary mb-3">Enhancements Demo</span>
          <h1 className="display-4 fw-bold">
            {/* Balancer evens out the hero headline. */}
            <Balancer>Explore freshly installed libraries through an immersive product vignette.</Balancer>
          </h1>
          <p className="lead mx-auto mb-4 col-12 col-lg-8">
            {/* Balancer also tidies multi-line body copy. */}
            <Balancer>
              Framer Motion, next-themes, clsx, react-wrap-balancer, next-seo, and date-fns combine to
              produce polished storytelling moments without leaving the Next.js ecosystem.
            </Balancer>
          </p>
          {/* Framer Motion provides a hover scale for the CTA. */}
          <motion.a
            href="#capabilities"
            className="btn btn-lg showcase-cta"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
          >
            See the capabilities
          </motion.a>
        </motion.section>

        <section className="mb-5">
          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-lg-6">
              <div className="p-4 border rounded h-100">
                <h2 className="h4 mb-3">Balanced heading</h2>
                <p className="text-muted small mb-4">react-wrap-balancer keeps long lines visually even.</p>
                <p className="fs-3 fw-semibold">
                  <Balancer>Building resilient experiences that scale securely across every platform.</Balancer>
                </p>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="p-4 border rounded h-100">
                <h2 className="h4 mb-3">Unbalanced heading</h2>
                <p className="text-muted small mb-4">For comparison, the same copy without balancing.</p>
                <p className="fs-3 fw-semibold">
                  Building resilient experiences that scale securely across every platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        <motion.section
          id="capabilities"
          className="mb-5"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="row g-4">
            {capabilityCards.map((card) => (
              <div key={card.key} className="col-12 col-md-4">
                <motion.div
                  className={clsx("card showcase-card h-100", {
                    // clsx highlights the active card with a subtle glow.
                    "showcase-card-active": active === card.key,
                  })}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  onMouseEnter={() => setActive(card.key)}
                >
                  <div className="card-body">
                    <h3 className="h5 mb-2">{card.title}</h3>
                    <p className="mb-0 text-muted">{card.description}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.section>

        <section>
          <div className="row g-4">
            <div className="col-12 col-lg-5">
              <h2 className="h3 mb-3">Project timeline</h2>
              <p className="text-muted">
                date-fns formats exact dates alongside relative milestones for rapid comprehension.
              </p>
            </div>
            <div className="col-12 col-lg-7">
              <div className="list-group shadow-sm">
                {timeline.map((item) => (
                  <div key={item.label} className="list-group-item list-group-item-action showcase-timeline-item">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <strong>{item.label}</strong>
                      <span className="badge text-bg-primary">{item.formatted}</span>
                    </div>
                    {/* date-fns relative helper keeps copy human-friendly. */}
                    <small className="text-muted">Started {item.relative}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
