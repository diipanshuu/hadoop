import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface YARNJob {
  id: string;
  name: string;
  type: 'MapReduce' | 'Spark' | 'Hive' | 'Pig';
  status: 'SUBMITTED' | 'ACCEPTED' | 'RUNNING' | 'FINISHED' | 'FAILED' | 'KILLED';
  progress: number;
  startTime: string;
  finishTime?: string;
  user: string;
  queue: string;
  memory: string;
  vcores: number;
  containers: Container[];
  stages: JobStage[];
}

interface Container {
  id: string;
  nodeId: string;
  status: 'RUNNING' | 'COMPLETE' | 'FAILED';
  memory: string;
  vcores: number;
}

interface JobStage {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  progress: number;
  tasks: number;
  completedTasks: number;
}

const JobsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const Controls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ControlButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: #3498db;
  color: white;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: #2980b9;
  }
`;

const JobsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
`;

const JobCard = styled(motion.div)<{ status: string }>`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'RUNNING': return '#3498db';
      case 'FINISHED': return '#2ecc71';
      case 'FAILED': return '#e74c3c';
      case 'KILLED': return '#f39c12';
      case 'ACCEPTED': return '#9b59b6';
      default: return '#95a5a6';
    }
  }};
  position: relative;
  overflow: hidden;
`;

const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const JobInfo = styled.div`
  flex: 1;
`;

const JobName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
`;

const JobMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #7f8c8d;
  flex-wrap: wrap;
`;

const StatusBadge = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => {
    switch (props.status) {
      case 'RUNNING': return '#3498db';
      case 'FINISHED': return '#2ecc71';
      case 'FAILED': return '#e74c3c';
      case 'KILLED': return '#f39c12';
      case 'ACCEPTED': return '#9b59b6';
      default: return '#95a5a6';
    }
  }};
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
`;

const ProgressSection = styled.div`
  margin: 1rem 0;
`;

const ProgressBar = styled.div`
  background: #ecf0f1;
  border-radius: 10px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled(motion.div)<{ progress: number; status: string }>`
  height: 100%;
  background: ${props => {
    switch (props.status) {
      case 'RUNNING': return 'linear-gradient(90deg, #3498db, #5dade2)';
      case 'FINISHED': return 'linear-gradient(90deg, #2ecc71, #58d68d)';
      case 'FAILED': return 'linear-gradient(90deg, #e74c3c, #ec7063)';
      default: return 'linear-gradient(90deg, #95a5a6, #aab7b8)';
    }
  }};
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  text-align: right;
`;

const StagesContainer = styled.div`
  margin-top: 1rem;
`;

const StageTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
`;

const StagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StageItem = styled.div<{ status: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: ${props => {
    switch (props.status) {
      case 'RUNNING': return 'rgba(52, 152, 219, 0.1)';
      case 'COMPLETE': return 'rgba(46, 204, 113, 0.1)';
      case 'FAILED': return 'rgba(231, 76, 60, 0.1)';
      default: return 'rgba(149, 165, 166, 0.1)';
    }
  }};
  border-radius: 6px;
  font-size: 0.9rem;
`;

const StageProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #7f8c8d;
`;

const ContainersSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
`;

const ContainerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ContainerItem = styled(motion.div)<{ status: string }>`
  padding: 0.5rem;
  background: ${props => {
    switch (props.status) {
      case 'RUNNING': return 'linear-gradient(135deg, #3498db, #5dade2)';
      case 'COMPLETE': return 'linear-gradient(135deg, #2ecc71, #58d68d)';
      case 'FAILED': return 'linear-gradient(135deg, #e74c3c, #ec7063)';
      default: return 'linear-gradient(135deg, #95a5a6, #aab7b8)';
    }
  }};
  color: white;
  border-radius: 6px;
  font-size: 0.8rem;
  text-align: center;
`;

const YARNJobs: React.FC = () => {
  const [jobs, setJobs] = useState<YARNJob[]>([
    {
      id: 'job_1234567890_0001',
      name: 'WordCount MapReduce Job',
      type: 'MapReduce',
      status: 'RUNNING',
      progress: 65,
      startTime: '2024-01-15 10:30:15',
      user: 'hadoop',
      queue: 'default',
      memory: '2048 MB',
      vcores: 2,
      containers: [
        { id: 'container_1', nodeId: 'node1', status: 'RUNNING', memory: '1024 MB', vcores: 1 },
        { id: 'container_2', nodeId: 'node2', status: 'COMPLETE', memory: '1024 MB', vcores: 1 }
      ],
      stages: [
        { id: 'map', name: 'Map', status: 'COMPLETE', progress: 100, tasks: 4, completedTasks: 4 },
        { id: 'reduce', name: 'Reduce', status: 'RUNNING', progress: 30, tasks: 2, completedTasks: 0 }
      ]
    },
    {
      id: 'job_1234567890_0002',
      name: 'Data Processing Spark Job',
      type: 'Spark',
      status: 'FINISHED',
      progress: 100,
      startTime: '2024-01-15 09:15:30',
      finishTime: '2024-01-15 09:45:12',
      user: 'dataeng',
      queue: 'production',
      memory: '4096 MB',
      vcores: 4,
      containers: [
        { id: 'container_3', nodeId: 'node1', status: 'COMPLETE', memory: '2048 MB', vcores: 2 },
        { id: 'container_4', nodeId: 'node3', status: 'COMPLETE', memory: '2048 MB', vcores: 2 }
      ],
      stages: [
        { id: 'stage1', name: 'Load Data', status: 'COMPLETE', progress: 100, tasks: 8, completedTasks: 8 },
        { id: 'stage2', name: 'Transform', status: 'COMPLETE', progress: 100, tasks: 16, completedTasks: 16 },
        { id: 'stage3', name: 'Save Results', status: 'COMPLETE', progress: 100, tasks: 4, completedTasks: 4 }
      ]
    },
    {
      id: 'job_1234567890_0003',
      name: 'Log Analysis Hive Query',
      type: 'Hive',
      status: 'ACCEPTED',
      progress: 0,
      startTime: '2024-01-15 11:00:00',
      user: 'analyst',
      queue: 'analytics',
      memory: '1024 MB',
      vcores: 1,
      containers: [],
      stages: [
        { id: 'compile', name: 'Compile Query', status: 'PENDING', progress: 0, tasks: 1, completedTasks: 0 },
        { id: 'execute', name: 'Execute Query', status: 'PENDING', progress: 0, tasks: 0, completedTasks: 0 }
      ]
    }
  ]);

  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setJobs(currentJobs => 
        currentJobs.map(job => {
          if (job.status === 'RUNNING' && job.progress < 100) {
            const newProgress = Math.min(job.progress + Math.random() * 10, 100);
            const updatedStages = job.stages.map(stage => {
              if (stage.status === 'RUNNING' && stage.progress < 100) {
                return {
                  ...stage,
                  progress: Math.min(stage.progress + Math.random() * 15, 100),
                  completedTasks: Math.min(stage.completedTasks + Math.floor(Math.random() * 2), stage.tasks)
                };
              }
              return stage;
            });
            
            return {
              ...job,
              progress: newProgress,
              stages: updatedStages,
              status: newProgress >= 100 ? 'FINISHED' : job.status,
              finishTime: newProgress >= 100 ? new Date().toLocaleString() : job.finishTime
            };
          }
          return job;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'RUNNING': return '⏳';
      case 'FINISHED': return '✅';
      case 'FAILED': return '❌';
      case 'KILLED': return '⏹️';
      case 'ACCEPTED': return '🕐';
      default: return '🕐';
    }
  };

  const submitNewJob = () => {
    const newJob: YARNJob = {
      id: `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: `Sample Job ${Date.now()}`,
      type: 'MapReduce',
      status: 'SUBMITTED',
      progress: 0,
      startTime: new Date().toLocaleString(),
      user: 'demo',
      queue: 'default',
      memory: '1024 MB',
      vcores: 1,
      containers: [],
      stages: [
        { id: 'map', name: 'Map', status: 'PENDING', progress: 0, tasks: 2, completedTasks: 0 },
        { id: 'reduce', name: 'Reduce', status: 'PENDING', progress: 0, tasks: 1, completedTasks: 0 }
      ]
    };

    setJobs(prev => [newJob, ...prev]);
    
    // Simulate job acceptance and start
    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id ? { ...job, status: 'ACCEPTED' } : job
      ));
    }, 1000);
    
    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id ? { 
          ...job, 
          status: 'RUNNING',
          stages: job.stages.map((stage, index) => 
            index === 0 ? { ...stage, status: 'RUNNING' } : stage
          )
        } : job
      ));
    }, 3000);
  };

  return (
    <JobsContainer>
      <Header>
        <Title>⚙️ YARN Job Tracker</Title>
        <Controls>
          <ControlButton
            onClick={submitNewJob}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ▶️ Submit Job
          </ControlButton>
          <ControlButton
            onClick={() => setAutoRefresh(!autoRefresh)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ background: autoRefresh ? '#2ecc71' : '#95a5a6' }}
          >
            🔄 Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </ControlButton>
        </Controls>
      </Header>

      <JobsList>
        <AnimatePresence>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              status={job.status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <JobHeader>
                <JobInfo>
                  <JobName>{job.name}</JobName>
                  <JobMeta>
                    <span>ID: {job.id}</span>
                    <span>Type: {job.type}</span>
                    <span>User: {job.user}</span>
                    <span>Queue: {job.queue}</span>
                    <span>Memory: {job.memory}</span>
                    <span>vCores: {job.vcores}</span>
                  </JobMeta>
                </JobInfo>
                <StatusBadge status={job.status}>
                  {getStatusIcon(job.status)}
                  {job.status}
                </StatusBadge>
              </JobHeader>

              <ProgressSection>
                <ProgressBar>
                  <ProgressFill 
                    progress={job.progress} 
                    status={job.status}
                    initial={{ width: 0 }}
                    animate={{ width: `${job.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </ProgressBar>
                <ProgressText>{job.progress.toFixed(1)}% Complete</ProgressText>
              </ProgressSection>

              <StagesContainer>
                <StageTitle>Job Stages</StageTitle>
                <StagesList>
                  {job.stages.map((stage) => (
                    <StageItem key={stage.id} status={stage.status}>
                      <div>
                        <strong>{stage.name}</strong> - {stage.status}
                      </div>
                      <StageProgress>
                        {stage.completedTasks}/{stage.tasks} tasks ({stage.progress.toFixed(0)}%)
                      </StageProgress>
                    </StageItem>
                  ))}
                </StagesList>
              </StagesContainer>

              {job.containers.length > 0 && (
                <ContainersSection>
                  <StageTitle>Containers ({job.containers.length})</StageTitle>
                  <ContainerGrid>
                    {job.containers.map((container) => (
                      <ContainerItem
                        key={container.id}
                        status={container.status}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div>{container.nodeId}</div>
                        <div>{container.memory}</div>
                        <div>{container.status}</div>
                      </ContainerItem>
                    ))}
                  </ContainerGrid>
                </ContainersSection>
              )}

              <div style={{ 
                marginTop: '1rem', 
                fontSize: '0.9rem', 
                color: '#7f8c8d',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Started: {job.startTime}</span>
                {job.finishTime && <span>Finished: {job.finishTime}</span>}
              </div>
            </JobCard>
          ))}
        </AnimatePresence>
      </JobsList>

      <style>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </JobsContainer>
  );
};

export default YARNJobs;