# IPFS AND SMART CONTRACT API

## Description
This project is designed to store and fetch data from IPFS nodes running in Docker using Express.js and the Helia library. The project follows RESTful API best practices.

## Prerequisites
Before you begin, ensure you have met the following requirements:
- Metamask
- Docker
- Docker Compose
- Node.js
- Yarn

## Getting Started

### Installation
1. Clone the repository to your local machine:
    ```bash
    git clone https://github.com/yourusername/yourprojectname.git
    cd yourprojectname
    cd rest-api
    ```

2. Install the dependencies using Yarn:
    ```bash
    yarn install
    ```
3. Rename .env.example:
    ```bash
    mv .env.example .env
    ```

### Setup Secret cluster
1. run this comman line:
    ```bash
    openssl rand -hex 32
    ```
2. Copy the ouput and save to .env file


### Running IPFS Nodes
1. Build Docker containers:
    ```bash
    docker-compose build
    ```

2. Start the IPFS nodes:
    ```bash
    ./private-ipfs.sh start
    ```

3. Stop the IPFS nodes:
    ```bash
    ./private-ipfs.sh stop
    ```

### Verifying Docker Setup
1. Test if Docker and IPFS nodes are running correctly:
    ```bash
    ./private-ipfs.sh test
    ```

### Run Apps
- run comman line: 
    ```
    yarn run dev
    ```
- see on this: http://localhost:3000/api-docs/

## Project Structure (Update lagi)
- `ipfs`: Contains data and configurations to facilitate running Docker for IPFS
- `node_modules`: Project dependencies managed by Yarn
- `src`: Express.js project code
    - `application`: Core application logic
    - `controller`: Handles incoming requests and responses
    - `doc`: Documentation fo Open API
    - `middleware`: Middleware functions
    - `models`: Data models
    - `routes`: API routes
    - `services`: Business logic
    - `validations`: Request validation
- `test`: Unit testing for Express.js application

## Scripts
- `private-ipfs.sh`: Script to manage IPFS nodes

### Delete Docker Data
```bash
docker system prune -a
```
WARNING! This will remove:
  - all stopped containers
  - all networks not used by at least one container
  - all images without at least one container associated to them
  - all build cache

