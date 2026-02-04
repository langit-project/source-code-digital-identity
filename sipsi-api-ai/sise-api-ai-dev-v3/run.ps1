param (
    [string]$command
)

# Log bootstrap location
$BOOTSTRAP_LOG_FILE = "./rest-api/logs/bootstrap_logs.log"

# Ensure the log directory exists
if (-not (Test-Path -Path "./rest-api/logs")) {
    New-Item -ItemType Directory -Force -Path "./rest-api/logs" | Out-Null
}

# Set permissions for the log file
if (-not (Test-Path -Path $BOOTSTRAP_LOG_FILE)) {
    New-Item -ItemType File -Force -Path $BOOTSTRAP_LOG_FILE | Out-Null
}
# Note: Setting file permissions is different in Windows, and usually not necessary for basic scripts

# Function to clean IPFS node-related files and directories
function Clean {
    Write-Host "Cleaning files..."

    foreach ($i in 1, 2) {
        $dataNodePath = "./rest-api/ipfs/volumes/data_node$i"
        $stagingNodePath = "./rest-api/ipfs/volumes/staging_node$i"

        if (Test-Path -Path $dataNodePath) {
            Remove-Item -Recurse -Force -Path $dataNodePath
        }

        if (Test-Path -Path $stagingNodePath) {
            Remove-Item -Recurse -Force -Path $stagingNodePath
        }
    }

    $filesToDelete = @(
        "./rest-api/ipfs/peer-id-bootstrap-node",
        "./rest-api/ipfs/peer-id-ipfs-node",
        "./rest-api/ipfs/swarm.key"
    )

    foreach ($file in $filesToDelete) {
        if (Test-Path -Path $file) {
            Remove-Item -Force -Path $file
        }
    }
}

# Function to ensure the ./ipfs directory exists
function EnsureIpfsDirectory {
    if (-not (Test-Path -Path "./rest-api/ipfs")) {
        Write-Host "Creating ./rest-api/ipfs directory..."
        New-Item -ItemType Directory -Force -Path "./rest-api/ipfs" | Out-Null
    }
}

# Function to generate a swarm key
function SwarmKey {
    Write-Host "Generating a swarm key..."
    EnsureIpfsDirectory
    docker run --rm golang:1.9 sh -c 'go get github.com/Kubuxu/go-ipfs-swarm-key-gen/ipfs-swarm-key-gen && ipfs-swarm-key-gen' > "./rest-api/ipfs/swarm.key"
}

# Function to stop all containers
function StopContainers {
    Write-Host "Stopping containers..."
    docker-compose --log-level ERROR down -v --remove-orphans
}

# Function to check and create network if it doesn't exist
function CreateNetwork {
    $networkExists = docker network ls | Select-String -Pattern "private-ipfs"
    if (-not $networkExists) {
        Write-Host "Creating private-ipfs network..."
        docker network create "private-ipfs"
    } else {
        Write-Host "Network private-ipfs already exists."
    }
}

# Function to start IPFS nodes
function StartNodes {
    Write-Host "Setting up IPFS nodes..."

    StopContainers
    Clean

    Write-Host "Setting up directories..."
    if (-not (Test-Path -Path "./rest-api/ipfs/volumes/node")) {
        New-Item -ItemType Directory -Force -Path "./rest-api/ipfs/volumes/node" | Out-Null
        New-Item -ItemType Directory -Force -Path "./rest-api/ipfs/peers" | Out-Null
    }

    docker network prune -f

    # Ensure network is created
    CreateNetwork

    # Generate swarm key
    SwarmKey

    # init.sh executable
    $initPath = "./rest-api/ipfs/init.sh"
    if (Test-Path -Path $initPath) {
        icacls $initPath /grant Everyone:F | Out-Null
    }

    Write-Host "Building and running docker for ipfs-node1"
    docker-compose --log-level ERROR up -d ipfs-node1

    # Number of seconds to wait
    Write-Host "Waiting for ipfs-node to start up..."
    Start-Sleep -Seconds 20

    # Verify if the container is running
    $ipfsNodeRunning = docker ps -q -f name=ipfs-node1
    if (-not $ipfsNodeRunning) {
        Write-Host "Error: ipfs-node is not running."
        docker logs ipfs-node1 # Add logs for debugging
        exit 1
    }

    Write-Host "ipfs-node1 is running. Saving the peer id for ipfs-node1"
    # Use cat command from the host
    Get-Content "./rest-api/ipfs/volumes/node/data1/config" | Select-String "PeerID" > "./rest-api/ipfs/peers/peer-id-node"

    # addBootstrapNodes
    StartCluster
}

function StartCluster {
    Write-Host "Starting IPFS Cluster1..."

    Write-Host "Setting up directories..."
    if (-not (Test-Path -Path "./rest-api/ipfs/volumes/cluster")) {
        New-Item -ItemType Directory -Force -Path "./rest-api/ipfs/volumes/cluster" | Out-Null
    }

    # Build and run the IPFS cluster node
    Write-Host "Building and running docker for ipfs-cluster1"
    docker-compose --log-level ERROR up -d ipfs-cluster1

    # Number of seconds to wait
    Write-Host "Waiting for ipfs-cluster to start up..."
    Start-Sleep -Seconds 15

    # Verify if the container is running
    $ipfsClusterRunning = docker ps -q -f name=ipfs-cluster1
    if (-not $ipfsClusterRunning) {
        Write-Host "Error: ipfs-cluster1 is not running."
        docker logs ipfs-cluster1 # Add logs for debugging
        exit 1
    }

    Write-Host "IPFS Cluster started."
}

function StartService {
    Write-Host "Starting Database services..."
    docker-compose --log-level ERROR up -d db

    Write-Host "Preparing hardhat container..."
    docker-compose --log-level ERROR up -d hardhat
    Write-Host "Deploying smart contract..."
    docker-compose exec hardhat yarn deploy-local --network localhost

    Write-Host "Starting blockchain services..."
    docker-compose --log-level ERROR up -d blockchain-service

    Write-Host "Starting AI services..."
    docker-compose --log-level ERROR up -d ai-service
}

# Display help usage
function Help {
    Write-Host "usage: run.ps1 [start|stop|test|test-cluster|rebuild|help]"
}

# Handle commands
switch ($command) {
    "help" { Help }
    "start" {
        StartNodes
        StartService
    }
    "stop" { StopContainers }
    default {
        Write-Host "Command not found."
        Help
        exit 127
    }
}
