FROM node:latest

WORKDIR .

COPY package*.json ./

RUN npm install -g npm@latest

RUN npm ci

COPY ./ ./

EXPOSE 3000

ENTRYPOINT ["npm", "start"]
