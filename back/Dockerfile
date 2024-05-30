FROM node:latest

WORKDIR .

COPY package*.json ./

RUN npm install -g npm@latest

RUN npm ci

COPY ./images/avatar.png ./users_images/

COPY ./ ./

EXPOSE 3001

ENTRYPOINT ["npm", "start"]
