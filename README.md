# Hadoop Docker Compose Cluster

A complete Apache Hadoop cluster setup using Docker Compose for development and learning purposes. This setup includes HDFS (NameNode + DataNodes), YARN (ResourceManager + NodeManager), MapReduce History Server, and Hue web interface.

## 🚀 Quick Start

### Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 8GB RAM available for Docker
- Ports 8020, 8042, 8088, 8888, 9864, 9870, 19888 available on your host

### One-Command Startup

```bash
git clone https://github.com/diipanshuu/hadoop.git
cd hadoop
./start-hadoop.sh
```

Alternatively, start manually:

```bash
docker compose up -d
```

## 🌐 Web Interfaces

Once the cluster is running, access these web interfaces:

| Service | URL | Description |
|---------|-----|-------------|
| **NameNode Web UI** | http://localhost:9870 | HDFS overview, browse filesystem |
| **DataNode Web UI** | http://localhost:9864 | DataNode status and logs |
| **ResourceManager UI** | http://localhost:8088 | YARN applications and cluster resources |
| **NodeManager Web UI** | http://localhost:8042 | NodeManager status and container logs |
| **History Server UI** | http://localhost:19888 | Completed MapReduce job history |
| **Hue Web Interface** | http://localhost:8888 | File browser, job submission, query editor |

## 📁 Architecture

The cluster consists of the following services:

- **NameNode**: HDFS metadata management
- **DataNode1 & DataNode2**: HDFS data storage (replication factor: 2)
- **ResourceManager**: YARN resource management
- **NodeManager**: YARN node resource management
- **History Server**: MapReduce job history
- **Hue**: Web-based user interface for Hadoop ecosystem

## 🔧 Configuration

### Hadoop Configuration Files

All Hadoop configuration files are located in the `hadoop-config/` directory:

- `core-site.xml`: Core Hadoop configuration
- `hdfs-site.xml`: HDFS configuration
- `yarn-site.xml`: YARN configuration  
- `mapred-site.xml`: MapReduce configuration

### Hue Configuration

Hue configuration is in `hue-config/hue.ini`. The default setup includes:

- HDFS integration via WebHDFS
- YARN integration for job monitoring
- File browser for HDFS operations

## 📝 HDFS Operations Examples

### Basic HDFS Commands

Run the comprehensive HDFS operations example:

```bash
./examples/hdfs-operations.sh
```

### Manual HDFS Operations

```bash
# List HDFS root directory
docker exec hadoop-namenode hdfs dfs -ls /

# Create directory
docker exec hadoop-namenode hdfs dfs -mkdir /user/example

# Upload file to HDFS
echo "Hello Hadoop" > sample.txt
docker cp sample.txt hadoop-namenode:/tmp/
docker exec hadoop-namenode hdfs dfs -put /tmp/sample.txt /user/example/

# List files
docker exec hadoop-namenode hdfs dfs -ls /user/example/

# Read file
docker exec hadoop-namenode hdfs dfs -cat /user/example/sample.txt

# Download file
docker exec hadoop-namenode hdfs dfs -get /user/example/sample.txt /tmp/downloaded.txt

# Check HDFS status
docker exec hadoop-namenode hdfs dfsadmin -report
```

## 🔍 MapReduce Examples

### WordCount Example

Run the classic WordCount MapReduce job:

```bash
./examples/mapreduce-wordcount.sh
```

### Submit Custom MapReduce Jobs

```bash
# Run any example from Hadoop examples JAR
docker exec hadoop-resourcemanager hadoop jar \
  /opt/hadoop/share/hadoop/mapreduce/hadoop-mapreduce-examples-*.jar \
  <example-name> <input-path> <output-path>

# Available examples: wordcount, pi, terasort, teragen, etc.
```

## 🐳 Container Management

### Start the Cluster

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Check service status
docker compose ps
```

### Stop the Cluster

```bash
# Stop all services (keeps data)
docker compose down

# Stop and remove all data
docker compose down -v
```

### Scale DataNodes

```bash
# Scale to 3 DataNodes
docker compose up -d --scale datanode1=3
```

## 🗂️ Data Persistence

- **NameNode data**: Stored in Docker volume `hadoop-namenode-data`
- **DataNode data**: Stored in Docker volumes `hadoop-datanode1-data`, `hadoop-datanode2-data`
- **Hue data**: Stored in Docker volume `hadoop-hue-data`

### Backup Data

```bash
# Backup all volumes
docker run --rm -v hadoop-namenode-data:/data -v $(pwd):/backup busybox tar czf /backup/namenode-backup.tar.gz -C /data .
docker run --rm -v hadoop-datanode1-data:/data -v $(pwd):/backup busybox tar czf /backup/datanode1-backup.tar.gz -C /data .
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Services Not Starting

**Problem**: Containers exit immediately or fail to start.

**Solutions**:
```bash
# Check logs for specific service
docker compose logs namenode

# Ensure sufficient memory (8GB+ recommended)
docker system df
docker system prune

# Reset volumes if corrupted
docker compose down -v
docker compose up -d
```

#### 2. NameNode Safe Mode

**Problem**: HDFS operations fail with "NameNode is in safe mode".

**Solutions**:
```bash
# Check safe mode status
docker exec hadoop-namenode hdfs dfsadmin -safemode get

# Force leave safe mode (development only)
docker exec hadoop-namenode hdfs dfsadmin -safemode leave

# Wait for automatic exit (recommended)
docker exec hadoop-namenode hdfs dfsadmin -safemode wait
```

#### 3. Port Conflicts

**Problem**: Ports already in use.

**Solutions**:
```bash
# Check port usage
netstat -tulpn | grep :9870

# Modify ports in docker-compose.yaml
# Change "9870:9870" to "9871:9870" for different host port
```

#### 4. Low Disk Space

**Problem**: DataNodes report low disk space.

**Solutions**:
```bash
# Check disk usage
docker exec hadoop-namenode hdfs dfs -df -h

# Check Docker disk usage
docker system df

# Clean up unused Docker resources
docker system prune -a --volumes
```

#### 5. Memory Issues

**Problem**: Containers killed due to OOM (Out of Memory).

**Solutions**:
```bash
# Check container memory usage
docker stats

# Reduce memory allocation in configuration files
# Edit hadoop-config/yarn-site.xml and mapred-site.xml
# Reduce yarn.nodemanager.resource.memory-mb
# Reduce mapreduce.map.memory.mb and mapreduce.reduce.memory.mb
```

#### 6. Network Connectivity Issues

**Problem**: Services cannot communicate with each other.

**Solutions**:
```bash
# Check network
docker network ls
docker network inspect hadoop-network

# Restart with fresh network
docker compose down
docker network prune
docker compose up -d
```

#### 7. Hue Login Issues

**Problem**: Cannot access Hue or login fails.

**Solutions**:
- Default Hue login: Create an account on first access
- Reset Hue database:
```bash
docker compose exec hue /usr/share/hue/build/env/bin/hue migrate
docker compose exec hue /usr/share/hue/build/env/bin/hue createsuperuser
```

### Health Checks

```bash
# Check all service health
docker compose ps

# Test HDFS connectivity
docker exec hadoop-namenode hdfs dfs -ls /

# Test YARN connectivity
docker exec hadoop-resourcemanager yarn node -list

# Test MapReduce
docker exec hadoop-resourcemanager yarn jar /opt/hadoop/share/hadoop/mapreduce/hadoop-mapreduce-examples-*.jar pi 2 4
```

### Log Locations

```bash
# View logs for specific services
docker compose logs namenode
docker compose logs resourcemanager
docker compose logs hue

# Follow logs in real-time
docker compose logs -f --tail=100 namenode
```

## 🔐 Security Considerations

**⚠️ Important**: This setup is designed for development and learning purposes only. It includes several security configurations that are NOT suitable for production:

- HDFS permissions are disabled
- No authentication or authorization
- Services run as root user
- No encryption in transit or at rest
- Default passwords and keys

For production use, implement proper security measures including Kerberos authentication, SSL/TLS encryption, and proper user management.

## 📚 Additional Resources

- [Apache Hadoop Documentation](https://hadoop.apache.org/docs/)
- [HDFS Commands Guide](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HDFSCommands.html)
- [YARN Commands Guide](https://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/YarnCommands.html)
- [Hue Documentation](https://docs.gethue.com/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the setup thoroughly
5. Submit a pull request

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs`
3. Open an issue with detailed error information
4. Include your Docker and Docker Compose versions
