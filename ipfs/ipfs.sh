# docker run -d --name ipfs_host -v ipfs_staging3:/export -v ipfs_data3:/data/ipfs -p 4001:4001 -p 127.0.0.1:8080:8080 -p 127.0.0.1:5001:5001 ipfs/go-ipfs:latest

docker run -d --name ipfs_host -p 4001:4001 -p 127.0.0.1:8080:8080 -p 127.0.0.1:5001:5001 ltacker/go-ipfs:latest


# Configs to allow access
# docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
# docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
# docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"
# docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://localhost:3000\"]"

# Directories
# docker exec ipfs_host mkdir nujas
docker exec ipfs_host mkdir weapons

# Adding nujas
# docker cp nujas/bearjak ipfs_host:/nujas/bearjak
# docker cp nujas/bulljak ipfs_host:/nujas/bulljak
# docker cp nujas/fireNuja ipfs_host:/nujas/fireNuja
# docker cp nujas/leafNuja ipfs_host:/nujas/leafNuja
# docker cp nujas/waterNuja ipfs_host:/nujas/waterNuja

# docker exec ipfs_host ipfs add -r nujas/bearjak
# docker exec ipfs_host ipfs add -r nujas/bulljak
# docker exec ipfs_host ipfs add -r nujas/fireNuja
# docker exec ipfs_host ipfs add -r nujas/leafNuja
# docker exec ipfs_host ipfs add -r nujas/waterNuja

# Adding weapons
# docker cp weapons/grenade ipfs_host:/weapons/grenade
# docker cp weapons/jetpack ipfs_host:/weapons/jetpack

docker cp weapons/hammer ipfs_host:/weapons/hammer
docker cp weapons/knife ipfs_host:/weapons/knife
docker cp weapons/pistol ipfs_host:/weapons/pistol
docker cp weapons/sniper ipfs_host:/weapons/sniper
docker cp weapons/sword ipfs_host:/weapons/sword
docker cp weapons/sword ipfs_host:/weapons/healthpack
docker cp weapons/sword ipfs_host:/weapons/missile
docker cp weapons/sword ipfs_host:/weapons/motorcycle

# docker exec ipfs_host ipfs add -r weapons/grenade
# docker exec ipfs_host ipfs add -r weapons/jetpack

docker exec ipfs_host ipfs add -r weapons/hammer
docker exec ipfs_host ipfs add -r weapons/knife
docker exec ipfs_host ipfs add -r weapons/pistol
docker exec ipfs_host ipfs add -r weapons/sniper
docker exec ipfs_host ipfs add -r weapons/sword
docker exec ipfs_host ipfs add -r weapons/healthpack
docker exec ipfs_host ipfs add -r weapons/missile
docker exec ipfs_host ipfs add -r weapons/motorcycle
