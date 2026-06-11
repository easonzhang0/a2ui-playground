import { useEffect, useState, useRef } from 'react';
import { Button, Modal, Card, Typography, Alert } from 'antd';
import ReactDOM from 'react-dom/client';
import { init, a2uiParser } from '@a2ui/core';
import { renderMap } from '@a2ui/react';
import mockSimpleText from '../../../packages/a2ui-core/mock/simple-text.json';

const { Title, Text } = Typography;

function App() {
  const [store, setStore] = useState<any>(null);
  const [storeState, setStoreState] = useState<any>(null);
  const [componentTree, setComponentTree] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const renderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始化store，传入renderMap
    const createdStore = init(renderMap);
    setStore(createdStore);
    
    // 解析mock数据
    const surfaceUpdateResult = a2uiParser.parseMessage({
      surfaceUpdate: mockSimpleText.surfaceUpdate
    });
    
    // 1. 先添加hydrateNodes到store
    if (surfaceUpdateResult.hydrateNodes) {
      surfaceUpdateResult.hydrateNodes.forEach((node: any) => {
        createdStore.getState().addHydrateNode(node);
      });
      
      // 2. 构建组件树
      const tree = a2uiParser.treeBuild(surfaceUpdateResult.hydrateNodes);
      setComponentTree(tree);
    }
    
    // 3. 然后添加surface（此时rootNode已经指向正确的hydrateNode）
    if (surfaceUpdateResult.surface) {
      createdStore.getState().addSurface(surfaceUpdateResult.surface);
    }
    
    // 更新store状态
    setStoreState(createdStore.getState());
  }, []);

  useEffect(() => {
    // 渲染组件树
    if (componentTree && renderRef.current) {
      const root = ReactDOM.createRoot(renderRef.current);
      const rootVNode = componentTree.root._vnode;
      
      if (rootVNode && rootVNode.type) {
        root.render(
          <rootVNode.type {...rootVNode.props} />
        );
      }
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

  const handleErrorCancel = () => {
    setIsErrorModalVisible(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={1}>A2UI Playground</Title>
      
      <div style={{ marginBottom: '20px' }}>
        <Button type="primary" onClick={showModal} style={{ marginRight: '10px' }}>
          View Store
        </Button>
        <Button danger onClick={showErrorModal}>
          View Errors
        </Button>
      </div>
      
      <Card title="Render Preview" style={{ marginBottom: '20px' }}>
        <div 
          ref={renderRef} 
          style={{ 
            padding: '20px', 
            border: '1px solid #e8e8e8', 
            borderRadius: '4px',
            minHeight: '100px'
          }}
        >
          {!componentTree ? (
            <Text type="secondary">Loading component...</Text>
          ) : null}
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
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto',
            maxHeight: '500px'
          }}>
            {JSON.stringify(storeState, null, 2)}
          </pre>
        ) : (
          <Text type="secondary">Loading store...</Text>
        )}
      </Modal>
      
      <Modal
        title="Error Messages"
        open={isErrorModalVisible}
        onCancel={handleErrorCancel}
        footer={[
          <Button key="close" onClick={handleErrorCancel}>
            Close
          </Button>
        ]}
        width={800}
      >
        {storeState ? (
          <div>
            {storeState.getErrors().length > 0 ? (
              storeState.getErrors().map((error: any, index: number) => (
                <Alert
                  key={index}
                  message={`Error ${index + 1}`}
                  description={
                    <div>
                      <p><strong>Type:</strong> {error.type}</p>
                      <p><strong>Content:</strong> {error.content}</p>
                    </div>
                  }
                  type="error"
                  showIcon
                  style={{ marginBottom: '10px' }}
                />
              ))
            ) : (
              <Text type="success">No errors found</Text>
            )}
          </div>
        ) : (
          <Text type="secondary">Loading errors...</Text>
        )}
      </Modal>
    </div>
  );
}

export default App;
