FROM ipfs/go-ipfs:latest

RUN ipfs init

# Directories
RUN mkdir nujas
RUN mkdir weapons

ADD nujas/bearjak nujas/bearjak
ADD nujas/bulljak nujas/bulljak
ADD nujas/fireNuja nujas/fireNuja
ADD nujas/leafNuja nujas/leafNuja
ADD nujas/pinkNuja nujas/pinkNuja
ADD nujas/waterNuja nujas/waterNuja
ADD nujas/whiteNuja nujas/whiteNuja

ADD weapons/grenade weapons/grenade
ADD weapons/hammer weapons/hammer
ADD weapons/jetpack weapons/jetpack
ADD weapons/knife weapons/knife
ADD weapons/pistol weapons/pistol
ADD weapons/sniper weapons/sniper
ADD weapons/sword weapons/sword
ADD weapons/healthpack weapons/healthpack
ADD weapons/missile weapons/missile
ADD weapons/motorcycle weapons/motorcycle

# Configuration
RUN ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
RUN ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
RUN ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"

RUN ipfs add -r nujas/bearjak
RUN ipfs add -r nujas/bulljak
RUN ipfs add -r nujas/fireNuja
RUN ipfs add -r nujas/leafNuja
RUN ipfs add -r nujas/pinkNuja
RUN ipfs add -r nujas/waterNuja
RUN ipfs add -r nujas/whiteNuja

RUN ipfs add -r weapons/grenade
RUN ipfs add -r weapons/hammer
RUN ipfs add -r weapons/jetpack
RUN ipfs add -r weapons/knife
RUN ipfs add -r weapons/pistol
RUN ipfs add -r weapons/jetpack
RUN ipfs add -r weapons/sniper
RUN ipfs add -r weapons/healthpack
RUN ipfs add -r weapons/motorcycle
RUN ipfs add -r weapons/missile
