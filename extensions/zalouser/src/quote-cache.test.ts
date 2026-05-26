import { describe, expect, it } from "vitest";
import {
  recallZalouserQuote,
  rememberZalouserQuote,
  type ZalouserQuoteEntry,
} from "./quote-cache.js";

function buildEntry(suffix: string): ZalouserQuoteEntry {
  return {
    content: `body-${suffix}`,
    msgType: "webchat",
    uidFrom: `sender-${suffix}`,
    msgId: `msg-${suffix}`,
    cliMsgId: `cli-${suffix}`,
    ts: `100${suffix}`,
  };
}

describe("zalouser quote cache", () => {
  it("round-trips a remembered quote via its MessageSidFull", () => {
    const entry = buildEntry("rt");
    rememberZalouserQuote(entry);
    const recalled = recallZalouserQuote(`${entry.msgId}:${entry.cliMsgId}`);
    expect(recalled).toEqual(entry);
  });

  it("ignores entries with missing msgId or cliMsgId", () => {
    rememberZalouserQuote({ ...buildEntry("a"), msgId: "" });
    rememberZalouserQuote({ ...buildEntry("b"), cliMsgId: "  " });
    expect(recallZalouserQuote(":")).toBeUndefined();
  });

  it("returns undefined for a missing key or unparseable replyToId", () => {
    expect(recallZalouserQuote("no-such:entry")).toBeUndefined();
    expect(recallZalouserQuote(undefined)).toBeUndefined();
    expect(recallZalouserQuote(null)).toBeUndefined();
    expect(recallZalouserQuote("missing-cli-part")).toBeUndefined();
  });

  it("evicts the oldest entries once past the cap", () => {
    // Cap is 500; insert 600 distinct entries and confirm the earliest are gone.
    const total = 600;
    for (let i = 0; i < total; i += 1) {
      const id = `evict-${i}`;
      rememberZalouserQuote({
        content: `c-${i}`,
        msgType: "webchat",
        uidFrom: `u-${i}`,
        msgId: id,
        cliMsgId: id,
        ts: i,
      });
    }
    // The first 100 (total - cap) should have been evicted.
    expect(recallZalouserQuote("evict-0:evict-0")).toBeUndefined();
    expect(recallZalouserQuote("evict-99:evict-99")).toBeUndefined();
    // The newest entries must still be present.
    expect(recallZalouserQuote("evict-599:evict-599")?.uidFrom).toBe("u-599");
    expect(recallZalouserQuote("evict-100:evict-100")?.uidFrom).toBe("u-100");
  });
});
