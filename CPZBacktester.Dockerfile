FROM cpzdev.azurecr.io/cpzbuildnode:latest as build
COPY /cpz-adviser /src/cpz-adviser
COPY /cpz-trader /src/cpz-trader
COPY /cpz-backtester /src/cpz-backtester
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-backtester
RUN npm install tulind --build-from-source &&  \
    npm install 
ENV NODE_ENV=production
RUN npm run webpack &&  \
    npm uninstall -D

FROM node:10 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=build ["/src/cpz-backtester","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
CMD [ "npm", "start" ]
