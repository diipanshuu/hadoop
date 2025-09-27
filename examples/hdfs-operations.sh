#!/bin/bash

# HDFS Operations Example Script
# This script demonstrates common HDFS operations

set -e

NAMENODE_CONTAINER="hadoop-namenode"

echo "========================================="
echo "HDFS Operations Examples"
echo "========================================="

# Check if the NameNode container is running
if ! docker ps | grep -q $NAMENODE_CONTAINER; then
    echo "Error: NameNode container is not running. Please start the cluster first."
    exit 1
fi

echo "1. Checking HDFS status..."
docker exec $NAMENODE_CONTAINER hdfs dfsadmin -report

echo ""
echo "2. Creating directories in HDFS..."
docker exec $NAMENODE_CONTAINER hdfs dfs -mkdir -p /user/examples
docker exec $NAMENODE_CONTAINER hdfs dfs -mkdir -p /user/input
docker exec $NAMENODE_CONTAINER hdfs dfs -mkdir -p /user/output

echo ""
echo "3. Listing root directory..."
docker exec $NAMENODE_CONTAINER hdfs dfs -ls /

echo ""
echo "4. Creating a sample file..."
docker exec $NAMENODE_CONTAINER bash -c 'echo "Hello, Hadoop World!" > /tmp/sample.txt'
docker exec $NAMENODE_CONTAINER bash -c 'echo "This is a test file for HDFS operations." >> /tmp/sample.txt'
docker exec $NAMENODE_CONTAINER bash -c 'echo "Line 3: MapReduce is awesome!" >> /tmp/sample.txt'

echo ""
echo "5. Uploading file to HDFS..."
docker exec $NAMENODE_CONTAINER hdfs dfs -put /tmp/sample.txt /user/input/

echo ""
echo "6. Listing files in HDFS..."
docker exec $NAMENODE_CONTAINER hdfs dfs -ls /user/input/

echo ""
echo "7. Reading file from HDFS..."
docker exec $NAMENODE_CONTAINER hdfs dfs -cat /user/input/sample.txt

echo ""
echo "8. Getting file information..."
docker exec $NAMENODE_CONTAINER hdfs dfs -stat "File: %n, Size: %o bytes, Block Size: %r, Replication: %r" /user/input/sample.txt

echo ""
echo "9. Copying file within HDFS..."
docker exec $NAMENODE_CONTAINER hdfs dfs -cp /user/input/sample.txt /user/examples/sample_copy.txt

echo ""
echo "10. Downloading file from HDFS..."
docker exec $NAMENODE_CONTAINER hdfs dfs -get /user/examples/sample_copy.txt /tmp/downloaded_file.txt
docker exec $NAMENODE_CONTAINER cat /tmp/downloaded_file.txt

echo ""
echo "11. Checking disk usage..."
docker exec $NAMENODE_CONTAINER hdfs dfs -du -h /user/

echo ""
echo "12. Setting replication factor..."
docker exec $NAMENODE_CONTAINER hdfs dfs -setrep 2 /user/input/sample.txt

echo ""
echo "13. Creating a larger file for testing..."
docker exec $NAMENODE_CONTAINER bash -c 'for i in {1..1000}; do echo "Line $i: This is a larger test file for HDFS block demonstration." >> /tmp/large_file.txt; done'
docker exec $NAMENODE_CONTAINER hdfs dfs -put /tmp/large_file.txt /user/input/

echo ""
echo "14. Checking block information for large file..."
docker exec $NAMENODE_CONTAINER hdfs fsck /user/input/large_file.txt -files -blocks -locations

echo ""
echo "15. Displaying filesystem statistics..."
docker exec $NAMENODE_CONTAINER hdfs dfsadmin -report

echo ""
echo "========================================="
echo "HDFS Operations completed successfully!"
echo "========================================="
echo ""
echo "Additional useful commands:"
echo "- List all files recursively: docker exec $NAMENODE_CONTAINER hdfs dfs -ls -R /"
echo "- Check HDFS health: docker exec $NAMENODE_CONTAINER hdfs dfsadmin -report"
echo "- Safe mode operations: docker exec $NAMENODE_CONTAINER hdfs dfsadmin -safemode get"
echo "- Delete files: docker exec $NAMENODE_CONTAINER hdfs dfs -rm /path/to/file"
echo "- Delete directories: docker exec $NAMENODE_CONTAINER hdfs dfs -rm -r /path/to/directory"
echo ""