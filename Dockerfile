FROM node:18

WORKDIR /user/src/app

COPY . .

RUN npm ci --omit-dev

RUN npx tsc

ENV PROD=1
CMD ["node", "build/index.js"]
