
# Use Node.js as the base image
FROM node:20-alpine

# Add build argument to bust cache
ARG BUILD_DATE
RUN echo "Build date: $BUILD_DATE"

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "run", "preview", "--", "--port", "3000"]
