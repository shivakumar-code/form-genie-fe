# Build frontend
FROM node:22.13.1 AS build-frontend
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install && npm run build

# Start server
CMD ["npm", "start"]
