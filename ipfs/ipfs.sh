# Configs to allow access
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"

#Add filesls

sleep 5
ipfs add -r chess/blackBishop
sleep 5
ipfs add -r chess/whiteBishop
sleep 5
ipfs add -r chess/blackKing
sleep 5
ipfs add -r chess/whiteKing
sleep 5
ipfs add -r chess/blackKnight
sleep 5
ipfs add -r chess/whiteKnight
sleep 5
ipfs add -r chess/blackQueen
sleep 5
ipfs add -r chess/whiteQueen
sleep 5
ipfs add -r chess/blackPawn
sleep 5
ipfs add -r chess/whitePawn
sleep 5
ipfs add -r chess/blackRook
sleep 5
ipfs add -r chess/whiteRook
