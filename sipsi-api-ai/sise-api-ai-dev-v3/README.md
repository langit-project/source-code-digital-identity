# IPFS AND SMART CONTRACT API


## 
Pastikan folder: pretrainedModel, NER-INDO, dan SavedWeight ada di folder AI.

cd contract

yarn install

docker compose down --volumes --remove-orphans

docker network prune -f

di contract
# CMD ["yarn", "local-node"]
CMD ["npx", "hardhat", "node"]

## Description
This project is designed to store and fetch data from IPFS nodes running in Docker using Express.js and the Helia library. The project follows RESTful API best practices.

## Prerequisites
Before you begin, ensure you have met the following requirements:
- Metamask
- Docker            `v4.32.0`
- Docker Compose    `v2.28.1-desktop.1`
- Node.js           `v20.10.0`
- Yarn              `v1.22.22`

## Getting Started
### Rename .env.example:
1. On root project
    ```bash
    mv .env.example .env
    ```
2. On `/rest-api` directory
    ```bash
    cd rest-api
    mv .env.example .env
    ```
2. On `/contract` directory
    ```bash
    cd contract
    mv .env.example .env
    ```

### Setup Secret cluster
1. run this comman line:
    ```bash
    openssl rand -hex 32
    ```
2. Copy the ouput and save to `.env` in `/root` project

### Setup Private key
1. add private key from metamask for wallet admin, panitera and majelis to `.env.` file on `/rest-api` and `/contract` dir
2. Copy public key key to `/contract/config/CollectionConfig.ts` for admin, pantera, and majelis

### Change permission for executable file
1. Back to root project and run this comman line:
    ```bash
    chmod +x run.sh
    ```

### Install all the package
1. On `/contract` dir
    ```bash
    cd contract
    yarn
    ```
2. On `/rest-api` dir
    ```bash
    cd rest-api
    yarn
    ```

### Build docker system
1. Start docker engine
2. Build Docker containers:
    ```bash
    docker-compose build
    ```

### Operate the apps
1. Start the IPFS nodes:
    ```bash
    ./run.sh start
    ```
    see on this: http://localhost:3000/api-docs

3. Stop the IPFS nodes:
    ```bash
    ./run.sh stop
    ```

### Verifying Docker Setup
1. Test if Docker and IPFS nodes are running correctly:
    ```bash
    ./private-ipfs.sh test
    ```

## Scripts
- `run.sh`: Script to manage the system

### Delete Docker Data
```bash
docker system prune -a
```
WARNING! This will remove:
  - all stopped containers
  - all networks not used by at least one container
  - all images without at least one container associated to them
  - all build cache
