# Use the official Node.js image as the base image
FROM node:20

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Pre-download the Solidity compiler
RUN npx hardhat compile

# Expose the port that Hardhat node will use
EXPOSE 8545

# Command to run Hardhat node
# CMD ["yarn", "local-node"]
CMD ["npx", "hardhat", "node"]
