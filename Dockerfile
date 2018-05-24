FROM node:carbon

WORKDIR /usr/src/app

COPY package.json ./

RUN npm i -g npm@latest

RUN npm install

COPY . .

CMD [ "npm", "start" ]
