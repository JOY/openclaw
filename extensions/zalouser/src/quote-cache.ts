import { parseZalouserMessageSidFull } from "./message-sid.js";

export type ZalouserQuoteEntry = {
  content: string;
  msgType: string;
  uidFrom: string;
  msgId: string;
  cliMsgId: string;
  ts: string | number;
  ttl?: number;
};

const MAX_QUOTE_CACHE_ENTRIES = 500;

const quoteCache = new Map<string, ZalouserQuoteEntry>();

function buildQuoteCacheKey(msgId: string, cliMsgId: string): string {
  return `${msgId}:${cliMsgId}`;
}

/** Record an inbound message's quote fields so a later reply can quote it natively. */
export function rememberZalouserQuote(entry: ZalouserQuoteEntry): void {
  const msgId = entry.msgId?.trim();
  const cliMsgId = entry.cliMsgId?.trim();
  if (!msgId || !cliMsgId) {
    return;
  }
  const key = buildQuoteCacheKey(msgId, cliMsgId);
  // Refresh insertion order so the most recently seen entries survive eviction.
  if (quoteCache.has(key)) {
    quoteCache.delete(key);
  }
  quoteCache.set(key, { ...entry, msgId, cliMsgId });
  while (quoteCache.size > MAX_QUOTE_CACHE_ENTRIES) {
    const oldestKey = quoteCache.keys().next().value;
    if (oldestKey === undefined) {
      break;
    }
    quoteCache.delete(oldestKey);
  }
}

/** Recall the quote fields for a replyToId (MessageSidFull). Returns undefined on miss. */
export function recallZalouserQuote(
  replyToId: string | null | undefined,
): ZalouserQuoteEntry | undefined {
  const parsed = parseZalouserMessageSidFull(replyToId);
  if (!parsed) {
    return undefined;
  }
  return quoteCache.get(buildQuoteCacheKey(parsed.msgId, parsed.cliMsgId));
}
