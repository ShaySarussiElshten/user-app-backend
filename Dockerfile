# Use the official Node.js 14 image from DockerHub
FROM node:16

# Create a directory where our app will be placed
WORKDIR /usr/src/app

# Copying all files from your file system to container file system.
COPY . .

# Install dependencies using npm
RUN npm install

# Expose the port the app runs on
EXPOSE 3000

# Serve the app
CMD ["npm", "run", "start:dev"]


