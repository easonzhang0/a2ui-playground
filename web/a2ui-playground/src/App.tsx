import React, { useEffect, useState, useRef } from 'react';
import { Button, Modal, Card, Typography, Alert, Select } from 'antd';
import ReactDOM from 'react-dom/client';
import { init, a2uiParser, A2UIMessage, type DataModelUpdatePayload } from 'a2ui-core';
import { createRenderMap, type OpenLinkSpec } from 'a2ui-react';
import mockColumnWithTexts from '../../../packages/a2ui-core/mock/column-with-texts.json';
import mockComplexNestedTree from '../../../packages/a2ui-core/mock/complex-nested-tree.json';
import mockRowColumnMixed from '../../../packages/a2ui-core/mock/row-column-mixed.json';
import mockButtonDemo from '../../../packages/a2ui-core/mock/button-demo.json';
import mockImageDemo from '../../../packages/a2ui-core/mock/image-demo.json';
import mockIconDemo from '../../../packages/a2ui-core/mock/icon-demo.json';
import mockCardDemo from '../../../packages/a2ui-core/mock/card-demo.json';
import mockDataBindingSmoke from '../../../packages/a2ui-core/mock/data-binding-smoke.json';
import mockListTemplateSmoke from '../../../packages/a2ui-core/mock/list-template-smoke.json';
import mockCartListSmoke from '../../../packages/a2ui-core/mock/cart-list-smoke.json';
import mockLocalActionTextDemo from '../../../packages/a2ui-core/mock/local-action-text-demo.json';
import { StreamSimulator } from './mock/stream-simulator';
import { buildA2uiProtocolSnapshot } from './buildA2uiProtocolSnapshot';

const { Title, Text } = Typography;
const { Option } = Select;

/** 与 a2ui-core init 默认一致；流式下合并多次 parseMessage 触发的 treeBuild，减轻已挂载节点动画闪烁 */
const PLAYGROUND_RENDER_THROTTLE_MS = 400;

function App() {
  const [store, setStore] = useState<any>(null);
  const storeRef = useRef<any>(null);
  const [storeState, setStoreState] = useState<any>(null);
  const [componentTree, setComponentTree] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [isProtocolModalVisible, setIsProtocolModalVisible] = useState(false);
  const [mockData, setMockData] = useState('column-with-texts');
  const [isStreaming, setIsStreaming] = useState(false);
  const renderRef = useRef<HTMLDivElement>(null);

  // 处理组件挂载完成的回调
  const handleMountComplete = (componentId: string) => {
    if (storeRef.current) {
      storeRef.current.getState().setHydrateNodeMounted(componentId);
    }
  };

  // 获取组件的挂载状态
  const getHasMounted = (componentId: string): boolean => {
    if (!storeRef.current) return false;
    const node = storeRef.current.getState().getHydrateNode(componentId);
    return node?.hasMounted ?? false;
  };

  const localRenderOptions = {
    applyLocalDataModelUpdate: (payload: DataModelUpdatePayload) => {
      storeRef.current?.getState().applyDataModelUpdate(payload);
    },
    requestTreeRefresh: () => {
      a2uiParser.flushPendingRender();
    },
    openExternalLink: ({ url, target }: OpenLinkSpec) => {
      const t = target ?? '_blank';
      const trimmed = url.trim();
      if (!trimmed || /^javascript:/i.test(trimmed)) return;
      let href: string;
      try {
        href = new URL(trimmed, window.location.href).href;
      } catch {
        return;
      }
      if (t === '_self') {
        window.location.assign(href);
      } else {
        window.open(href, t, 'noopener,noreferrer');
      }
    }
  };

  // 使用 StreamSimulator 将内存中的消息序列按块写入 parser（内部可转为 JSONL 字节流）
  const simulateStream = async () => {
    try {
      setIsStreaming(true);

      // 创建带有动画支持的 renderMap
      const animatedRenderMap = createRenderMap(
        getHasMounted,
        handleMountComplete,
        localRenderOptions
      );

      a2uiParser.resetRuntimeState();

      const createdStore = init({
        renderMap: animatedRenderMap,
        renderThrottleMs: PLAYGROUND_RENDER_THROTTLE_MS,
        onRender: (rootVNode) => {
          setComponentTree(rootVNode);
        }
      });
      setStore(createdStore);
      storeRef.current = createdStore;

      // 初始化 parser 的流式模式
      a2uiParser.initStreamMode();

      // 准备消息队列
      let messages: A2UIMessage[] = [];
      
      // 根据 mock 数据类型选择消息
      let selectedMockData;
      switch (mockData) {
        case 'column-with-texts':
          selectedMockData = mockColumnWithTexts;
          break;
        case 'complex-nested-tree':
          selectedMockData = mockComplexNestedTree;
          break;
        case 'row-column-mixed':
          selectedMockData = mockRowColumnMixed;
          break;
        case 'button-demo':
          selectedMockData = mockButtonDemo;
          break;
        case 'image-demo':
          selectedMockData = mockImageDemo;
          break;
        case 'icon-demo':
          selectedMockData = mockIconDemo;
          break;
        case 'card-demo':
          selectedMockData = mockCardDemo;
          break;
        case 'data-binding-smoke':
          selectedMockData = mockDataBindingSmoke;
          break;
        case 'list-template-smoke':
          selectedMockData = mockListTemplateSmoke;
          break;
        case 'cart-list-smoke':
          selectedMockData = mockCartListSmoke;
          break;
        case 'local-action-text-demo':
          selectedMockData = mockLocalActionTextDemo;
          break;
        default:
          selectedMockData = mockColumnWithTexts;
      }

      // 添加 beginRendering 消息
      if (selectedMockData.beginRendering) {
        messages.push({ beginRendering: selectedMockData.beginRendering });
      }

      // 添加 surfaceUpdate 消息
      if (selectedMockData.surfaceUpdate) {
        messages.push({ surfaceUpdate: selectedMockData.surfaceUpdate });
      }

      if ('dataModelUpdate' in selectedMockData && selectedMockData.dataModelUpdate) {
        messages.push({
          dataModelUpdate: selectedMockData.dataModelUpdate as NonNullable<
            A2UIMessage['dataModelUpdate']
          >
        });
      }

      // 创建流模拟器
      const simulator = new StreamSimulator(
        messages,
        {
          chunkSize: 50,
          chunkDelay: 50
        },
        (data) => {
          // 将数据写入 parser 的缓冲区
          a2uiParser.write(data);
        },
        (error) => {
          console.error('Stream error:', error);
        }
      );

      // 启动流模拟
      await simulator.start();

      // 结束流式解析，处理剩余数据
      a2uiParser.endStream();
      a2uiParser.flushPendingRender();

      // 更新 store 状态
      setStoreState(createdStore.getState());
    } catch (error) {
      console.error('Stream error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    a2uiParser.resetRuntimeState();

    // 创建带有动画支持的 renderMap
    const animatedRenderMap = createRenderMap(
      getHasMounted,
      handleMountComplete,
      localRenderOptions
    );

    // 初始化store，传入renderMap
    const createdStore = init({
      renderMap: animatedRenderMap,
      renderThrottleMs: PLAYGROUND_RENDER_THROTTLE_MS,
      onRender: (rootVNode) => {
        setComponentTree(rootVNode);
      }
    });
    setStore(createdStore);
    storeRef.current = createdStore;
    
    try {
      if (mockData === 'list-template-smoke') {
        a2uiParser.parseMessage(mockListTemplateSmoke as A2UIMessage);
      } else if (mockData === 'cart-list-smoke') {
        a2uiParser.parseMessage(mockCartListSmoke as A2UIMessage);
      } else {
        let selectedMockData: Record<string, unknown>;
        switch (mockData) {
          case 'column-with-texts':
            selectedMockData = { ...mockColumnWithTexts };
            break;
          case 'complex-nested-tree':
            selectedMockData = { ...mockComplexNestedTree };
            break;
          case 'row-column-mixed':
            selectedMockData = { ...mockRowColumnMixed };
            break;
          case 'button-demo':
            selectedMockData = { ...mockButtonDemo };
            break;
          case 'image-demo':
            selectedMockData = { ...mockImageDemo };
            break;
          case 'icon-demo':
            selectedMockData = { ...mockIconDemo };
            break;
          case 'card-demo':
            selectedMockData = { ...mockCardDemo };
            break;
          case 'data-binding-smoke':
            selectedMockData = { ...mockDataBindingSmoke };
            break;
          case 'local-action-text-demo':
            selectedMockData = { ...mockLocalActionTextDemo };
            break;
          default:
            selectedMockData = { ...mockColumnWithTexts };
        }
        a2uiParser.parseMessage(selectedMockData as A2UIMessage);
      }
    } catch (error) {
      // 忽略解析错误
    }

    // 更新store状态
    setStoreState(createdStore.getState());
  }, [mockData]);

  useEffect(() => {
    // 渲染组件树
    if (componentTree && renderRef.current) {
      const root = ReactDOM.createRoot(renderRef.current);
      root.render(componentTree);
    }
  }, [componentTree]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showErrorModal = () => {
    setIsErrorModalVisible(true);
  };

  const handleErrorModalCancel = () => {
    setIsErrorModalVisible(false);
  };

  const showProtocolModal = () => {
    setIsProtocolModalVisible(true);
  };

  const handleProtocolModalCancel = () => {
    setIsProtocolModalVisible(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={1}>A2UI Playground</Title>
      
      <div style={{ marginBottom: '20px' }}>
        <Select 
          defaultValue="column-with-texts" 
          style={{ width: 200, marginRight: '10px' }}
          onChange={setMockData}
        >
          <Option value="column-with-texts">Simple Column with Texts</Option>
          <Option value="complex-nested-tree">Complex Nested Tree</Option>
          <Option value="row-column-mixed">Row and Column Mixed</Option>
          <Option value="button-demo">Button Demo</Option>
          <Option value="image-demo">Image Demo</Option>
          <Option value="icon-demo">Icon Demo</Option>
          <Option value="card-demo">Card Demo</Option>
          <Option value="data-binding-smoke">Data binding (path + dataModelUpdate)</Option>
          <Option value="list-template-smoke">List + template (dynamic items)</Option>
          <Option value="cart-list-smoke">Shopping cart list (demo)</Option>
          <Option value="local-action-text-demo">Local action → dataModel (text + button)</Option>
        </Select>
        <Button type="primary" onClick={showModal} style={{ marginRight: '10px' }}>
          View Store
        </Button>
        <Button danger onClick={showErrorModal} style={{ marginRight: '10px' }}>
          View Errors
        </Button>
        <Button onClick={showProtocolModal} style={{ marginRight: '10px' }}>
          View A2UI JSON
        </Button>
        <Button 
          type="dashed" 
          onClick={simulateStream} 
          disabled={isStreaming}
        >
          {isStreaming ? 'Streaming...' : 'Simulate Stream'}
        </Button>
      </div>
      
      <Card title="Render Preview" style={{ marginBottom: '20px' }}>
        <div 
          ref={renderRef} 
          style={{ 
            minHeight: '200px', 
            border: '1px dashed #ccc', 
            padding: '20px',
            borderRadius: '4px'
          }}
        >
          {!componentTree && (
            <div style={{ textAlign: 'center', color: '#999' }}>
              组件树将在这里渲染
            </div>
          )}
        </div>
      </Card>

      <Modal
        title="Store State"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>
        ]}
        width={800}
      >
        {storeState ? (
          <>
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0f2f5', borderRadius: '4px' }}>
              <Text strong>组件总数: </Text>
              <Text>{Object.keys(storeState.hydrateNodeMap || {}).length}</Text>
            </div>
            {storeState.dataModelBySurfaceId &&
              Object.keys(storeState.dataModelBySurfaceId).length > 0 && (
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e6f7ff', borderRadius: '4px' }}>
                  <Text strong>数据模型 (dataModelBySurfaceId)</Text>
                  <pre
                    style={{
                      marginTop: 8,
                      marginBottom: 0,
                      background: '#fff',
                      padding: 10,
                      borderRadius: 4,
                      overflow: 'auto',
                      maxHeight: 200
                    }}
                  >
                    {JSON.stringify(storeState.dataModelBySurfaceId, null, 2)}
                  </pre>
                </div>
              )}
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '5px',
              overflow: 'auto',
              maxHeight: '500px'
            }}>
              {JSON.stringify(storeState, null, 2)}
            </pre>
          </>
        ) : (
          <Text type="secondary">Loading store...</Text>
        )}
      </Modal>

      <Modal
        title="Errors"
        open={isErrorModalVisible}
        onCancel={handleErrorModalCancel}
        footer={[
          <Button key="close" onClick={handleErrorModalCancel}>
            Close
          </Button>
        ]}
        width={600}
      >
        {storeState && Object.keys(storeState.errorMap || {}).length > 0 ? (
          <div>
            {Object.entries(storeState.errorMap).map(([errorId, error]: [string, any]) => (
              <Alert
                key={errorId}
                message={error.type}
                description={error.content}
                type="error"
                style={{ marginBottom: '10px' }}
              />
            ))}
          </div>
        ) : (
          <Text type="secondary">No errors</Text>
        )}
      </Modal>

      <Modal
        title="Current A2UI protocol (reconstructed)"
        open={isProtocolModalVisible}
        onCancel={handleProtocolModalCancel}
        footer={[
          <Button key="close" onClick={handleProtocolModalCancel}>
            Close
          </Button>
        ]}
        width={900}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          由当前 store 中的 surface、组件 protocal 与数据模型反推，与原始 mock 的字段顺序或 path 可能略有差异。
        </Text>
        <pre
          style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            overflow: 'auto',
            maxHeight: 560,
            margin: 0
          }}
        >
          {storeRef.current
            ? JSON.stringify(buildA2uiProtocolSnapshot(storeRef.current.getState()), null, 2)
            : '—'}
        </pre>
      </Modal>
    </div>
  );
}

export default App;
