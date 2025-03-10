FROM node:20-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn

# Copy the rest of the application
COPY . .

# Expose port for development server
EXPOSE 5173

# Start the development server
CMD ["yarn", "dev", "--host", "0.0.0.0"]
