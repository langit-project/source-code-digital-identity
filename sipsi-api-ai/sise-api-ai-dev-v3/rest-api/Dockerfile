# Use the official Node.js 20 image.
FROM node:20

# Set the working directory in the container to /usr/src/app.
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to the working directory.
COPY package*.json yarn.lock ./

# Install dependencies.
RUN yarn install

# Copy the rest of the application code to the working directory.
COPY . .

# Expose the port the app runs on.
EXPOSE 3000

# Default command to keep the container running
CMD ["yarn", "run", "dev"]
