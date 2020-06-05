export ipfs_staging=ipfs_staging
export ipfs_data=ipfs_data
docker run -d --name allin_ipfs -v $ipfs_staging:/export -v $ipfs_data:/data/ipfs -p 4001:4001 -p 127.0.0.1:8080:8080 -p 127.0.0.1:5001:5001 ipfs/go-ipfs:latest

# Configs to allow access
# docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
# docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
# docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"
# docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://localhost:3000\"]"

docker cp chess allin_ipfs:/fileToAdd
sleep 5
docker exec allin_ipfs ipfs add -r fileToAdd/blackBishop
sleep 5
docker exec allin_ipfs ipfs add -r fileToAdd/whiteBishop
sleep 5
docker exec allin_ipfs ipfs add -r fileToAdd/blackKing
sleep 5
docker exec allin_ipfs ipfs add -r fileToAdd/whiteKing
sleep 5
docker exec allin_ipfs ipfs add -r fileToAdd/blackKnight
sleep 5
docker exec allin_ipfs ipfs add -r fileToAdd/whiteKnight
sleep 5
docker exec allin_ipfs ipfs add -r fileToAdd/blackQueen
sleep 5
docker exec allin_ipfs ipfs add -r fileToAdd/whiteQueen
sleep 5
docker exec allin_ipfs ipfs add -r fileToAdd/blackPawn
sleep 5
docker exec allin_ipfs ipfs add -r fileToAdd/whitePawn
sleep 5
docker exec allin_ipfs ipfs add -r fileToAdd/blackRook
sleep 5
docker exec allin_ipfs ipfs add -r fileToAdd/whiteRook

