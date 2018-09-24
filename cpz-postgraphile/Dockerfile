FROM keymetrics/pm2:latest-alpine
WORKDIR /home/site/wwwroot
COPY server.js /home/site/wwwroot
COPY package.json /home/site/wwwroot
COPY package-lock.json /home/site/wwwroot
COPY ecosystem.config.js /home/site/wwwroot
ENV NODE_ENV=production
ENV NODE_PORT=80
RUN npm install --production && \
    npm cache clean --force

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]