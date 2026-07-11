import { useCallback, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface MindMapProps {
  nodes: Node[];
  edges: Edge[];
  onSelectNode: (node: Node) => void;
}

export default function MindMap({ nodes: initialNodes, edges: initialEdges, onSelectNode }: MindMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Sync state if props change (e.g. after new document ingestion)
  // ReactFlow hooks maintain internal state, but we force sync on file parse.
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onSelectNode(node);
    },
    [onSelectNode]
  );

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '450px', background: '#09090b', borderRadius: '12px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        colorMode="dark"
        style={{ width: '100%', height: '100%' }}
      >
        <Background color="#f5a623" gap={16} size={1} style={{ opacity: 0.15 }} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
