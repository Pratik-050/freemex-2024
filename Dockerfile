FROM node:14-alpine AS build-env
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . ./

FROM gcr.io/distroless/nodejs:14
COPY --from=build-env /app /app
WORKDIR /app

CMD ["src/app.js"]
