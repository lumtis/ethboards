FROM ipfs/go-ipfs:latest

RUN mkdir /data/ipfs

# Configuration
RUN ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
RUN ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
RUN ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"

# Directories
RUN mkdir nujas
RUN mkdir weapons

# Adding nujas
ADD nujas/bearjak nujas/bearjak
ADD nujas/bulljak nujas/bulljak
ADD nujas/fireNuja nujas/fireNuja
ADD nujas/leafNuja nujas/leafNuja
ADD nujas/pinkNuja nujas/pinkNuja
ADD nujas/waterNuja nujas/waterNuja
ADD nujas/whiteNuja nujas/whiteNuja

RUN ipfs add -r nujas/bearjak
RUN ipfs add -r nujas/bulljak
RUN ipfs add -r nujas/fireNuja
RUN ipfs add -r nujas/leafNuja
RUN ipfs add -r nujas/pinkNuja
RUN ipfs add -r nujas/waterNuja
RUN ipfs add -r nujas/whiteNuja

# Adding weapons
ADD weapons/jetpack weapons/jetpack

RUN ipfs add -r weapons/jetpack
