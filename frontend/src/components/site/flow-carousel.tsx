"use client";

import { Pause, Play } from "lucide-react";
import * as React from "react";

import { steps } from "@/lib/content";

export function FlowCarousel() {
  const [paused, setPaused] = React.useState(false);

  return (
    <div className="flow-carousel-group mt-10">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          aria-pressed={paused}
          className="flow-carousel-control"
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          {paused ? "Resume flow" : "Pause flow"}
        </button>
      </div>
      <div className="flow-carousel" role="region" aria-label="Agent hiring flow">
        <div className={`flow-carousel-track ${paused ? "flow-carousel-paused" : ""}`}>
          {[...steps, ...steps].map((step, index) => (
            <article
              key={`${step.n}-${index}`}
              aria-hidden={index >= steps.length}
              className={`flow-card group p-6 sm:p-7 ${index >= steps.length ? "flow-card-duplicate" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="num text-xs font-bold text-brass">{step.n}</span>
                <span className="flow-icon">
                  <step.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-12 text-xl font-bold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
