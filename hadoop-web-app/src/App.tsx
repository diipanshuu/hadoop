import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import HDFSFileBrowser from './components/HDFSFileBrowser';
import YARNJobs from './components/YARNJobs';
import ClusterMonitoring from './components/ClusterMonitoring';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import NodeStatus from './components/NodeStatus';
import './App.css';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h1`
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 0 0;
  color: #7f8c8d;
  text-align: center;
  font-size: 1.1rem;
`;

const NavBar = styled.nav`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const NavButton = styled(motion.button)<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 25px;
  background: ${props => props.active ? '#3498db' : 'rgba(255, 255, 255, 0.8)'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#2980b9' : 'rgba(255, 255, 255, 1)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ComponentContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

function App() {
  const [activeTab, setActiveTab] = useState('architecture');

  const tabs = [
    { id: 'architecture', label: 'Architecture' },
    { id: 'hdfs', label: 'HDFS Browser' },
    { id: 'yarn', label: 'YARN Jobs' },
    { id: 'monitoring', label: 'Cluster Monitoring' },
    { id: 'nodes', label: 'Node Status' }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'architecture':
        return <ArchitectureDiagram />;
      case 'hdfs':
        return <HDFSFileBrowser />;
      case 'yarn':
        return <YARNJobs />;
      case 'monitoring':
        return <ClusterMonitoring />;
      case 'nodes':
        return <NodeStatus />;
      default:
        return <ArchitectureDiagram />;
    }
  };

  return (
    <AppContainer>
      <Header>
        <Title>🐘 Hadoop Ecosystem Simulator</Title>
        <Subtitle>Interactive visualization of HDFS, YARN, and cluster components</Subtitle>
        <NavBar>
          {tabs.map((tab) => (
            <NavButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label}
            </NavButton>
          ))}
        </NavBar>
      </Header>
      
      <MainContent>
        <ComponentContainer
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderActiveComponent()}
        </ComponentContainer>
      </MainContent>
    </AppContainer>
  );
}

export default App;
