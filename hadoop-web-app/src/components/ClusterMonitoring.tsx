import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaServer, FaMemory, FaMicrochip, FaHdd, FaNetworkWired, FaChartLine } from 'react-icons/fa';

interface MetricData {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: number;
  activeJobs: number;
  throughput: number;
}

interface NodeMetrics {
  nodeId: string;
  status: 'healthy' | 'warning' | 'error';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  containers: number;
  lastHeartbeat: string;
}

const MonitoringContainer = styled.div`
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
`;

const Title = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.8rem;
`;

const StatusIndicator = styled.div<{ status: 'healthy' | 'warning' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => {
    switch (props.status) {
      case 'healthy': return '#2ecc71';
      case 'warning': return '#f39c12';
      case 'error': return '#e74c3c';
      default: return '#95a5a6';
    }
  }};
  color: white;
  font-weight: 600;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
    animation: ${props => props.status === 'healthy' ? 'pulse 2s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const MetricCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ecf0f1;
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const MetricIcon = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.color};
  color: white;
  font-size: 1.2rem;
`;

const MetricTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const MetricSubtext = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ecf0f1;
`;

const ChartTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const NodesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const NodeCard = styled(motion.div)<{ status: string }>`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'healthy': return '#2ecc71';
      case 'warning': return '#f39c12';
      case 'error': return '#e74c3c';
      default: return '#95a5a6';
    }
  }};
`;

const NodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const NodeTitle = styled.h4`
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
`;

const NodeStatus = styled.div<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: ${props => {
    switch (props.status) {
      case 'healthy': return 'rgba(46, 204, 113, 0.2)';
      case 'warning': return 'rgba(243, 156, 18, 0.2)';
      case 'error': return 'rgba(231, 76, 60, 0.2)';
      default: return 'rgba(149, 165, 166, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'healthy': return '#27ae60';
      case 'warning': return '#d68910';
      case 'error': return '#c0392b';
      default: return '#7f8c8d';
    }
  }};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const NodeMetricsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const ProgressBar = styled.div`
  background: #ecf0f1;
  border-radius: 10px;
  height: 6px;
  overflow: hidden;
  margin-top: 0.25rem;
`;

const ProgressFill = styled(motion.div)<{ value: number; color: string }>`
  height: 100%;
  background: ${props => props.color};
  width: ${props => props.value}%;
  transition: width 0.5s ease;
`;

const ClusterMonitoring: React.FC = () => {
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [nodesData, setNodesData] = useState<NodeMetrics[]>([
    {
      nodeId: 'namenode-01',
      status: 'healthy',
      cpuUsage: 45,
      memoryUsage: 67,
      diskUsage: 34,
      containers: 0,
      lastHeartbeat: '2024-01-15 11:30:45'
    },
    {
      nodeId: 'datanode-01',
      status: 'healthy',
      cpuUsage: 78,
      memoryUsage: 82,
      diskUsage: 56,
      containers: 8,
      lastHeartbeat: '2024-01-15 11:30:44'
    },
    {
      nodeId: 'datanode-02',
      status: 'warning',
      cpuUsage: 92,
      memoryUsage: 95,
      diskUsage: 78,
      containers: 12,
      lastHeartbeat: '2024-01-15 11:30:42'
    },
    {
      nodeId: 'resourcemanager-01',
      status: 'healthy',
      cpuUsage: 34,
      memoryUsage: 45,
      diskUsage: 23,
      containers: 2,
      lastHeartbeat: '2024-01-15 11:30:45'
    }
  ]);

  const [clusterStats, setClusterStats] = useState({
    totalNodes: 4,
    healthyNodes: 3,
    totalCores: 32,
    availableCores: 18,
    totalMemory: '128 GB',
    availableMemory: '64 GB',
    totalStorage: '2 TB',
    usedStorage: '756 GB',
    activeJobs: 3,
    totalJobs: 127
  });

  useEffect(() => {
    const generateMetricsData = () => {
      const now = new Date();
      const data: MetricData[] = [];
      
      for (let i = 29; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 2000);
        data.push({
          timestamp: timestamp.toLocaleTimeString(),
          cpuUsage: 30 + Math.random() * 40,
          memoryUsage: 40 + Math.random() * 30,
          diskUsage: 20 + Math.random() * 20,
          networkIO: Math.random() * 100,
          activeJobs: Math.floor(Math.random() * 10) + 1,
          throughput: 50 + Math.random() * 50
        });
      }
      
      setMetricsData(data);
    };

    generateMetricsData();

    const interval = setInterval(() => {
      setMetricsData(prev => {
        const now = new Date();
        const newPoint: MetricData = {
          timestamp: now.toLocaleTimeString(),
          cpuUsage: 30 + Math.random() * 40,
          memoryUsage: 40 + Math.random() * 30,
          diskUsage: 20 + Math.random() * 20,
          networkIO: Math.random() * 100,
          activeJobs: Math.floor(Math.random() * 10) + 1,
          throughput: 50 + Math.random() * 50
        };
        
        return [...prev.slice(1), newPoint];
      });

      // Update node metrics
      setNodesData(prev => prev.map(node => ({
        ...node,
        cpuUsage: Math.max(10, Math.min(95, node.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(95, node.memoryUsage + (Math.random() - 0.5) * 8)),
        diskUsage: Math.max(10, Math.min(85, node.diskUsage + (Math.random() - 0.5) * 5)),
        containers: Math.max(0, node.containers + Math.floor((Math.random() - 0.5) * 4)),
        lastHeartbeat: new Date().toLocaleString(),
        status: node.cpuUsage > 90 || node.memoryUsage > 90 ? 'warning' : 'healthy'
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const resourceUtilizationData = [
    { name: 'CPU', used: 67, available: 33, fill: '#3498db' },
    { name: 'Memory', used: 73, available: 27, fill: '#2ecc71' },
    { name: 'Storage', used: 45, available: 55, fill: '#f39c12' },
  ];

  const getNodeStatusColor = (usage: number) => {
    if (usage > 90) return '#e74c3c';
    if (usage > 75) return '#f39c12';
    return '#2ecc71';
  };

  const overallStatus = nodesData.filter(n => n.status === 'healthy').length === nodesData.length ? 
    'healthy' : nodesData.some(n => n.status === 'error') ? 'error' : 'warning';

  return (
    <MonitoringContainer>
      <Header>
        <Title>📊 Cluster Monitoring Dashboard</Title>
        <StatusIndicator status={overallStatus}>
          Cluster Status: {overallStatus.toUpperCase()}
        </StatusIndicator>
      </Header>

      <MetricsGrid>
        <MetricCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MetricHeader>
            <MetricIcon color="#3498db">
              <FaServer />
            </MetricIcon>
            <MetricTitle>Active Nodes</MetricTitle>
          </MetricHeader>
          <MetricValue>{clusterStats.healthyNodes}/{clusterStats.totalNodes}</MetricValue>
          <MetricSubtext>Healthy / Total Nodes</MetricSubtext>
        </MetricCard>

        <MetricCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MetricHeader>
            <MetricIcon color="#2ecc71">
              <FaMicrochip />
            </MetricIcon>
            <MetricTitle>CPU Cores</MetricTitle>
          </MetricHeader>
          <MetricValue>{clusterStats.availableCores}/{clusterStats.totalCores}</MetricValue>
          <MetricSubtext>Available / Total Cores</MetricSubtext>
        </MetricCard>

        <MetricCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MetricHeader>
            <MetricIcon color="#9b59b6">
              <FaMemory />
            </MetricIcon>
            <MetricTitle>Memory</MetricTitle>
          </MetricHeader>
          <MetricValue>{clusterStats.availableMemory}</MetricValue>
          <MetricSubtext>Available of {clusterStats.totalMemory}</MetricSubtext>
        </MetricCard>

        <MetricCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MetricHeader>
            <MetricIcon color="#e74c3c">
              <FaChartLine />
            </MetricIcon>
            <MetricTitle>Active Jobs</MetricTitle>
          </MetricHeader>
          <MetricValue>{clusterStats.activeJobs}</MetricValue>
          <MetricSubtext>Running / {clusterStats.totalJobs} Total</MetricSubtext>
        </MetricCard>
      </MetricsGrid>

      <ChartsGrid>
        <ChartContainer>
          <ChartTitle>System Metrics Over Time</ChartTitle>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cpuUsage" stroke="#3498db" name="CPU %" strokeWidth={2} />
              <Line type="monotone" dataKey="memoryUsage" stroke="#2ecc71" name="Memory %" strokeWidth={2} />
              <Line type="monotone" dataKey="diskUsage" stroke="#f39c12" name="Disk %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer>
          <ChartTitle>Resource Utilization</ChartTitle>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={resourceUtilizationData}
                dataKey="used"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({name, value}) => `${name}: ${value}%`}
              >
                {resourceUtilizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer>
          <ChartTitle>Network I/O & Throughput</ChartTitle>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="networkIO" stackId="1" stroke="#9b59b6" fill="#9b59b6" name="Network I/O" />
              <Area type="monotone" dataKey="throughput" stackId="2" stroke="#1abc9c" fill="#1abc9c" name="Throughput" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer>
          <ChartTitle>Active Jobs History</ChartTitle>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metricsData.slice(-10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="activeJobs" fill="#e74c3c" name="Active Jobs" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartsGrid>

      <div>
        <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Node Status</h3>
        <NodesGrid>
          {nodesData.map((node, index) => (
            <NodeCard
              key={node.nodeId}
              status={node.status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <NodeHeader>
                <NodeTitle>{node.nodeId}</NodeTitle>
                <NodeStatus status={node.status}>{node.status}</NodeStatus>
              </NodeHeader>
              
              <NodeMetricsRow>
                <span>CPU Usage</span>
                <span>{node.cpuUsage.toFixed(1)}%</span>
              </NodeMetricsRow>
              <ProgressBar>
                <ProgressFill 
                  value={node.cpuUsage} 
                  color={getNodeStatusColor(node.cpuUsage)}
                  initial={{ width: 0 }}
                  animate={{ width: `${node.cpuUsage}%` }}
                />
              </ProgressBar>

              <NodeMetricsRow>
                <span>Memory Usage</span>
                <span>{node.memoryUsage.toFixed(1)}%</span>
              </NodeMetricsRow>
              <ProgressBar>
                <ProgressFill 
                  value={node.memoryUsage} 
                  color={getNodeStatusColor(node.memoryUsage)}
                  initial={{ width: 0 }}
                  animate={{ width: `${node.memoryUsage}%` }}
                />
              </ProgressBar>

              <NodeMetricsRow>
                <span>Disk Usage</span>
                <span>{node.diskUsage.toFixed(1)}%</span>
              </NodeMetricsRow>
              <ProgressBar>
                <ProgressFill 
                  value={node.diskUsage} 
                  color={getNodeStatusColor(node.diskUsage)}
                  initial={{ width: 0 }}
                  animate={{ width: `${node.diskUsage}%` }}
                />
              </ProgressBar>

              <NodeMetricsRow style={{ marginTop: '1rem' }}>
                <span>Containers</span>
                <span>{node.containers}</span>
              </NodeMetricsRow>

              <div style={{ 
                marginTop: '1rem', 
                fontSize: '0.8rem', 
                color: '#7f8c8d',
                borderTop: '1px solid #ecf0f1',
                paddingTop: '0.5rem'
              }}>
                Last heartbeat: {node.lastHeartbeat}
              </div>
            </NodeCard>
          ))}
        </NodesGrid>
      </div>
    </MonitoringContainer>
  );
};

export default ClusterMonitoring;