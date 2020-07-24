FROM ipfs/go-ipfs:latest

WORKDIR /app

# Add files
ADD chess /app/chess
ADD warfield /app/warfield

# Add script
ADD ipfs.sh /app/ipfs.sh

# New startup script
ADD container_daemon /usr/local/bin/start_ipfs
RUN chmod 0755 /usr/local/bin/start_ipfs