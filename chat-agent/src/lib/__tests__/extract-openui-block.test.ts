import {
  extractOpenUISegments,
  hasOpenUIBlock,
} from "@/lib/openui/extract-openui-block";

describe("extractOpenUISegments", () => {
  it("returns a single markdown segment when there is no OpenUI block", () => {
    const text = "Sure! I can help you book a room.";
    expect(extractOpenUISegments(text)).toEqual([
      { type: "markdown", content: text },
    ]);
    expect(hasOpenUIBlock(text)).toBe(false);
  });

  it("hasOpenUIBlock returns false for plain markdown without parsing fences", () => {
    const text = "Here is a **bold** note and `inline code` only.";
    expect(hasOpenUIBlock(text)).toBe(false);
  });

  it("splits markdown prose from a fenced openui block in order", () => {
    const text = [
      "Here is your booking summary:",
      "",
      "```openui",
      'root = Card([title])',
      'title = TextContent("Booking summary", "large-heavy")',
      "```",
    ].join("\n");

    const segments = extractOpenUISegments(text);

    expect(segments).toHaveLength(2);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].content).toContain("Here is your booking summary:");
    expect(segments[1].type).toBe("openui");
    expect(segments[1].content).toContain("root = Card([title])");
    expect(hasOpenUIBlock(text)).toBe(true);
  });

  it("keeps non-openui code fences as markdown", () => {
    const text = ["```ts", "const x = 1;", "```"].join("\n");
    const segments = extractOpenUISegments(text);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(hasOpenUIBlock(text)).toBe(false);
  });

  it("accepts the built-in openui-lang fence tag", () => {
    const text = ["```openui-lang", "root = Card([])", "```"].join("\n");
    const segments = extractOpenUISegments(text);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("openui");
  });

  it("treats an untagged fence starting with root= as openui", () => {
    const text = ["```", 'root = Card([])', "```"].join("\n");
    const segments = extractOpenUISegments(text);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("openui");
  });

  it("flags an unclosed trailing openui fence as open (streaming)", () => {
    const text = [
      "One moment:",
      "",
      "```openui",
      'root = Card([title])',
      'title = TextContent("Loading", "default")',
    ].join("\n");

    const segments = extractOpenUISegments(text);
    const openuiSegment = segments.find((s) => s.type === "openui");

    expect(openuiSegment).toBeDefined();
    expect(openuiSegment?.open).toBe(true);
    expect(openuiSegment?.content).toContain('title = TextContent("Loading"');
  });
});
