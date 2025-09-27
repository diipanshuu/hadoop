import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaServer, FaDatabase, FaCogs, FaNetworkWired, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaHeart, FaMemory, FaMicrochip, FaHdd } from 'react-icons/fa';

interface Node {
  id: string;
  name: string;
  type: 'NameNode' | 'DataNode' | 'ResourceManager' | 'NodeManager';
  status: 'active' | 'standby' | 'decommissioned' | 'lost';
  health: 'healthy' | 'warning' | 'critical';
  address: string;
  port: number;
  version: string;
  startTime: string;
  lastHeartbeat: string;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    heapUsage: number;
    gcTime: number;
    threadsRunning: number;
  };
  services: string[];
  blocks?: number;
  liveNodes?: number;
  deadNodes?: number;
  containers?: number;
  allocatedMemory?: string;
  availableMemory?: string;
}

const NodesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 100%;
  min-height: 600px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.8rem;
`;

const StatusFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled(motion.button)<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  background: ${props => props.active ? '#3498db' : 'rgba(52, 152, 219, 0.1)'};
  color: ${props => props.active ? 'white' : '#3498db'};
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.active ? '#2980b9' : 'rgba(52, 152, 219, 0.2)'};
  }
`;

const NodesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const NodeCard = styled(motion.div)<{ health: string }>`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 5px solid ${props => {
    switch (props.health) {
      case 'healthy': return '#2ecc71';
      case 'warning': return '#f39c12';
      case 'critical': return '#e74c3c';
      default: return '#95a5a6';
    }
  }};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: ${props => {
      switch (props.health) {
        case 'healthy': return 'radial-gradient(circle, rgba(46, 204, 113, 0.1), transparent)';
        case 'warning': return 'radial-gradient(circle, rgba(243, 156, 18, 0.1), transparent)';
        case 'critical': return 'radial-gradient(circle, rgba(231, 76, 60, 0.1), transparent)';
        default: return 'radial-gradient(circle, rgba(149, 165, 166, 0.1), transparent)';
      }
    }};
    transform: translate(30px, -30px);
  }
`;

const NodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const NodeInfo = styled.div`
  flex: 1;
`;

const NodeName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const NodeType = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const NodeAddress = styled.div`
  color: #7f8c8d;
  font-size: 0.8rem;
  font-family: monospace;
`;

const StatusBadges = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
`;

const StatusBadge = styled.div<{ type: 'status' | 'health'; value: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: ${props => {
    if (props.type === 'status') {
      switch (props.value) {
        case 'active': return 'rgba(46, 204, 113, 0.2)';
        case 'standby': return 'rgba(52, 152, 219, 0.2)';
        case 'decommissioned': return 'rgba(243, 156, 18, 0.2)';
        case 'lost': return 'rgba(231, 76, 60, 0.2)';
        default: return 'rgba(149, 165, 166, 0.2)';
      }
    } else {
      switch (props.value) {
        case 'healthy': return 'rgba(46, 204, 113, 0.2)';
        case 'warning': return 'rgba(243, 156, 18, 0.2)';
        case 'critical': return 'rgba(231, 76, 60, 0.2)';
        default: return 'rgba(149, 165, 166, 0.2)';
      }
    }
  }};
  color: ${props => {
    if (props.type === 'status') {
      switch (props.value) {
        case 'active': return '#27ae60';
        case 'standby': return '#2980b9';
        case 'decommissioned': return '#d68910';
        case 'lost': return '#c0392b';
        default: return '#7f8c8d';
      }
    } else {
      switch (props.value) {
        case 'healthy': return '#27ae60';
        case 'warning': return '#d68910';
        case 'critical': return '#c0392b';
        default: return '#7f8c8d';
      }
    }
  }};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const MetricsSection = styled.div`
  margin: 1.5rem 0;
`;

const MetricsTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MetricLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const MetricBar = styled.div`
  background: #ecf0f1;
  border-radius: 10px;
  height: 6px;
  overflow: hidden;
`;

const MetricFill = styled(motion.div)<{ value: number; color: string }>`
  height: 100%;
  background: ${props => props.color};
  width: ${props => props.value}%;
  transition: width 0.5s ease;
`;

const ServicesSection = styled.div`
  margin-top: 1.5rem;
`;

const ServicesTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1rem;
`;

const ServicesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ServiceTag = styled.div`
  padding: 0.25rem 0.75rem;
  background: rgba(52, 152, 219, 0.1);
  color: #2980b9;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const StatsSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
`;

const HeartbeatIndicator = styled(motion.div)<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? '#2ecc71' : '#e74c3c'};
  animation: ${props => props.active ? 'heartbeat 2s infinite' : 'none'};
  
  @keyframes heartbeat {
    0% { transform: scale(1); }
    20% { transform: scale(1.2); }
    40% { transform: scale(1); }
    60% { transform: scale(1.1); }
    80% { transform: scale(1); }
    100% { transform: scale(1); }
  }
`;

const NodeStatus: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'namenode-01',
      name: 'hadoop-namenode-01',
      type: 'NameNode',
      status: 'active',
      health: 'healthy',
      address: '10.0.1.10',
      port: 9870,
      version: '3.3.4',
      startTime: '2024-01-15 08:00:00',
      lastHeartbeat: '2024-01-15 11:30:45',
      metrics: {
        cpuUsage: 45,
        memoryUsage: 67,
        diskUsage: 34,
        heapUsage: 78,
        gcTime: 120,
        threadsRunning: 89
      },
      services: ['HDFS', 'WebHDFS', 'SecondaryNameNode'],
      blocks: 15420,
      liveNodes: 3,
      deadNodes: 0
    },
    {
      id: 'datanode-01',
      name: 'hadoop-datanode-01',
      type: 'DataNode',
      status: 'active',
      health: 'healthy',
      address: '10.0.1.11',
      port: 9864,
      version: '3.3.4',
      startTime: '2024-01-15 08:05:00',
      lastHeartbeat: '2024-01-15 11:30:44',
      metrics: {
        cpuUsage: 78,
        memoryUsage: 82,
        diskUsage: 56,
        heapUsage: 65,
        gcTime: 85,
        threadsRunning: 45
      },
      services: ['HDFS DataNode', 'Block Scanner'],
      blocks: 5140
    },
    {
      id: 'datanode-02',
      name: 'hadoop-datanode-02',
      type: 'DataNode',
      status: 'active',
      health: 'warning',
      address: '10.0.1.12',
      port: 9864,
      version: '3.3.4',
      startTime: '2024-01-15 08:05:30',
      lastHeartbeat: '2024-01-15 11:30:42',
      metrics: {
        cpuUsage: 92,
        memoryUsage: 95,
        diskUsage: 78,
        heapUsage: 88,
        gcTime: 450,
        threadsRunning: 67
      },
      services: ['HDFS DataNode', 'Block Scanner'],
      blocks: 5280
    },
    {
      id: 'resourcemanager-01',
      name: 'hadoop-rm-01',
      type: 'ResourceManager',
      status: 'active',
      health: 'healthy',
      address: '10.0.1.20',
      port: 8088,
      version: '3.3.4',
      startTime: '2024-01-15 08:02:00',
      lastHeartbeat: '2024-01-15 11:30:45',
      metrics: {
        cpuUsage: 34,
        memoryUsage: 45,
        diskUsage: 23,
        heapUsage: 55,
        gcTime: 67,
        threadsRunning: 234
      },
      services: ['YARN ResourceManager', 'Application Timeline Service'],
      containers: 8,
      allocatedMemory: '16 GB',
      availableMemory: '48 GB'
    },
    {
      id: 'nodemanager-01',
      name: 'hadoop-nm-01',
      type: 'NodeManager',
      status: 'active',
      health: 'healthy',
      address: '10.0.1.21',
      port: 8042,
      version: '3.3.4',
      startTime: '2024-01-15 08:10:00',
      lastHeartbeat: '2024-01-15 11:30:43',
      metrics: {
        cpuUsage: 65,
        memoryUsage: 70,
        diskUsage: 45,
        heapUsage: 42,
        gcTime: 89,
        threadsRunning: 56
      },
      services: ['YARN NodeManager', 'Container Executor'],
      containers: 4,
      allocatedMemory: '8 GB',
      availableMemory: '8 GB'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        metrics: {
          ...node.metrics,
          cpuUsage: Math.max(10, Math.min(95, node.metrics.cpuUsage + (Math.random() - 0.5) * 10)),
          memoryUsage: Math.max(20, Math.min(95, node.metrics.memoryUsage + (Math.random() - 0.5) * 8)),
          diskUsage: Math.max(10, Math.min(85, node.metrics.diskUsage + (Math.random() - 0.5) * 5)),
          heapUsage: Math.max(20, Math.min(90, node.metrics.heapUsage + (Math.random() - 0.5) * 6)),
        },
        lastHeartbeat: new Date().toLocaleString(),
        health: node.metrics.cpuUsage > 90 || node.metrics.memoryUsage > 90 ? 'warning' : 
               node.metrics.cpuUsage > 95 || node.metrics.memoryUsage > 95 ? 'critical' : 'healthy'
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'NameNode': return <FaServer />;
      case 'DataNode': return <FaDatabase />;
      case 'ResourceManager': return <FaCogs />;
      case 'NodeManager': return <FaNetworkWired />;
      default: return <FaServer />;
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <FaCheckCircle />;
      case 'warning': return <FaExclamationTriangle />;
      case 'critical': return <FaTimesCircle />;
      default: return <FaCheckCircle />;
    }
  };

  const getMetricColor = (value: number) => {
    if (value > 90) return '#e74c3c';
    if (value > 75) return '#f39c12';
    return '#2ecc71';
  };

  const filteredNodes = filterStatus === 'all' ? nodes : 
    nodes.filter(node => node.health === filterStatus || node.status === filterStatus);

  const statusCounts = {
    all: nodes.length,
    healthy: nodes.filter(n => n.health === 'healthy').length,
    warning: nodes.filter(n => n.health === 'warning').length,
    critical: nodes.filter(n => n.health === 'critical').length,
    active: nodes.filter(n => n.status === 'active').length
  };

  return (
    <NodesContainer>
      <Header>
        <Title>🖥️ NameNode & DataNode Status</Title>
        <StatusFilter>
          {Object.entries(statusCounts).map(([status, count]) => (
            <FilterButton
              key={status}
              active={filterStatus === status}
              onClick={() => setFilterStatus(status)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status.toUpperCase()} ({count})
            </FilterButton>
          ))}
        </StatusFilter>
      </Header>

      <NodesGrid>
        <AnimatePresence>
          {filteredNodes.map((node) => (
            <NodeCard
              key={node.id}
              health={node.health}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <NodeHeader>
                <NodeInfo>
                  <NodeName>
                    {getNodeIcon(node.type)}
                    {node.name}
                    <HeartbeatIndicator active={node.status === 'active'} />
                  </NodeName>
                  <NodeType>{node.type} - v{node.version}</NodeType>
                  <NodeAddress>{node.address}:{node.port}</NodeAddress>
                </NodeInfo>
                <StatusBadges>
                  <StatusBadge type="status" value={node.status}>
                    {node.status}
                  </StatusBadge>
                  <StatusBadge type="health" value={node.health}>
                    {getHealthIcon(node.health)}
                    {node.health}
                  </StatusBadge>
                </StatusBadges>
              </NodeHeader>

              <MetricsSection>
                <MetricsTitle>
                  📊 System Metrics
                </MetricsTitle>
                <MetricsGrid>
                  <MetricItem>
                    <MetricLabel>
                      <span><FaMicrochip style={{ marginRight: '0.5rem' }} />CPU</span>
                      <span>{node.metrics.cpuUsage.toFixed(1)}%</span>
                    </MetricLabel>
                    <MetricBar>
                      <MetricFill 
                        value={node.metrics.cpuUsage} 
                        color={getMetricColor(node.metrics.cpuUsage)}
                        initial={{ width: 0 }}
                        animate={{ width: `${node.metrics.cpuUsage}%` }}
                      />
                    </MetricBar>
                  </MetricItem>

                  <MetricItem>
                    <MetricLabel>
                      <span><FaMemory style={{ marginRight: '0.5rem' }} />Memory</span>
                      <span>{node.metrics.memoryUsage.toFixed(1)}%</span>
                    </MetricLabel>
                    <MetricBar>
                      <MetricFill 
                        value={node.metrics.memoryUsage} 
                        color={getMetricColor(node.metrics.memoryUsage)}
                        initial={{ width: 0 }}
                        animate={{ width: `${node.metrics.memoryUsage}%` }}
                      />
                    </MetricBar>
                  </MetricItem>

                  <MetricItem>
                    <MetricLabel>
                      <span><FaHdd style={{ marginRight: '0.5rem' }} />Disk</span>
                      <span>{node.metrics.diskUsage.toFixed(1)}%</span>
                    </MetricLabel>
                    <MetricBar>
                      <MetricFill 
                        value={node.metrics.diskUsage} 
                        color={getMetricColor(node.metrics.diskUsage)}
                        initial={{ width: 0 }}
                        animate={{ width: `${node.metrics.diskUsage}%` }}
                      />
                    </MetricBar>
                  </MetricItem>

                  <MetricItem>
                    <MetricLabel>
                      <span>Heap</span>
                      <span>{node.metrics.heapUsage.toFixed(1)}%</span>
                    </MetricLabel>
                    <MetricBar>
                      <MetricFill 
                        value={node.metrics.heapUsage} 
                        color={getMetricColor(node.metrics.heapUsage)}
                        initial={{ width: 0 }}
                        animate={{ width: `${node.metrics.heapUsage}%` }}
                      />
                    </MetricBar>
                  </MetricItem>
                </MetricsGrid>
              </MetricsSection>

              {node.type === 'NameNode' && (
                <StatsSection>
                  <StatsGrid>
                    <StatItem>
                      <StatValue>{node.blocks?.toLocaleString()}</StatValue>
                      <StatLabel>Total Blocks</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{node.liveNodes}</StatValue>
                      <StatLabel>Live Nodes</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{node.deadNodes}</StatValue>
                      <StatLabel>Dead Nodes</StatLabel>
                    </StatItem>
                  </StatsGrid>
                </StatsSection>
              )}

              {node.type === 'DataNode' && (
                <StatsSection>
                  <StatsGrid>
                    <StatItem>
                      <StatValue>{node.blocks?.toLocaleString()}</StatValue>
                      <StatLabel>Blocks Stored</StatLabel>
                    </StatItem>
                  </StatsGrid>
                </StatsSection>
              )}

              {(node.type === 'ResourceManager' || node.type === 'NodeManager') && (
                <StatsSection>
                  <StatsGrid>
                    <StatItem>
                      <StatValue>{node.containers}</StatValue>
                      <StatLabel>Containers</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{node.allocatedMemory}</StatValue>
                      <StatLabel>Allocated</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{node.availableMemory}</StatValue>
                      <StatLabel>Available</StatLabel>
                    </StatItem>
                  </StatsGrid>
                </StatsSection>
              )}

              <ServicesSection>
                <ServicesTitle>Running Services</ServicesTitle>
                <ServicesList>
                  {node.services.map((service, index) => (
                    <ServiceTag key={index}>{service}</ServiceTag>
                  ))}
                </ServicesList>
              </ServicesSection>

              <div style={{ 
                marginTop: '1.5rem', 
                fontSize: '0.8rem', 
                color: '#7f8c8d',
                display: 'flex',
                justify: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid #ecf0f1'
              }}>
                <span>Started: {node.startTime}</span>
                <span>Last heartbeat: {node.lastHeartbeat}</span>
              </div>
            </NodeCard>
          ))}
        </AnimatePresence>
      </NodesGrid>
    </NodesContainer>
  );
};

export default NodeStatus;