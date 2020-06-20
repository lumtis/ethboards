FROM node:10

WORKDIR /app

# Install dependencies
COPY package.json ./
# (Need this line because of a bug)
RUN yarn global add node-gyp
RUN yarn

# Copy sources
ADD .env /app/.env
ADD public /app/public
ADD src /app/src

# Port and command
EXPOSE 3000
CMD [ "yarn", "start" ]
