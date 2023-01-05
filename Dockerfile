FROM node:16

ENV TZ=Asia/Tokyo
ENV LANG=ja_JP.UTF-8
ENV APPHOME=/root/vast_player_js
WORKDIR $APPHOME

RUN apt-get update
RUN apt-get install -y xvfb libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgtk-3-0 libgbm-dev libasound2
