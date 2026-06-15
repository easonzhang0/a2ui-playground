import { Readable } from 'stream';
import type { Context } from 'koa';
import Router from 'koa-router';
import { EventEncoder } from '@ag-ui/encoder';
import { RunAgentInputSchema } from '@ag-ui/core';
import type { BaseEvent } from '@ag-ui/core';
import { mockAgentEventStream } from '../agent/mockStream';
import { loadA2uiMockJson } from '../loadA2uiMock';

/** 默认使用 SSE；`sse=0|false|no|off|json` 时改为一次性 JSON（`{ events }`）。 */
function useSseFromQuery(ctx: Context): boolean {
  const v = ctx.query.sse;
  if (v === undefined) return true;
  const s = Array.isArray(v) ? v[0] : v;
  const lower = String(s).toLowerCase();
  if (['0', 'false', 'no', 'off', 'json'].includes(lower)) return false;
  return true;
}

function normalizeRunAgentBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object') {
    return { tools: [], context: [] };
  }
  const b = body as Record<string, unknown>;
  return {
    ...b,
    tools: Array.isArray(b.tools) ? b.tools : [],
    context: Array.isArray(b.context) ? b.context : []
  };
}

export function createAgentRouter(): Router {
  const router = new Router();

  router.post('/api/agent', async (ctx: Context) => {
    const normalized = normalizeRunAgentBody(ctx.request.body);
    const parsed = RunAgentInputSchema.safeParse(normalized);
    if (!parsed.success) {
      ctx.status = 400;
      ctx.body = {
        error: 'Invalid RunAgentInput',
        details: parsed.error.flatten()
      };
      return;
    }

    const input = parsed.data;
    const useSse = useSseFromQuery(ctx);

    if (!useSse) {
      const events: BaseEvent[] = [];
      for await (const event of mockAgentEventStream(input, loadA2uiMockJson)) {
        events.push(event as BaseEvent);
      }
      ctx.set('Content-Type', 'application/json; charset=utf-8');
      ctx.body = { events };
      ctx.status = 200;
      return;
    }

    // AG-UI 客户端常带 `Accept: ... application/vnd.ag-ui.event+proto`，若交给 EventEncoder 协商，
    // getContentType() 会变为 proto，但此处始终用 encodeSSE 发文本帧，会导致类型与正文不一致、被当成二进制。
    // 本接口固定为 SSE（data 行内 JSON），忽略客户端对 protobuf 的协商。
    const encoder = new EventEncoder({ accept: 'text/event-stream' });

    ctx.set('Content-Type', 'text/event-stream');
    ctx.set('Cache-Control', 'no-cache');
    ctx.set('Connection', 'keep-alive');
    ctx.set('X-Accel-Buffering', 'no');

    async function* eventStrings(): AsyncGenerator<string> {
      for await (const event of mockAgentEventStream(input, loadA2uiMockJson)) {
        yield encoder.encodeSSE(event as BaseEvent);
      }
    }

    ctx.body = Readable.from(eventStrings(), { objectMode: false });
    ctx.status = 200;
  });

  return router;
}
