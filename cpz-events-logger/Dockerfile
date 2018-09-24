FROM microsoft/azure-functions-node8:2.0 
ENV AzureWebJobsScriptRoot=/home/site/wwwroot
COPY . /home/site/wwwroot
WORKDIR /home/site/wwwroot
RUN npm install --production && \
    npm cache clean --force