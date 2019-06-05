FROM microsoft/dotnet:2.1-sdk AS buildNet
COPY /cpz-control-api /src/cpz-control-api
WORKDIR /src/cpz-control-api
RUN dotnet restore &&  \
    dotnet build -c Release

FROM cpzhost.azurecr.io/cpzbuildfuncnode:latest AS buildNode
COPY /cpz-control-api /src/cpz-control-api
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-control-api
RUN npm install
ENV NODE_ENV=production
RUN npm run webpack &&  \
    npm uninstall -D

FROM mcr.microsoft.com/azure-functions/node:2.0 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=buildNet ["/src/cpz-control-api","/home/site/wwwroot"]
COPY --from=buildNode ["/src/cpz-control-api","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
