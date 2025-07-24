# Step 1: Build the React app
FROM node:22.17.1-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Serve the static files with "serve"
FROM node:22.17.1-alpine

WORKDIR /app

RUN npm install -g serve

# Copy the built React app from the previous stage
COPY --from=build /app/build ./dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
