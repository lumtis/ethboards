FROM node:10

WORKDIR /app

# Install dependencies
COPY package.json ./
# (Need this line because of a bug)
RUN yarn global add node-gyp
RUN yarn

# Copy sources
ADD public /app/public
ADD src /app/src

# Configuration
ADD .env.production /app/.env.production

# Build sources
RUN yarn build

ENV PORT 5000

# Port and command
EXPOSE 5000
CMD [ "yarn", "serve" ]
