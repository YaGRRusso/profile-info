type JsonRecord = Record<string, unknown>;

const SENSITIVE_HEADER = /^(authorization|cookie|x-api-key|set-cookie)$/i;
const SENSITIVE_KEY =
  /pass(word)?|secret|token|authorization|cookie|api[_-]?key|jwt|credential/i;

export function scrubSentryEvent<T extends object>(event: T): T {
  const next = { ...(event as JsonRecord) };

  if (isRecord(next.request)) {
    next.request = scrubRequest(next.request);
  }

  if (isRecord(next.extra)) {
    next.extra = scrubRecord(next.extra);
  }

  if (Array.isArray(next.breadcrumbs)) {
    next.breadcrumbs = next.breadcrumbs.map((breadcrumb) => {
      if (!isRecord(breadcrumb) || !isRecord(breadcrumb.data)) {
        return breadcrumb;
      }

      return { ...breadcrumb, data: scrubRecord(breadcrumb.data) };
    });
  }

  return next as T;
}

function scrubRequest(request: JsonRecord): JsonRecord {
  const scrubbed = { ...request };

  if (isRecord(scrubbed.headers)) {
    scrubbed.headers = scrubHeaders(scrubbed.headers);
  }

  if (isRecord(scrubbed.data)) {
    scrubbed.data = scrubRecord(scrubbed.data);
  }

  if (isRecord(scrubbed.query_string)) {
    scrubbed.query_string = scrubRecord(scrubbed.query_string);
  }

  if (typeof scrubbed.cookies === "string" || isRecord(scrubbed.cookies)) {
    scrubbed.cookies = "[Filtered]";
  }

  return scrubbed;
}

function scrubHeaders(headers: JsonRecord): JsonRecord {
  const scrubbed: JsonRecord = {};

  for (const [key, value] of Object.entries(headers)) {
    scrubbed[key] = SENSITIVE_HEADER.test(key) ? "[Filtered]" : value;
  }

  return scrubbed;
}

function scrubRecord(value: JsonRecord): JsonRecord {
  const scrubbed: JsonRecord = {};

  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEY.test(key)) {
      scrubbed[key] = "[Filtered]";
      continue;
    }

    if (isRecord(entry)) {
      scrubbed[key] = scrubRecord(entry);
      continue;
    }

    if (Array.isArray(entry)) {
      scrubbed[key] = entry.map((item) =>
        isRecord(item) ? scrubRecord(item) : item
      );
      continue;
    }

    scrubbed[key] = entry;
  }

  return scrubbed;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
