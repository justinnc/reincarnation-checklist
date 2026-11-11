import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { initGame } from "@/lib/cardgame/engine";
import { BoardStrip } from "./BoardStrip";

describe("BoardStrip", () => {
  it("conceals future event titles until reaching them", () => {
    const nodes = initGame(42).nodes;
    const futureIndex = nodes.findIndex((node, i) => i > 0 && node.kind === "event");
    expect(futureIndex).toBeGreaterThan(0);
    const event = nodes[futureIndex];
    if (event.kind !== "event") throw new Error("Expected an event");

    const before = renderToStaticMarkup(createElement(BoardStrip, { nodes, index: 0, history: [] }));
    const arrived = renderToStaticMarkup(createElement(BoardStrip, { nodes, index: futureIndex, history: [] }));
    expect(before).not.toContain(event.event.title);
    expect(arrived).toContain(event.event.title);
  });

  it("conceals future actions but keeps current and past actions visible", () => {
    const nodes = initGame(42).nodes;
    const futureIndex = nodes.findIndex((node, i) => i > 1 && node.kind === "fork");
    const future = nodes[futureIndex];
    if (future.kind !== "fork" || nodes[0].kind !== "single") throw new Error("Unexpected board");
    const before = renderToStaticMarkup(createElement(BoardStrip, { nodes, index: 0, history: [] }));
    const progressed = renderToStaticMarkup(createElement(BoardStrip, { nodes, index: futureIndex, history: [] }));
    expect(before).not.toContain(future.left.verb);
    expect(before).toContain(nodes[0].card.verb);
    expect(progressed).toContain(future.left.verb);
    expect(progressed).toContain(nodes[0].card.verb);
  });
});
