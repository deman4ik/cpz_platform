FROM cpzhub.azurecr.io/cpzbuildfuncnode:latest AS build
COPY /cpz-platform-api /src/cpz-platform-api
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-platform-api
RUN npm install
ENV NODE_ENV=production
RUN npm run webpack &&  \
    npm uninstall -D

FROM mcr.microsoft.com/azure-functions/node:2.0 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=build ["/src/cpz-platform-api","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
