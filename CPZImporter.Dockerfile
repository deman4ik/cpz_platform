FROM cpzhub.azurecr.io/cpzbuildnode:latest AS build
RUN mkdir /src/cpz-importer
RUN mkdor /src/cpz-shared
COPY /cpz-importer /src/cpz-importer
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-importer
RUN npm install
ENV NODE_ENV=production
RUN npm run webpack &&  \
    npm uninstall -D

FROM node:10 AS runtime
RUN mkdir /home/site/wwwroot
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=build ["/src/cpz-importer","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
EXPOSE 80
CMD [ "npm", "start" ]