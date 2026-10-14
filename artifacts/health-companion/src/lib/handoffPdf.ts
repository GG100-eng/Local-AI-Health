import jsPDF from "jspdf";
import type { ChatMessage, JournalEntry } from "./types";

const SEVERITY_LABEL: Record<number, string> = {
  1: "Mild",
  2: "Light",
  3: "Moderate",
  4: "Severe",
  5: "Critical",
};

export function generateHandoffPdf(opts: {
  messages: ChatMessage[];
  entries: JournalEntry[];
}): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const writeLines = (
    text: string,
    fontSize: number,
    fontStyle: "normal" | "bold" = "normal",
    color: [number, number, number] = [30, 30, 30],
  ) => {
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lineHeight = fontSize * 1.35;
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    // Paginate per-line so a long block flows across pages instead of overflowing.
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
  };

  const addRule = () => {
    if (y + 14 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;
  };

  // Header
  writeLines("Health Companion — Clinician Handoff", 18, "bold");
  writeLines(
    `Generated ${new Date().toLocaleString()} · Created entirely on-device`,
    9,
    "normal",
    [120, 120, 120],
  );
  y += 6;

  writeLines(
    "Disclaimer: This document was produced by a privacy-preserving symptom-tracking tool and an on-device AI assistant. It is informational only and is not a clinical diagnosis. All data was collected on the user's device and was not transmitted to any external service.",
    9,
    "normal",
    [120, 80, 0],
  );
  addRule();

  // Journal
  writeLines("Symptom Journal", 13, "bold");
  y += 4;
  if (opts.entries.length === 0) {
    writeLines("(No journal entries.)", 10, "normal", [120, 120, 120]);
  } else {
    opts.entries.forEach((e) => {
      writeLines(
        `${new Date(e.ts).toLocaleString()} · Severity ${e.severity} (${
          SEVERITY_LABEL[e.severity] ?? ""
        })`,
        10,
        "bold",
      );
      writeLines(e.symptoms, 10, "normal");
      if (e.notes) writeLines(`Notes: ${e.notes}`, 9, "normal", [90, 90, 90]);
      y += 4;
    });
  }
  addRule();

  // Chat (last 30 turns to keep it manageable)
  writeLines("Recent Triage Conversation", 13, "bold");
  y += 4;
  const recent = opts.messages.slice(-30);
  if (recent.length === 0) {
    writeLines("(No conversation yet.)", 10, "normal", [120, 120, 120]);
  } else {
    recent.forEach((m) => {
      const label = m.role === "user" ? "Patient" : "Assistant";
      writeLines(
        `${label} · ${new Date(m.ts).toLocaleTimeString()}`,
        9,
        "bold",
        [80, 80, 80],
      );
      writeLines(m.content || "(no content)", 10, "normal");
      y += 4;
    });
  }

  const filename = `health-companion-handoff-${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;
  doc.save(filename);
}
