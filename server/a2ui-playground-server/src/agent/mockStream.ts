import type { z } from 'zod';
import {
  EventType,
  RunAgentInputSchema,
  type BaseEvent,
  type CustomEvent,
  type RunFinishedEvent,
  type RunStartedEvent
} from '@ag-ui/core';
import { splitCombinedA2uiMessage } from '../a2ui/splitCombinedMessage';

type RunAgentInput = z.infer<typeof RunAgentInputSchema>;

const A2UI_CUSTOM_NAME = 'a2ui.message';

/** Mock：两条 CUSTOM 之间的延迟（毫秒），模拟流式块 */
const MOCK_CHUNK_DELAY_MS = 80;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockPayloadFromUserContent(input: RunAgentInput): string | null {
  const lastUser = [...input.messages]
    .reverse()
    .find((m) => m.role === 'user');
  const raw =
    typeof lastUser?.content === 'string'
      ? lastUser.content
      : '';
  const key = raw.trim().toLowerCase();
  if (key === 'local' || key.includes('local-action')) {
    return 'local-action-text-demo';
  }
  return null;
}

/**
 * 从合并的 A2UI JSON 生成 AG-UI 事件序列（Mock Agent）。
 */
export async function* mockAgentEventStream(
  input: RunAgentInput,
  loadMock: (name: string) => Record<string, unknown>
): AsyncGenerator<BaseEvent> {
  const pick = mockPayloadFromUserContent(input);
  const mockName = pick ?? 'column-with-texts';
  let combined: Record<string, unknown>;
  try {
    combined = loadMock(mockName);
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    yield {
      type: EventType.RUN_ERROR,
      message: `Failed to load mock "${mockName}": ${err}`
    };
    return;
  }

  const started: RunStartedEvent = {
    type: EventType.RUN_STARTED,
    threadId: input.threadId,
    runId: input.runId,
    input
  };
  yield started;

  const fragments = splitCombinedA2uiMessage(combined);
  let first = true;
  for (const fragment of fragments) {
    if (!first) await sleep(MOCK_CHUNK_DELAY_MS);
    first = false;
    const custom: CustomEvent = {
      type: EventType.CUSTOM,
      name: A2UI_CUSTOM_NAME,
      value: fragment
    };
    yield custom;
  }

  const finished: RunFinishedEvent = {
    type: EventType.RUN_FINISHED,
    threadId: input.threadId,
    runId: input.runId,
    result: { mock: mockName, a2uiMessageCount: fragments.length }
  };
  yield finished;
}
