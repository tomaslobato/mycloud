FROM golang:1.23-alpine

RUN apk add --no-cache make curl nodejs npm

RUN npm install -g pnpm

WORKDIR /app

RUN go install github.com/air-verse/air@latest

COPY go.mod go.sum ./
COPY package.json ./
RUN go mod download
RUN pnpm i

COPY . .

EXPOSE 5000

CMD ["make", "dev"]