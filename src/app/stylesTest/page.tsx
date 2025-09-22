"use client";

import { useEffect, useState } from "react";

export default function ColorsDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Keep <html> updated with dark/light class
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const colors = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "popover",
    "popover-foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "accent",
    "accent-foreground",
    "destructive",
    "destructive-foreground",
    "border",
    "input",
    "ring",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-10 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient-primary">
          🎨 Colors & Styles Demo
        </h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-md border border-border bg-muted text-muted-foreground hover:bg-secondary transition"
        >
          Toggle {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      {/* Background / Foreground Demo */}
      <section className="grid grid-cols-2 gap-4">
        <div className="p-6 rounded-lg bg-background border">
          <p>Background</p>
        </div>
        <div className="p-6 rounded-lg bg-foreground text-background">
          <p>Foreground</p>
        </div>
      </section>

      {/* Loop through all colors */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {colors.map((color) => (
          <div
            key={color}
            className={`p-6 rounded-lg bg-${color} text-${
              color.includes("foreground") ? "background" : "foreground"
            } border`}
          >
            <p className="text-sm font-medium">{color}</p>
          </div>
        ))}
      </section>

      {/* Card Example */}
      <section className="p-6 rounded-lg bg-card text-card-foreground shadow-md">
        <h2 className="text-xl font-semibold">Card Example</h2>
        <p>This is a card using `bg-card` and `text-card-foreground`</p>
      </section>

      {/* Popover Example */}
      <section className="p-6 rounded-lg bg-popover text-popover-foreground border">
        <h2 className="text-xl font-semibold">Popover Example</h2>
        <p>This is a popover using `bg-popover`</p>
      </section>

      {/* Buttons */}
      <section className="flex gap-4 flex-wrap">
        <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground">
          Primary
        </button>
        <button className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground">
          Secondary
        </button>
        <button className="px-4 py-2 rounded-md bg-accent text-accent-foreground">
          Accent
        </button>
        <button className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground">
          Destructive
        </button>
      </section>

      {/* Inputs & Borders */}
      <section className="space-y-4">
        <input
          type="text"
          placeholder="Input with border"
          className="px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="p-4 border-2 border-border rounded-md">
          This box uses `border-border`
        </div>
      </section>

      {/* Animation Demo */}
      <section>
        <details className="overflow-hidden">
          <summary className="cursor-pointer select-none px-4 py-2 bg-muted text-muted-foreground rounded-md">
            Accordion (Click me)
          </summary>
          <div className="animate-accordion-down p-4 bg-muted">
            This is inside the accordion, animated with `accordion-down`.
          </div>
        </details>
      </section>
    </div>
  );
}
