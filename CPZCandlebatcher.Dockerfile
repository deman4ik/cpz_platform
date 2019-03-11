FROM microsoft/dotnet:2.1-sdk AS buildNet
COPY /cpz-candlebatcher /src/cpz-candlebatcher
WORKDIR /src/cpz-candlebatcher
RUN dotnet restore
RUN dotnet build -c Release

FROM mcr.microsoft.com/azure-functions/node:2.0 AS buildNode
RUN apt-get update &&  \
    apt-get install -y git &&  \
    apt-get install -y python2.7 && \ 
    apt-get install -y build-essential && \
    apt-get install -y gcc
COPY /cpz-candlebatcher /src/cpz-candlebatcher
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-candlebatcher
RUN npm install
ENV NODE_ENV=production
RUN npm run webpack
RUN npm uninstall -D 
   
FROM mcr.microsoft.com/azure-functions/node:2.0 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=buildNet ["/src/cpz-candlebatcher","/home/site/wwwroot"]
COPY --from=buildNode ["/src/cpz-candlebatcher","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
  