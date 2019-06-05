FROM cpzhost.azurecr.io/cpzbuildnode:latest AS build
COPY /cpz-importer /src/cpz-importer
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-importer
RUN npm install
ENV NODE_ENV=production
RUN npm run webpack &&  \
    npm uninstall -D

FROM node:10 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=build ["/src/cpz-importer","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
CMD [ "npm", "start" ]