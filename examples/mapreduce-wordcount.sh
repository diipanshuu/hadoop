#!/bin/bash

# MapReduce WordCount Example
# This script runs the classic WordCount MapReduce job

set -e

RESOURCEMANAGER_CONTAINER="hadoop-resourcemanager"
NAMENODE_CONTAINER="hadoop-namenode"

echo "========================================="
echo "MapReduce WordCount Example"
echo "========================================="

# Check if containers are running
if ! docker ps | grep -q $RESOURCEMANAGER_CONTAINER; then
    echo "Error: ResourceManager container is not running. Please start the cluster first."
    exit 1
fi

if ! docker ps | grep -q $NAMENODE_CONTAINER; then
    echo "Error: NameNode container is not running. Please start the cluster first."
    exit 1
fi

echo "1. Preparing input data..."
docker exec $NAMENODE_CONTAINER hdfs dfs -mkdir -p /user/wordcount/input
docker exec $NAMENODE_CONTAINER hdfs dfs -mkdir -p /user/wordcount/output

# Create sample text files
docker exec $NAMENODE_CONTAINER bash -c 'cat > /tmp/file1.txt << EOF
Hello World Bye World
Hello Hadoop Goodbye Hadoop
EOF'

docker exec $NAMENODE_CONTAINER bash -c 'cat > /tmp/file2.txt << EOF
Hello MapReduce Goodbye MapReduce
MapReduce is powerful
Hadoop ecosystem is amazing
Big Data processing with Hadoop
EOF'

echo ""
echo "2. Uploading input files to HDFS..."
docker exec $NAMENODE_CONTAINER hdfs dfs -rm -f /user/wordcount/input/file1.txt /user/wordcount/input/file2.txt 2>/dev/null || true
docker exec $NAMENODE_CONTAINER hdfs dfs -put /tmp/file1.txt /user/wordcount/input/
docker exec $NAMENODE_CONTAINER hdfs dfs -put /tmp/file2.txt /user/wordcount/input/

echo ""
echo "3. Listing input files..."
docker exec $NAMENODE_CONTAINER hdfs dfs -ls /user/wordcount/input/

echo ""
echo "4. Running WordCount MapReduce job..."
docker exec $NAMENODE_CONTAINER hdfs dfs -rm -r /user/wordcount/output 2>/dev/null || true
docker exec $RESOURCEMANAGER_CONTAINER hadoop jar /opt/hadoop-3.2.1/share/hadoop/mapreduce/hadoop-mapreduce-examples-3.2.1.jar wordcount /user/wordcount/input /user/wordcount/output

echo ""
echo "5. Checking job completion and output..."
docker exec $NAMENODE_CONTAINER hdfs dfs -ls /user/wordcount/output/

echo ""
echo "6. Displaying WordCount results..."
docker exec $NAMENODE_CONTAINER hdfs dfs -cat /user/wordcount/output/part-r-00000

echo ""
echo "7. Getting output file to local filesystem..."
docker exec $NAMENODE_CONTAINER hdfs dfs -get /user/wordcount/output/part-r-00000 /tmp/wordcount_result.txt
echo "WordCount result saved to container at /tmp/wordcount_result.txt"

echo ""
echo "8. Cleanup (optional) - Removing output directory for next run..."
read -p "Do you want to clean up the output directory? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker exec $NAMENODE_CONTAINER hdfs dfs -rm -r /user/wordcount/output
    echo "Output directory cleaned up."
fi

echo ""
echo "========================================="
echo "MapReduce WordCount completed successfully!"
echo "========================================="
echo ""
echo "You can view the YARN application logs and status at:"
echo "- YARN ResourceManager UI: http://localhost:8088"
echo "- JobHistory Server: http://localhost:19888"
echo ""