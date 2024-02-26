FROM node:20.10.0

WORKDIR /server

COPY . .

RUN npm install 

EXPOSE 3000

CMD ["npm","start"]