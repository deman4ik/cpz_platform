FROM node:12-alpine as build

RUN apk add --no-cache build-base git openssh-client

ARG GITHUB_SSH_KEY
RUN \
    mkdir ~/.ssh/ && \
    echo "$GITHUB_SSH_KEY" > ~/.ssh/id_rsa && \
    chmod 600 ~/.ssh/id_rsa && \
    eval $(ssh-agent) && \
    echo -e "StrictHostKeyChecking no" >> /etc/ssh/ssh_config && \
    ssh-add ~/.ssh/id_rsa && \
    touch ~/.ssh/known_hosts && \
    ssh-keyscan github.com >> ~/.ssh/known_hosts

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN npm install && npm run build && npm prune --production

FROM node:12-alpine as runtime
RUN npm install pm2 -g
RUN mkdir -p /usr/src/app
COPY --from=build ["/usr/src/app","/usr/src/app"]
WORKDIR /usr/src/app
EXPOSE 3000
CMD ["pm2-runtime", "pm.docker.config.js"]