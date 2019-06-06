FROM cpzhub.azurecr.io/cpzbuildnode:latest AS build
RUN mkdir /src &&  \
    mkdir /src/cpz-marketwatcher &&  \
    mkdir /src/cpz-shared
COPY /cpz-marketwatcher /src/cpz-marketwatcher
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-marketwatcher
RUN npm install
ENV NODE_ENV=production
RUN npm run webpack &&  \
    npm uninstall -D

FROM node:10 AS runtime
RUN mkdir /app
ENV AzureWebJobsScriptRoot=/app
ENV NODE_ENV=production
COPY --from=build ["/src/cpz-marketwatcher","/app"]
WORKDIR /app
EXPOSE 80
CMD [ "npm", "start" ]