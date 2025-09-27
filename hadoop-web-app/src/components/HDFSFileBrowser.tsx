import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
  replication?: number;
  blocks?: number;
  path: string;
  children?: FileSystemItem[];
}

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ecf0f1;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.8rem;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ToolbarButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: #3498db;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #2980b9;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

const PathBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const PathSegment = styled(motion.span)`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  color: #495057;
  
  &:hover {
    background: #e9ecef;
    color: #2c3e50;
  }
`;

const FileListContainer = styled.div`
  flex: 1;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
`;

const FileListHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
`;

const FileList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const FileItemContainer = styled(motion.div)<{ isDragging?: boolean }>`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.isDragging ? '#e3f2fd' : 'transparent'};
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FileIcon = styled.div<{ type: string }>`
  color: ${props => props.type === 'folder' ? '#f39c12' : '#3498db'};
  font-size: 1.1rem;
`;

const FileName = styled.span`
  color: #2c3e50;
  font-weight: 500;
`;

const FileDetails = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const DropZone = styled(motion.div)<{ isActive: boolean }>`
  border: 2px dashed ${props => props.isActive ? '#3498db' : '#bdc3c7'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: ${props => props.isActive ? '#3498db' : '#7f8c8d'};
  background: ${props => props.isActive ? '#ebf3fd' : '#f8f9fa'};
  margin-top: 1rem;
  transition: all 0.3s ease;
`;

const SortableFileItem: React.FC<{ item: FileSystemItem; onItemClick: (item: FileSystemItem) => void }> = ({ 
  item, 
  onItemClick 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <FileItemContainer
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onItemClick(item)}
      isDragging={isDragging}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <FileInfo>
        <FileIcon type={item.type}>
          {item.type === 'folder' ? '📁' : '📄'}
        </FileIcon>
        <FileName>{item.name}</FileName>
      </FileInfo>
      <FileDetails>{item.size || '-'}</FileDetails>
      <FileDetails>{item.modified}</FileDetails>
      <FileDetails>{item.replication || '-'}</FileDetails>
      <FileDetails>{item.blocks || '-'}</FileDetails>
    </FileItemContainer>
  );
};

const HDFSFileBrowser: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
    {
      id: '1',
      name: 'user',
      type: 'folder',
      modified: '2024-01-15 10:30',
      path: '/user',
      children: [
        {
          id: '2',
          name: 'hadoop',
          type: 'folder',
          modified: '2024-01-15 10:30',
          path: '/user/hadoop',
          children: [
            {
              id: '3',
              name: 'input.txt',
              type: 'file',
              size: '1.2 MB',
              modified: '2024-01-15 09:15',
              replication: 3,
              blocks: 1,
              path: '/user/hadoop/input.txt'
            },
            {
              id: '4',
              name: 'wordcount-output',
              type: 'folder',
              modified: '2024-01-15 11:45',
              path: '/user/hadoop/wordcount-output',
              children: [
                {
                  id: '5',
                  name: 'part-r-00000',
                  type: 'file',
                  size: '856 KB',
                  modified: '2024-01-15 11:45',
                  replication: 3,
                  blocks: 1,
                  path: '/user/hadoop/wordcount-output/part-r-00000'
                }
              ]
            }
          ]
        },
        {
          id: '6',
          name: 'data',
          type: 'folder',
          modified: '2024-01-14 16:20',
          path: '/user/data',
          children: [
            {
              id: '7',
              name: 'sales.csv',
              type: 'file',
              size: '45.7 MB',
              modified: '2024-01-14 16:20',
              replication: 3,
              blocks: 4,
              path: '/user/data/sales.csv'
            }
          ]
        }
      ]
    },
    {
      id: '8',
      name: 'tmp',
      type: 'folder',
      modified: '2024-01-15 12:00',
      path: '/tmp',
      children: []
    }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getCurrentItems = () => {
    if (currentPath === '/') {
      return fileSystem;
    }
    
    const findItemsByPath = (items: FileSystemItem[], path: string): FileSystemItem[] => {
      for (const item of items) {
        if (item.path === path && item.children) {
          return item.children;
        }
        if (item.children) {
          const found = findItemsByPath(item.children, path);
          if (found.length > 0) return found;
        }
      }
      return [];
    };
    
    return findItemsByPath(fileSystem, currentPath);
  };

  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      setCurrentPath(item.path);
    }
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
  };

  const getPathSegments = () => {
    if (currentPath === '/') return [{ name: 'root', path: '/' }];
    
    const segments = currentPath.split('/').filter(Boolean);
    const pathSegments = [{ name: 'root', path: '/' }];
    
    let currentSegmentPath = '';
    segments.forEach(segment => {
      currentSegmentPath += `/${segment}`;
      pathSegments.push({ name: segment, path: currentSegmentPath });
    });
    
    return pathSegments;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const items = getCurrentItems();
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over?.id);
      
      // In a real implementation, you would update the file system here
      console.log(`Moving ${active.id} from ${oldIndex} to ${newIndex}`);
    }
  };

  const handleFileUpload = () => {
    // Simulate file upload
    const newFile: FileSystemItem = {
      id: Date.now().toString(),
      name: `uploaded_file_${Date.now()}.txt`,
      type: 'file',
      size: '2.3 MB',
      modified: new Date().toLocaleString(),
      replication: 3,
      blocks: 1,
      path: `${currentPath}${currentPath === '/' ? '' : '/'}uploaded_file_${Date.now()}.txt`
    };
    
    // In a real implementation, you would update the file system structure
    console.log('Uploading file:', newFile);
  };

  const currentItems = getCurrentItems();

  return (
    <BrowserContainer>
      <Header>
        <Title>📁 HDFS File Browser</Title>
        <Toolbar>
          <ToolbarButton
            onClick={handleFileUpload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ⬆️ Upload
          </ToolbarButton>
          <ToolbarButton
            disabled={selectedItems.length === 0}
            whileHover={{ scale: selectedItems.length > 0 ? 1.05 : 1 }}
            whileTap={{ scale: selectedItems.length > 0 ? 0.95 : 1 }}
          >
            ⬇️ Download
          </ToolbarButton>
          <ToolbarButton
            disabled={selectedItems.length === 0}
            whileHover={{ scale: selectedItems.length > 0 ? 1.05 : 1 }}
            whileTap={{ scale: selectedItems.length > 0 ? 0.95 : 1 }}
          >
            🗑️ Delete
          </ToolbarButton>
          <ToolbarButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ➕ New Folder
          </ToolbarButton>
        </Toolbar>
      </Header>

      <PathBar>
        <span 
          style={{ color: '#3498db', cursor: 'pointer' }}
          onClick={() => navigateToPath('/')}
        >
          🏠
        </span>
        {getPathSegments().map((segment, index) => (
          <React.Fragment key={segment.path}>
            {index > 0 && <span style={{ color: '#bdc3c7' }}>/</span>}
            <PathSegment
              onClick={() => navigateToPath(segment.path)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {segment.name}
            </PathSegment>
          </React.Fragment>
        ))}
      </PathBar>

      <FileListContainer>
        <FileListHeader>
          <div>Name</div>
          <div>Size</div>
          <div>Modified</div>
          <div>Replication</div>
          <div>Blocks</div>
        </FileListHeader>
        
        <FileList>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentItems.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {currentItems.map((item) => (
                  <SortableFileItem
                    key={item.id}
                    item={item}
                    onItemClick={handleItemClick}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
          
          {currentItems.length === 0 && (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: '#7f8c8d',
              fontStyle: 'italic'
            }}>
              This directory is empty
            </div>
          )}
        </FileList>
      </FileListContainer>

      <DropZone
        isActive={false}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⬆️</div>
        <div>Drop files here to upload to HDFS</div>
        <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
          Files will be automatically replicated across DataNodes
        </div>
      </DropZone>
    </BrowserContainer>
  );
};

export default HDFSFileBrowser;