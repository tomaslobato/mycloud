FROM golang:1.23-alpine

RUN apk add --no-cache make

WORKDIR /app

COPY . .

RUN cd server && go mod download        

EXPOSE 5000

CMD ["make", "run"]
