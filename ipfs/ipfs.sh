
# Run ipfs
docker run -d --name ipfs_host -v ipfs_staging:/export -v ipfs_data:/data/ipfs -p 4001:4001 -p 127.0.0.1:8080:8080 -p 127.0.0.1:5001:5001 ipfs/go-ipfs:latest

# Configs to allow access
docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"

# Directories
docker exec ipfs_host mkdir nujas
docker exec ipfs_host mkdir weapons

# Adding nujas
docker cp nujas/bearjak ipfs_host:/nujas/bearjak
docker cp nujas/bulljak ipfs_host:/nujas/bulljak
docker cp nujas/fireNuja ipfs_host:/nujas/fireNuja
docker cp nujas/leafNuja ipfs_host:/nujas/leafNuja
docker cp nujas/pinkNuja ipfs_host:/nujas/pinkNuja
docker cp nujas/waterNuja ipfs_host:/nujas/waterNuja
docker cp nujas/whiteNuja ipfs_host:/nujas/whiteNuja

docker exec ipfs_host ipfs add -r nujas/bearjak
docker exec ipfs_host ipfs add -r nujas/bulljak
docker exec ipfs_host ipfs add -r nujas/fireNuja
docker exec ipfs_host ipfs add -r nujas/leafNuja
docker exec ipfs_host ipfs add -r nujas/pinkNuja
docker exec ipfs_host ipfs add -r nujas/waterNuja
docker exec ipfs_host ipfs add -r nujas/whiteNuja

# Adding weapons
docker cp weapons/jetpack ipfs_host:/weapons/jetpack

docker exec ipfs_host ipfs add -r weapons/jetpack
