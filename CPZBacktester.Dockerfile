FROM mcr.microsoft.com/azure-functions/node:2.0 AS build
RUN apt-get update &&  \
    apt-get install -y git &&  \
    apt-get install -y python2.7 && \ 
    apt-get install -y build-essential && \
    apt-get install -y gcc
COPY /cpz-adviser /src/cpz-adviser
COPY /cpz-trader /src/cpz-trader
COPY /cpz-backtester /src/cpz-backtester
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-backtester
RUN npm install tulind --build-from-source && \
    npm install && \
    npm run webpack && \
    npm uninstall -D && \
    npm cache clean --force
RUN apt-get remove -y git && \
    apt-get remove -y python2.7 && \
    apt-get remove -y build-essential && \
    apt-get remove -y gcc      

FROM mcr.microsoft.com/azure-functions/node:2.0 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
COPY --from=build ["/src/cpz-backtester","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
  