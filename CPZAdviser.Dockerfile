FROM cpzdev.azurecr.io/cpzbuildfuncnode:latest AS build
RUN apt-get update &&  \
    apt-get install -y git &&  \
    apt-get install -y python2.7 && \ 
    apt-get install -y build-essential && \
    apt-get install -y gcc
COPY /cpz-adviser /src/cpz-adviser
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-adviser
RUN npm install tulind --build-from-source
RUN npm install
ENV NODE_ENV=production
RUN npm run webpack
RUN npm uninstall -D

FROM mcr.microsoft.com/azure-functions/node:2.0 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=build ["/src/cpz-adviser","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
