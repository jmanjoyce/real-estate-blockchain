# Use a lightweight Node.js image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Build your Vue application
RUN npm run build

# Expose the port your app runs on
EXPOSE 8080

# Define the command to run your app using serve (or your preferred server)
CMD ["npm", "run", "serve"]
