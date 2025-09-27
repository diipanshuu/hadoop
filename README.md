# Hadoop Cluster with Docker Compose - Complete Setup Guide

## Overview

This guide sets up a complete Hadoop ecosystem using Docker Compose, including HDFS, YARN, and Hue web interface for cluster management. The setup creates a distributed Hadoop cluster with separate containers for each service.

## Architecture

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   NameNode      │  │   DataNode      │  │ ResourceManager │  │  NodeManager    │
│   (HDFS Master) │  │   (HDFS Worker) │  │   (YARN Master) │  │  (YARN Worker)  │
│   Port: 9870    │  │   Ports:        │  │   Port: 8088    │  │                 │
│                 │  │   9866, 9864    │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
                                    │
                            ┌─────────────────┐
                            │   Hue Service   │
                            │   (Web GUI)     │
                            │   Port: 8888    │
                            └─────────────────┘
```

## Prerequisites

- Docker and Docker Compose installed
- Azure VM or any Linux server
- At least 4GB RAM and 20GB disk space

## Quick Start

### 1. Create Project Directory

```bash
mkdir hadoop
cd hadoop
```

### 2. Create Configuration Files

#### Create `config` file:
```bash
cat > config << 'EOF'
CORE-SITE.XML_fs.default.name=hdfs://namenode
CORE-SITE.XML_fs.defaultFS=hdfs://namenode
CORE-SITE.XML_hadoop.proxyuser.hue.hosts=*
CORE-SITE.XML_hadoop.proxyuser.hue.groups=*
HDFS-SITE.XML_dfs.namenode.rpc-address=namenode:8020
HDFS-SITE.XML_dfs.replication=1
HDFS-SITE.XML_dfs.webhdfs.enabled=true
MAPRED-SITE.XML_mapreduce.framework.name=yarn
MAPRED-SITE.XML_yarn.app.mapreduce.am.env=HADOOP_MAPRED_HOME=$HADOOP_HOME
MAPRED-SITE.XML_mapreduce.map.env=HADOOP_MAPRED_HOME=$HADOOP_HOME
MAPRED-SITE.XML_mapreduce.reduce.env=HADOOP_MAPRED_HOME=$HADOOP_HOME
YARN-SITE.XML_yarn.resourcemanager.hostname=resourcemanager
YARN-SITE.XML_yarn.nodemanager.pmem-check-enabled=false
YARN-SITE.XML_yarn.nodemanager.delete.debug-delay-sec=600
YARN-SITE.XML_yarn.nodemanager.vmem-check-enabled=false
YARN-SITE.XML_yarn.nodemanager.aux-services=mapreduce_shuffle
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.maximum-applications=10000
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.maximum-am-resource-percent=0.1
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.resource-calculator=org.apache.hadoop.yarn.util.resource.DefaultResourceCalculator
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.root.queues=default
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.root.default.capacity=100
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.root.default.user-limit-factor=1
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.root.default.maximum-capacity=100
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.root.default.state=RUNNING
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.root.default.acl_submit_applications=*
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.root.default.acl_administer_queue=*
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.node-locality-delay=40
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.queue-mappings=
CAPACITY-SCHEDULER.XML_yarn.scheduler.capacity.queue-mappings-override.enable=false
HDFS-SITE.XML_dfs.datanode.hostname=YOUR_SERVER_IP
EOF
```

> **Important**: Replace `YOUR_SERVER_IP` with your actual server's public IP address.

#### Create `docker-compose.yaml` file:
```bash
cat > docker-compose.yaml << 'EOF'
version: "2"
services:
   namenode:
      image: apache/hadoop:3
      hostname: namenode
      command: ["hdfs", "namenode"]
      ports:
        - 9870:9870
      env_file:
        - ./config
      environment:
          ENSURE_NAMENODE_DIR: "/tmp/hadoop-root/dfs/name"
   datanode:
      image: apache/hadoop:3
      command: ["hdfs", "datanode"]
      ports:
        - 9866:9866
        - 9864:9864
      env_file:
        - ./config
   resourcemanager:
      image: apache/hadoop:3
      hostname: resourcemanager
      command: ["yarn", "resourcemanager"]
      ports:
         - 8088:8088
      env_file:
        - ./config
      volumes:
        - ./test.sh:/opt/test.sh
   nodemanager:
      image: apache/hadoop:3
      command: ["yarn", "nodemanager"]
      env_file:
        - ./config
EOF
```

### 3. Start Hadoop Cluster

```bash
# Start all Hadoop services
docker-compose up -d

# Verify all containers are running
docker-compose ps
```

### 4. Deploy Hue Web Interface

```bash
# Start Hue service connected to Hadoop network
docker run -it -d -p 8888:8888 --network=hadoop_default -e HADOOP_USER_NAME=superuser --name hue-service gethue/hue:latest
```

### 5. Configure Hue

#### Install vim in Hue container:
```bash
docker exec -it --user root hue-service /bin/bash
apt-get update
apt-get install vim
```

#### Edit Hue configuration:
```bash
vim /usr/share/hue/desktop/conf/hue.ini
```

#### Update the following sections in hue.ini:

```ini
###########################################################################
# Settings to configure your Hadoop cluster.
###########################################################################
[hadoop]
# Configuration for HDFS NameNode
# ------------------------------------------------------------------------
[[hdfs_clusters]]
  # HA support by using HttpFs
[[[default]]]
# Enter the filesystem uri
fs_defaultfs=hdfs://namenode:8020
# NameNode logical name.
## logical_name=
# Use WebHdfs/HttpFs as the communication mechanism.
# Domain should be the NameNode or HttpFs host.
# Default port is 14000 for HttpFs.
webhdfs_url=http://namenode:9870/webhdfs/v1
# Change this if your HDFS cluster is Kerberos-secured
## security_enabled=false

# Configuration for YARN (MR2)
# ------------------------------------------------------------------------
[[yarn_clusters]]
[[[default]]]
# Enter the host on which you are running the ResourceManager
resourcemanager_host=resourcemanager
# The port where the ResourceManager IPC listens on
## resourcemanager_port=8032
# Whether to submit jobs to this cluster
submit_to=True
# Resource Manager logical name (required for HA)
## logical_name=
# Change this if your YARN cluster is Kerberos-secured
## security_enabled=false
# URL of the ResourceManager API
resourcemanager_api_url=http://resourcemanager:8088
# URL of the ProxyServer API
proxy_api_url=http://resourcemanager:8088
```

#### Restart Hue service:
```bash
exit  # Exit the Hue container
docker restart hue-service
```

### 6. Setup HDFS User Directories

```bash
# Access NameNode container
docker exec -it hadoop_namenode_1 /bin/bash

# Create necessary directories and set permissions
hdfs dfs -chown hdfs:supergroup /
hdfs dfs -mkdir /user
hdfs dfs -mkdir /user/superuser
hdfs dfs -chown superuser:supergroup /user/superuser

# Exit the container
exit
```

## Access Points

After successful setup, you can access the following web interfaces:

| Service | URL | Description |
|---------|-----|-------------|
| **NameNode Web UI** | `http://YOUR_SERVER_IP:9870` | HDFS management and monitoring |
| **DataNode Web UI** | `http://YOUR_SERVER_IP:9864` | DataNode status and logs |
| **ResourceManager Web UI** | `http://YOUR_SERVER_IP:8088` | YARN job tracking and cluster resources |
| **Hue Web GUI** | `http://YOUR_SERVER_IP:8888` | Complete Hadoop ecosystem management |

> Replace `YOUR_SERVER_IP` with your actual server IP address.

## Basic Usage Examples

### Using Command Line Interface

```bash
# Access NameNode container
docker exec -it hadoop_namenode_1 /bin/bash

# Check HDFS status
hdfs dfsadmin -report

# List HDFS directories
hdfs dfs -ls /

# Create a directory
hdfs dfs -mkdir /test

# Upload a file to HDFS
echo "Hello Hadoop" > sample.txt
hdfs dfs -put sample.txt /test/

# Download a file from HDFS
hdfs dfs -get /test/sample.txt ./downloaded.txt

# View file content
hdfs dfs -cat /test/sample.txt
```

### Using Hue Web Interface

1. Open `http://YOUR_SERVER_IP:8888` in your browser
2. Create a new user account (first user becomes admin)
3. Navigate to **File Browser** to manage HDFS files
4. Use **Job Browser** to monitor YARN applications
5. Access **Query Editors** for Hive, Impala, or Spark SQL

## Configuration Details

### Key Configuration Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `dfs.replication` | 1 | Data replication factor (development setup) |
| `yarn.nodemanager.pmem-check-enabled` | false | Disable physical memory checks |
| `yarn.nodemanager.vmem-check-enabled` | false | Disable virtual memory checks |
| `mapreduce.framework.name` | yarn | Use YARN for MapReduce jobs |
| `yarn.scheduler.capacity.maximum-applications` | 10000 | Maximum concurrent applications |

### Network Configuration

- **Internal Network**: `hadoop_default` (Docker network)
- **NameNode RPC**: Port 8020 (internal)
- **DataNode Data Transfer**: Port 9866
- **Web UIs**: Ports 9870, 9864, 8088, 8888

## Troubleshooting

### Common Issues

1. **Container fails to start**:
   ```bash
   # Check logs
   docker-compose logs [service_name]
   
   # Check container status
   docker-compose ps
   ```

2. **Cannot access web UIs**:
   - Verify firewall settings allow the required ports
   - Check if services are running: `docker-compose ps`
   - Ensure correct IP address in URLs

3. **Hue cannot connect to Hadoop**:
   - Verify Hue configuration in `/usr/share/hue/desktop/conf/hue.ini`
   - Check if Hue container is on the same network: `docker network ls`
   - Restart Hue service: `docker restart hue-service`

4. **Permission denied in HDFS**:
   ```bash
   # Fix HDFS permissions
   docker exec -it hadoop_namenode_1 /bin/bash
   hdfs dfs -chown -R superuser:supergroup /user/superuser
   ```

### Useful Commands

```bash
# View all containers
docker ps -a

# Check container logs
docker logs [container_name]

# Access container shell
docker exec -it [container_name] /bin/bash

# Restart specific service
docker-compose restart [service_name]

# Stop all services
docker-compose down

# Remove all containers and networks
docker-compose down -v
```

## Production Considerations

This setup is designed for **development and learning purposes**. For production use, consider:

1. **High Availability**: Deploy multiple NameNodes and ResourceManagers
2. **Security**: Enable Kerberos authentication and SSL encryption
3. **Resource Management**: Proper memory and CPU allocation
4. **Data Replication**: Increase replication factor to 3
5. **Monitoring**: Implement comprehensive logging and alerting
6. **Backup Strategy**: Regular snapshots and metadata backups

## Cleanup

To completely remove the setup:

```bash
# Stop and remove all containers
docker-compose down -v

# Remove Hue container
docker stop hue-service
docker rm hue-service

# Remove images (optional)
docker rmi apache/hadoop:3 gethue/hue:latest

# Clean up project directory
cd ..
rm -rf hadoop
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is provided as-is for educational and development purposes.
