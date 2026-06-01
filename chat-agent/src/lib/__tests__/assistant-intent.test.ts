import { stripAssistantIntent, stripHiddenRef } from "@/lib/assistant-intent";

const FACILITY_ID = "11111111-1111-4111-8111-111111111111";

describe("stripAssistantIntent", () => {
  it("removes only the trailing intent block", () => {
    const text = `Visible reply

(intent: {"action":"info","slots":{},"ui":"none"})`;
    expect(stripAssistantIntent(text)).toBe("Visible reply");
  });

  it("removes inline trailing intent on the same line", () => {
    const text = `Does that sound right? Shall I go ahead and confirm this booking? (intent: {"action":"book_facility","slots":{"facilityId":"${FACILITY_ID}","bookingDate":"2026-05-29","startTime":"10:00","endTime":"12:00"},"ui":"confirm","label":"Study Room 202 on 2026-05-29, 10:00-12:00"})`;
    expect(stripAssistantIntent(text)).toBe(
      "Does that sound right? Shall I go ahead and confirm this booking?",
    );
  });
});

describe("stripHiddenRef", () => {
  it("removes trailing ref block from user messages", () => {
    const text = `Yes, please book Study Room 201.

(ref: {"facilityId":"${FACILITY_ID}"})`;
    expect(stripHiddenRef(text)).toBe("Yes, please book Study Room 201.");
  });
});
