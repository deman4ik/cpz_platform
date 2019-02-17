FROM node:10 AS build
RUN apt-get update &&  \
    apt-get install -y git &&  \
    apt-get install -y python2.7 && \ 
    apt-get install -y build-essential && \
    apt-get install -y gcc
COPY /cpz-importer /src/cpz-importer
COPY /cpz-shared /src/cpz-shared    
WORKDIR /src/cpz-importer
RUN npm install
ENV NODE_ENV=production
RUN npm run webpack
RUN npm uninstall 

FROM node:10 AS runtime
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV NODE_ENV=production
COPY --from=build ["/src/cpz-importer","/home/site/wwwroot"]
WORKDIR /home/site/wwwroot
CMD [ "npm", "start" ]