# 🐘 Hadoop Ecosystem Simulator

An interactive web application that simulates the Hadoop ecosystem, providing visual insights into HDFS, YARN, and cluster components with real-time monitoring and educational features.

## ✨ Features

### 🏗️ Architecture Overview
- Interactive Hadoop ecosystem architecture diagram
- Visual representation of NameNode, DataNode, ResourceManager, and NodeManager
- Step-by-step HDFS data flow explanation
- YARN application lifecycle visualization
- Educational tooltips and component explanations

### 📁 HDFS File Browser
- Interactive file system browser with folder navigation
- Drag-and-drop file operations simulation
- File upload/download simulation
- Real-time file system operations
- Breadcrumb navigation
- File metadata display (size, replication, blocks)

### ⚙️ YARN Job Tracker
- Real-time job monitoring and tracking
- Multiple job types support (MapReduce, Spark, Hive)
- Job lifecycle visualization (stages, progress, containers)
- Interactive job submission
- Auto-refresh functionality
- Container allocation and status tracking

### 📊 Cluster Monitoring Dashboard
- Real-time system metrics visualization
- Interactive charts and graphs using Recharts
- Resource utilization monitoring (CPU, Memory, Storage)
- Network I/O and throughput metrics
- Active job history tracking
- Cluster health status indicators

### 🖥️ Node Status Management
- Comprehensive node health monitoring
- Real-time metrics for all Hadoop nodes
- Health status filtering (Healthy, Warning, Critical)
- Detailed system metrics (CPU, Memory, Disk, Heap)
- Service status tracking
- Heartbeat monitoring

## 🚀 Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Styling**: Styled Components for component-level styling
- **Animations**: Framer Motion for smooth animations and transitions
- **Charts**: Recharts for interactive data visualization
- **Icons**: Custom emoji icons for better cross-platform compatibility
- **Drag & Drop**: @dnd-kit for drag-and-drop functionality
- **Build Tool**: Create React App with TypeScript template

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation Steps

1. **Navigate to the app directory**
```bash
cd hadoop-web-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

4. **Build for production**
```bash
CI=false npm run build
```

The application will be available at `http://localhost:3000`

## 🎯 Usage Guide

### Navigation
The application features a tabbed interface with five main sections:

1. **Architecture** - Overview of Hadoop ecosystem components
2. **HDFS Browser** - File system navigation and operations
3. **YARN Jobs** - Job monitoring and management  
4. **Cluster Monitoring** - Real-time system metrics
5. **Node Status** - Detailed node health information

### Interactive Features

#### File Operations
- Click folders to navigate through the HDFS directory structure
- Use toolbar buttons for upload, download, delete, and create operations
- Drag and drop files in the designated drop zone

#### Job Management
- Submit new jobs using the "Submit Job" button
- Toggle auto-refresh to see real-time updates
- Monitor job progress, stages, and container allocation

#### Monitoring
- View real-time charts that update automatically
- Filter nodes by health status (All, Healthy, Warning, Critical)
- Monitor system metrics with color-coded progress bars

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers (1920px and above)
- Laptops and tablets (768px - 1919px)
- Mobile devices (320px - 767px)

## 🎨 Design Features

### Visual Elements
- **Modern UI**: Clean, professional interface with glassmorphism effects
- **Color Coding**: Intuitive color schemes for different states (healthy=green, warning=orange, error=red)
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Interactive Charts**: Hover effects, tooltips, and responsive data visualization

### Educational Aspects
- Step-by-step process explanations
- Interactive component descriptions
- Real-time data flow demonstrations
- Comprehensive system monitoring

## 📊 Data Simulation

The simulator includes realistic data for:

### HDFS Structure
```
/
├── user/
│   ├── hadoop/
│   │   ├── input.txt (1.2 MB, 3 replicas, 1 block)
│   │   └── wordcount-output/
│   │       └── part-r-00000 (856 KB, 3 replicas, 1 block)
│   └── data/
│       └── sales.csv (45.7 MB, 3 replicas, 4 blocks)
└── tmp/
```

### Node Configuration
- **NameNode**: 10.0.1.10:9870 (HDFS Master)
- **DataNodes**: 10.0.1.11:9864, 10.0.1.12:9864 (HDFS Workers)
- **ResourceManager**: 10.0.1.20:8088 (YARN Master)
- **NodeManager**: 10.0.1.21:8042 (YARN Worker)

## 🌟 Key Highlights

- **Educational Focus**: Designed for learning Hadoop concepts
- **Real-time Simulation**: Dynamic updates and live data
- **Interactive Experience**: Click, drag, and explore features
- **Professional UI**: Enterprise-grade design and animations
- **Cross-platform**: Works on all modern browsers and devices
- **Performance Optimized**: Efficient rendering and smooth interactions

## 📖 Learning Objectives

This simulator helps users understand:
- Hadoop distributed file system (HDFS) architecture
- YARN resource management and job scheduling
- Cluster monitoring and maintenance
- Node health and system metrics
- Data flow between Hadoop components
- Real-world cluster operations and troubleshooting

---

**Built with ❤️ for the Hadoop community**