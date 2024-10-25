FROM alpine:latest

WORKDIR /app

RUN apk add --no-cache ca-certificates libc6-compat

COPY ./client/dist /app/client/dist
COPY ./bin/mycloud /app/bin/mycloud
COPY ./bin/.env /app/bin/.env
COPY ./bin/start.sh /app/bin/start.sh 

RUN chmod +x /app/bin/start.sh  

EXPOSE 5555

CMD ["/app/bin/start.sh"]
