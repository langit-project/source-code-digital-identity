#!/bin/sh

command="$1"

# Log bootstrap location
BOOTSTRAP_LOG_FILE=./rest-api/logs/bootstrap_logs.log

# Ensure the log directory exists
if [ ! -d ./rest-api/logs ]; then
    mkdir -p ./rest-api/logs
fi

# Set permissions for the log file
touch $BOOTSTRAP_LOG_FILE
chmod 644 $BOOTSTRAP_LOG_FILE

# Function to clean IPFS node-related files and directories
clean() {
    echo "Cleaning files..."

    for i in 1 2; do
        if [ -d ./rest-api/ipfs/volumes/data_node$i ]; then
            sudo rm -rf ./rest-api/ipfs/volumes/data_node$i
        fi

        if [ -d ./rest-api/ipfs/volumes/staging_node$i ]; then
            sudo rm -rf ./rest-api/ipfs/volumes/staging_node$i
        fi
    done

    if [ -f ./rest-api/ipfs/peer-id-bootstrap-node ]; then
        sudo rm ./rest-api/ipfs/peer-id-bootstrap-node
    fi

    if [ -f ./rest-api/ipfs/peer-id-ipfs-node ]; then
        sudo rm ./rest-api/ipfs/peer-id-ipfs-node
    fi

    if [ -f ./rest-api/ipfs/swarm.key ]; then
        sudo rm ./rest-api/ipfs/swarm.key
    fi
}

# Function to ensure the ./ipfs directory exists
ensureIpfsDirectory() {
    if [ ! -d ./rest-api/ipfs ]; then
        echo "Creating ./rest-api/ipfs directory..."
        mkdir -p ./rest-api/ipfs
    fi
}

# Function to generate a swarm key
swarmKey() {
    echo "Generating a swarm key..."
    ensureIpfsDirectory
    docker run --rm golang:1.9 sh -c 'go get github.com/Kubuxu/go-ipfs-swarm-key-gen/ipfs-swarm-key-gen && ipfs-swarm-key-gen' >./rest-api/ipfs/swarm.key
}

# Function to stop all containers
stopContainers() {
    echo "Stopping containers..."
    docker-compose --log-level ERROR down -v --remove-orphans
}

# Function to check and create network if it doesn't exist
createNetwork() {
    if ! docker network ls | grep -q "private-ipfs"; then
        echo "Creating private-ipfs network..."
        docker network create "private-ipfs"
    else
        echo "Network private-ipfs already exists."
    fi
}

# Function to start IPFS nodes
startNodes() {
    echo "Setting up IPFS nodes..."

    stopContainers

    clean

    echo "Setting up directories..."
    if [ ! -d ./rest-api/ipfs/volumes/node ]; then
        mkdir -p ./rest-api/ipfs/volumes/node
        mkdir -p ./rest-api/ipfs/peers
    fi

    docker network prune -f

    # Ensure network is created
    set +e
    createNetwork
    set -e

    # Generate swarm key
    swarmKey

    # init.sh executable
    chmod +x ./rest-api/ipfs/init.sh

    echo "Building and running docker for ipfs-node1"
    docker-compose --log-level ERROR up -d ipfs-node1

    # Number of seconds to wait
    echo "Waiting for ipfs-node to start up..."
    sleep 20

    # Verify if the container is running
    if ! docker ps -q -f name=ipfs-node1; then
        echo "Error: ipfs-node is not running."
        docker logs ipfs-node1 # Add logs for debugging
        exit 1
    fi

    echo "ipfs-node1 is running. Saving the peer id for ipfs-node1"
    # Use cat command from the host
    cat ./rest-api/ipfs/volumes/node/data1/config | grep "PeerID" >./rest-api/ipfs/peers/peer-id-node

    # addBootstrapNodes
    startCluster
}

startCluster() {
    echo "Starting IPFS Cluster1..."

    echo "Setting up directories..."
    if [ ! -d ./rest-api/ipfs/volumes/cluster ]; then
        mkdir -p ./rest-api/ipfs/volumes/cluster
    fi

    # Build and run the IPFS cluster node
    echo "Building and running docker for ipfs-cluster1"
    docker-compose --log-level ERROR up -d ipfs-cluster1

    # Number of seconds to wait
    echo "Waiting for ipfs-cluster to start up..."
    sleep 15

    # Verify if the container is running
    if ! docker ps -q -f name=ipfs-cluster1; then
        echo "Error: ipfs-cluster1 is not running."
        docker logs ipfs-cluster1 # Add logs for debugging
        exit 1
    fi

    echo "IPFS Cluster started."
}

startService() {
    echo "Starting Database services..."
    docker-compose --log-level ERROR up -d db

    echo "Preparing hardhat container..."
    docker-compose --log-level ERROR up -d hardhat
    echo "Deploying smart contract..."
    docker-compose exec hardhat yarn deploy-local --network localhost

    echo "Starting blockchain services..."
    docker-compose --log-level ERROR up -d blockchain-service

    echo "Starting AI services..."
    docker-compose --log-level ERROR up -d ai-service
}

# Display help usage
help() {
    echo "usage: run.sh [start|stop|test|test-cluster|rebuild|help]"
}

# Handle commands
case "${command}" in
"help")
    help
    ;;
"start")
    startNodes
    startService
    ;;
"stop")
    stopContainers
    ;;
*)
    echo "Command not found."
    help
    exit 127
    ;;
esac
