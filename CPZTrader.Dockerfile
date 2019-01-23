FROM microsoft/dotnet:2.1-sdk AS buildNet
COPY /cpz-trader /src/cpz-trader
WORKDIR /src/cpz-trader
RUN dotnet restore
RUN dotnet build -c Release

FROM mcr.microsoft.com/azure-functions/node:2.0 AS buildNode
RUN apt-get update &&  \
    apt-get install -y git &&  \
    apt-get install -y python2.7 && \ 
    apt-get install -y build-essential && \
    apt-get install -y gcc
COPY /cpz-trader /src/cpz-trader
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-trader
ENV NODE_ENV=production
RUN npm install && \
    npm run webpack && \
    npm uninstall -D && \
    npm cache clean --force     

FROM mcr.microsoft.com/azure-functions/node:2.0 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=buildNet ["/src/cpz-trader","/home/site/wwwroot"]
COPY --from=buildNode ["/src/cpz-trader","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot