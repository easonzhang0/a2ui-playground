import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import { createAgentRouter } from './routes/agent';

const app = new Koa();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin || '*'
  })
);
app.use(bodyParser());

const agentRouter = createAgentRouter();
app.use(agentRouter.routes());
app.use(agentRouter.allowedMethods());

const PORT = Number(process.env.PORT || 3847);
app.listen(PORT, () => {
  console.log(`a2ui-playground-server listening on http://localhost:${PORT}`);
});
