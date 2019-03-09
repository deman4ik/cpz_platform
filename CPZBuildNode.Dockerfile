FROM node:10 AS build
RUN apt-get update &&  \
    apt-get install -y git &&  \
    apt-get install -y python2.7 && \ 
    apt-get install -y build-essential && \
    apt-get install -y gcc
RUN npm install -g webpack@latest webpack-cli@latest babel-cli@latest babel-loader@latest babel-register@latest