FROM cpzdev.azurecr.io/cpzbuildfuncnode:latest AS build
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
