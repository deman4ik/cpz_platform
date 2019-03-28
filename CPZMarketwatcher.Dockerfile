FROM cpzdev.azurecr.io/cpzbuildnode:latest AS build
COPY /cpz-marketwatcher /src/cpz-marketwatcher
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-marketwatcher
RUN npm install
ENV NODE_ENV=production
RUN npm run webpack &&  \
    npm uninstall -D

FROM node:10 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=build ["/src/cpz-marketwatcher","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
CMD [ "npm", "start" ]