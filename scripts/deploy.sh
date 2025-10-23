#!/bin/bash

echo "Removing all existing Docker containers..."
docker rm -f $(docker ps -aq) || true # `|| true` to prevent script from exiting if no containers are found

echo "Removing postgres_data volume..."
docker volume rm dustintime-mvp_postgres_data || true

echo "Stopping and removing existing containers defined in docker-compose.yml..."
docker-compose down --remove-orphans

echo "Building all microservice images with no cache..."
docker-compose build

echo "Starting new containers..."
docker-compose up -d

echo "
Applications should now be running. Access them at:
API Gateway: http://localhost:3000
"
