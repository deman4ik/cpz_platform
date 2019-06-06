FROM cpzhub.azurecr.io/cpzbuildnode:latest AS build
RUN mkdir /src &&  \
    mkdir /src/cpz-importer &&  \
    mkdir /src/cpz-shared
COPY /cpz-importer /src/cpz-importer
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-importer
RUN npm install
ENV NODE_ENV=production
RUN npm run webpack &&  \
    npm uninstall -D

FROM node:10 AS runtime
RUN mkdir /app
ENV AzureWebJobsScriptRoot=/app
ENV NODE_ENV=production
COPY --from=build ["/src/cpz-importer","/app"]
WORKDIR /app
EXPOSE 80
CMD [ "npm", "start" ]