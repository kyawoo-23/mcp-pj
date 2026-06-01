/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { OpenUIMessage } from "@/components/chat/openui-message";

describe("OpenUIMessage", () => {
  it("renders a fenced OpenUI block into structured content", async () => {
    const code = [
      "root = Card([title, room, note])",
      'title = TextContent("Booking summary", "large-heavy")',
      'room = KeyValue("Room", "Study Room 202")',
      'note = Callout("Booked successfully", "success")',
    ].join("\n");

    render(<OpenUIMessage code={code} />);

    expect(await screen.findByText("Booking summary")).toBeTruthy();
    expect(await screen.findByText("Room")).toBeTruthy();
    expect(await screen.findByText("Study Room 202")).toBeTruthy();
    expect(await screen.findByText("Booked successfully")).toBeTruthy();
  });

  it("falls back to raw code when the OpenUI Lang is unparseable", async () => {
    const code = "this is not valid openui lang at all";

    render(<OpenUIMessage code={code} />);

    expect(await screen.findByText(/not valid openui lang/)).toBeTruthy();
  });
});
