#!/bin/bash

# Hadoop Docker Compose Startup Script
# This script starts the complete Hadoop cluster with HDFS, YARN, and Hue

set -e

echo "========================================="
echo "Starting Hadoop Cluster with Docker Compose"
echo "========================================="

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed or not in PATH"
    exit 1
fi

# Check if docker-compose.yaml exists
if [ ! -f "docker-compose.yaml" ]; then
    echo "Error: docker-compose.yaml not found in current directory"
    exit 1
fi

# Pull the latest images
echo "Pulling latest Docker images..."
docker-compose pull

# Start the services
echo "Starting Hadoop services..."
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 30

# Check service status
echo "========================================="
echo "Service Status:"
echo "========================================="
docker-compose ps

echo ""
echo "========================================="
echo "Hadoop Cluster URLs:"
echo "========================================="
echo "NameNode Web UI:      http://localhost:9870"
echo "DataNode Web UI:      http://localhost:9864"
echo "ResourceManager UI:   http://localhost:8088"
echo "NodeManager Web UI:   http://localhost:8042"
echo "History Server UI:    http://localhost:19888"
echo "Hue Web Interface:    http://localhost:8888"
echo "========================================="

echo ""
echo "Cluster is starting up. Please wait a few minutes for all services to be fully operational."
echo "You can monitor the logs with: docker-compose logs -f"
echo ""
echo "To stop the cluster: docker-compose down"
echo "To stop and remove volumes: docker-compose down -v"