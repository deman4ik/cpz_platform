FROM microsoft/dotnet:2.1-sdk AS buildNet
COPY /cpz-trader /src/cpz-trader
WORKDIR /src/cpz-trader
RUN dotnet restore
RUN dotnet build -c Release

FROM cpzdev.azurecr.io/cpzbuildfuncnode:latest AS buildNode
COPY /cpz-trader /src/cpz-trader
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-trader
RUN npm install
ENV NODE_ENV=production
RUN npm run webpack
RUN npm uninstall -D

FROM mcr.microsoft.com/azure-functions/node:2.0 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=buildNet ["/src/cpz-trader","/home/site/wwwroot"]
COPY --from=buildNode ["/src/cpz-trader","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot