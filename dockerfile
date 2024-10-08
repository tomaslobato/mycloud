FROM golang:1.23-alpine

RUN apk add --no-cache make

WORKDIR /app

COPY go.mod go.sum ./
COPY package.json ./
RUN go mod download

COPY . .

EXPOSE 5000

CMD ["make", "run"]