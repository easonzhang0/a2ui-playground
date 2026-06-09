# A2UI Playground

基于 LLM 的 AI 驱动 UI 生成与渲染平台。用户通过自然语言对话，让 AI Agent 输出符合 A2UI 协议的 JSON，由客户端协议引擎实时解析渲染为可交互界面。

## 项目架构

pnpm Monorepo，包含以下模块：

```
a2ui-full-finish/
├── packages/
│   ├── a2ui-core/          # 协议解析引擎 SDK
│   └── a2ui-react/         # React 渲染层
├── web/
│   └── a2ui-playground/    # Playground 前端
├── server/
│   └── a2ui-playground-server/  # Agent 服务端
├── specification/          # A2UI 协议规范文档
└── docs/                   # 设计文档与评估用例
```

### packages/a2ui-core

A2UI 协议 SDK，发布为 npm 包。核心模块：

- **parser** — JSONL 流式解析器，处理协议消息，流式 JSONL 缓冲区与行边界检测，支持未完整到达时按括号匹配提前提取单个 component
- **vnode** — 协议组件虚拟节点映射与管理
- **treebuilder** — 协议 → 渲染树构建，含渲染节流调度
- **store** — 运行时状态管理，维护 surfaceMap / hydrateNodeMap / renderMap / errorMap 等渲染状态，提供增删改查与数据模型写入能力
- **dataModel** — 数据模型引擎，协议数据绑定与运行时数据更新，增量合并

### packages/a2ui-react

基于 React 的 A2UI 渲染层，将协议组件映射为 React Element。

### web/a2ui-playground

Playground 前端（Vite + React + Zustand），功能：

1. 对话式 UI 生成与实时预览
2. 多轮对话增量编辑
3. 多模态（图片）输入
4. 协议调试面板
5. 增量协议前端合并

### server/a2ui-playground-server

Agent 服务端（Koa + ts-node），核心职责：

1. 基于 OpenAI API 实现 A2UI Agent
2. AG-UI 协议事件流编排，SSE 下发
3. Server-side Tool Calling 循环（get_antd_icons / get_available_components / query_data_source 等），最多 6 轮
4. LLM 输出容错解析与 JSONL 分片
5. 多模态支持：自动检测用户图片输入，切换 Vision Model

## 技术栈

- **语言**：TypeScript
- **前端**：React / Zustand / Vite
- **后端**：Koa / ts-node
- **AI**：OpenAI Chat Completions API / Function Calling
- **协议通信**：AG-UI 协议 / Server-Sent Events

## 快速开始

```bash
pnpm install
pnpm run dev:server
pnpm run dev:web
```