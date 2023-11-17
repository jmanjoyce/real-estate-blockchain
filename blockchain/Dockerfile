# Use Node.js base image
FROM node:14-alpine

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code to the working directory
COPY . .

# Build TypeScript code to JavaScript
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Command to run the app (replace "dist/app.js" with your compiled entry file)
CMD ["node", "dist/app.js"]
