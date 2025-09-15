# Stage 1: Build the frontend
FROM node:18 AS build-frontend
WORKDIR /app
COPY package.json ./
# Using --legacy-peer-deps to avoid issues with dependency versions
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Setup the backend
FROM node:18 AS build-backend
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install
COPY backend/ .

# Stage 3: Final image
FROM node:18-alpine
WORKDIR /app
COPY --from=build-frontend /app/dist ./dist
COPY --from=build-backend /app/backend ./backend
WORKDIR /app/backend
EXPOSE 3001
CMD ["node", "index.js"]
