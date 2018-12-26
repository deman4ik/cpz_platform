FROM mcr.microsoft.com/azure-functions/node:2.0 AS buildNode
RUN apt-get update &&  \
    apt-get install -y git &&  \
    apt-get install -y python2.7 && \ 
    apt-get install -y build-essential && \
    apt-get install -y gcc
COPY /cpz-connector /src/cpz-connector
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-connector
RUN npm install && \
    npm run webpack && \
    npm uninstall -D && \
    npm cache clean --force
   
FROM mcr.microsoft.com/azure-functions/node:2.0 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
COPY --from=buildNode ["/src/cpz-connector","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
  