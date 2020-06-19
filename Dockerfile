FROM node:10

WORKDIR /app

# Install dependencies
COPY package.json ./
# (Need this line because of a bug)
RUN yarn global add node-gyp
RUN yarn

# Copy sources
COPY public ./
COPY src ./

# Port and command
EXPOSE 3000
CMD [ "yarn", "start" ]