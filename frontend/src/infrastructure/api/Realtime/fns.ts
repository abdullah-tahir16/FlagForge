import type { RealtimeEvent } from "../../../core/types/Realtime";
import { apiBaseUrl } from "../App";

interface RealtimeStreamOptions {
  accessToken: string;
  onEvent: (event: RealtimeEvent) => void;
  signal: AbortSignal;
}

export const openRealtimeStream = async ({ accessToken, onEvent, signal }: RealtimeStreamOptions): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/realtime/events`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    signal
  });

  if (!response.ok || !response.body) {
    throw new Error("Realtime stream failed to open");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (!signal.aborted) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseRealtimeSseBuffer(buffer);
    buffer = parsed.remaining;
    parsed.events.forEach(onEvent);
  }
};

export const parseRealtimeSseBuffer = (buffer: string): { events: RealtimeEvent[]; remaining: string } => {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const frames = normalized.split("\n\n");
  const remaining = frames.pop() ?? "";
  const events = frames.flatMap(parseRealtimeSseFrame);

  return { events, remaining };
};

const parseRealtimeSseFrame = (frame: string): RealtimeEvent[] => {
  const data = frame
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trimStart())
    .join("\n");

  if (!data) {
    return [];
  }

  try {
    return [JSON.parse(data) as RealtimeEvent];
  } catch {
    return [];
  }
};
