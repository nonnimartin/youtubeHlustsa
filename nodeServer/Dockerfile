FROM ubuntu:14.04

MAINTAINER j martin <nonnimartin@gmail.com>

RUN apt-get -qq update

RUN apt-get install -y ntp wget zip unzip tar dos2unix nano

RUN apt-get -y install nodejs npm

RUN npm install

RUN mkdir /opt/youtubeNodeServer/

COPY * /opt/youtubeNodeServer/

RUN cd /opt/youtubeNodeServer/

WORKDIR /opt/youtubeNodeServer/

EXPOSE 3001

EXPOSE 3002

CMD ["node", "server.js"]

