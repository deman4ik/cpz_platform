FROM cpzhub.azurecr.io/cpzbuildnode:latest as build
RUN mkdir /src &&  \
    mkdir /src/cpz-adviser &&  \
    mkdir /src/cpz-trader &&  \
    mkdir /src/cpz-backtester &&  \
    mkdir /src/cpz-shared
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
RUN mkdir /app
ENV AzureWebJobsScriptRoot=/app
ENV NODE_ENV=production
COPY --from=build ["/src/cpz-backtester","/app"]
WORKDIR /app
EXPOSE 80
CMD [ "npm", "start" ]
