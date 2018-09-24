FROM microsoft/azure-functions-node8:2.0
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
RUN apt-get update &&  \
    apt-get install -y git &&  \
    apt-get install -y python2.7 && \ 
    apt-get install -y build-essential && \
    apt-get install -y gcc
COPY . /home/site/wwwroot
WORKDIR /home/site/wwwroot
RUN npm install ccxt && \
    npm install --production && \
    npm cache clean --force
RUN apt-get remove -y git && \
    apt-get remove -y python2.7 && \
    apt-get remove -y build-essential && \
    apt-get remove -y gcc