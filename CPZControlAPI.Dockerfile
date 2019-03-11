FROM mcr.microsoft.com/azure-functions/node:2.0 AS buildNode
RUN apt-get update &&  \
    apt-get install -y git &&  \
    apt-get install -y python2.7 && \ 
    apt-get install -y build-essential && \
    apt-get install -y gcc
COPY /cpz-control-api /src/cpz-control-api
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-control-api
RUN npm install
ENV NODE_ENV=production
RUN npm run webpack
RUN npm uninstall -D
   
FROM mcr.microsoft.com/azure-functions/node:2.0 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=buildNode ["/src/cpz-control-api","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
  