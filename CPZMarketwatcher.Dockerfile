FROM mcr.microsoft.com/azure-functions/node:2.0 AS build
RUN apt-get update &&  \
    apt-get install -y git &&  \
    apt-get install -y python2.7 && \ 
    apt-get install -y build-essential && \
    apt-get install -y gcc
COPY /cpz-marketwatcher /src/cpz-marketwatcher
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-marketwatcher
ENV NODE_ENV=production
RUN npm install && \
    npm run webpack && \
    npm uninstall -D && \
    npm cache clean --force     

FROM mcr.microsoft.com/azure-functions/node:2.0 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=build ["/src/cpz-marketwatcher","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
  