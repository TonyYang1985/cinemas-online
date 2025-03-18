FROM node:14-alpine as installer

RUN apk add --no-cache alpine-sdk python3

WORKDIR /fot.sg/build
ENV YARN_CACHE_FOLDER=/.yarn/cache
COPY package.json .
COPY . .
RUN yarn install --ignore-scripts
RUN yarn buildNum && yarn ncc:build
RUN rm -rfv ./cfg/*.development.yaml

FROM node:14-alpine

WORKDIR /fot.sg/build
RUN apk add --no-cache curl
ENV YARN_CACHE_FOLDER=/.yarn/cache
COPY cfg cfg
COPY keys keys
COPY --from=installer /.yarn/cache /.yarn/cache
COPY --from=installer /fot.sg/build/node_modules /fot.sg/build/node_modules
COPY --from=installer /fot.sg/build/dist/single/*.js ./dist/single/
COPY package.json ./

ENV NODE_ENV production
EXPOSE 3000
CMD [ "node", "./dist/single/index.js" ]
