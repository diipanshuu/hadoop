import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaServer, FaDatabase, FaCogs, FaNetworkWired } from 'react-icons/fa';

const DiagramContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  padding: 2rem;
  min-height: 600px;
`;

const Title = styled.h2`
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const DiagramGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
`;

const NodeCard = styled(motion.div)<{ nodeType: string }>`
  background: ${props => {
    switch (props.nodeType) {
      case 'namenode': return 'linear-gradient(135deg, #ff7675, #fd79a8)';
      case 'datanode': return 'linear-gradient(135deg, #74b9ff, #0984e3)';
      case 'resourcemanager': return 'linear-gradient(135deg, #55a3ff, #003d82)';
      case 'nodemanager': return 'linear-gradient(135deg, #a29bfe, #6c5ce7)';
      case 'client': return 'linear-gradient(135deg, #fd79a8, #fdcb6e)';
      default: return 'linear-gradient(135deg, #ddd, #bbb)';
    }
  }};
  color: white;
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const NodeIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const NodeTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const NodeDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
`;

const ConnectionLine = styled(motion.svg)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;

const DataFlowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 800px;
`;

const FlowStep = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 10px;
  border-left: 4px solid #3498db;
`;

const StepNumber = styled.div`
  background: #3498db;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
`;

const StepDescription = styled.div`
  flex: 1;
  color: #2c3e50;
`;

const ArchitectureDiagram: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes = [
    {
      id: 'namenode',
      title: 'NameNode',
      description: 'HDFS Master - Manages metadata and namespace',
      icon: 'FaServer',
      details: 'The NameNode is the master node in HDFS that manages the file system namespace and regulates access to files by clients.',
      port: '9870'
    },
    {
      id: 'datanode',
      title: 'DataNode',
      description: 'HDFS Worker - Stores actual file blocks',
      icon: 'FaDatabase',
      details: 'DataNodes store the actual data blocks of files and serve read/write requests from clients.',
      port: '9864'
    },
    {
      id: 'resourcemanager',
      title: 'ResourceManager',
      description: 'YARN Master - Manages cluster resources',
      icon: 'FaCogs',
      details: 'The ResourceManager is the master daemon that manages resources and schedules applications running on YARN.',
      port: '8088'
    },
    {
      id: 'nodemanager',
      title: 'NodeManager',
      description: 'YARN Worker - Executes tasks on nodes',
      icon: 'FaNetworkWired',
      details: 'NodeManagers run on each node and manage containers, monitor resource usage, and report to ResourceManager.',
      port: '8042'
    }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FaServer': return <FaServer />;
      case 'FaDatabase': return <FaDatabase />;
      case 'FaCogs': return <FaCogs />;
      case 'FaNetworkWired': return <FaNetworkWired />;
      default: return <FaServer />;
    }
  };

  const dataFlow = [
    'Client requests file operation from NameNode',
    'NameNode provides DataNode locations for file blocks',
    'Client directly communicates with DataNodes for data transfer',
    'DataNodes confirm block operations back to NameNode',
    'NameNode updates metadata and confirms operation to client'
  ];

  const yarnFlow = [
    'Client submits application to ResourceManager',
    'ResourceManager negotiates resources with NodeManagers',
    'ApplicationMaster is launched on a NodeManager',
    'ApplicationMaster requests containers from ResourceManager',
    'Tasks execute in containers across NodeManagers'
  ];

  return (
    <DiagramContainer>
      <Title>🏗️ Hadoop Ecosystem Architecture</Title>
      
      <DiagramGrid>
        {nodes.map((node, index) => (
          <NodeCard
            key={node.id}
            nodeType={node.id}
            onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <NodeIcon>{getIcon(node.icon)}</NodeIcon>
            <NodeTitle>{node.title}</NodeTitle>
            <NodeDescription>{node.description}</NodeDescription>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
              Port: {node.port}
            </div>
          </NodeCard>
        ))}
      </DiagramGrid>

      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            background: 'rgba(52, 152, 219, 0.1)',
            padding: '1.5rem',
            borderRadius: '10px',
            maxWidth: '600px',
            textAlign: 'center',
            marginTop: '1rem'
          }}
        >
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
            {nodes.find(n => n.id === selectedNode)?.title} Details
          </h3>
          <p style={{ color: '#34495e', lineHeight: 1.6 }}>
            {nodes.find(n => n.id === selectedNode)?.details}
          </p>
        </motion.div>
      )}

      <DataFlowContainer>
        <h3 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '1rem' }}>
          📊 HDFS Data Flow
        </h3>
        {dataFlow.map((step, index) => (
          <FlowStep
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <StepNumber>{index + 1}</StepNumber>
            <StepDescription>{step}</StepDescription>
          </FlowStep>
        ))}
      </DataFlowContainer>

      <DataFlowContainer>
        <h3 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '1rem' }}>
          ⚙️ YARN Application Flow
        </h3>
        {yarnFlow.map((step, index) => (
          <FlowStep
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 + 1 }}
          >
            <StepNumber>{index + 1}</StepNumber>
            <StepDescription>{step}</StepDescription>
          </FlowStep>
        ))}
      </DataFlowContainer>
    </DiagramContainer>
  );
};

export default ArchitectureDiagram;