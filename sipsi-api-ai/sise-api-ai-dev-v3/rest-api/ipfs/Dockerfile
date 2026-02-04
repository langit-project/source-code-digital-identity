# Stage 1: Build gosu in a Debian environment
FROM ubuntu:22.04 as gosu-build

RUN apt-get update && apt-get install -y apt-utils gosu

# Stage 2: Final image for IPFS nodes using ipfs/kubo
FROM ipfs/kubo:latest

COPY --from=gosu-build /usr/sbin/gosu /usr/local/bin/gosu
COPY init.sh /usr/local/bin/start_ipfs
COPY swarm.key /data/ipfs/swarm.key

RUN chown ipfs:users /usr/local/bin/start_ipfs && chmod +x /usr/local/bin/start_ipfs

ENTRYPOINT ["/usr/local/bin/start_ipfs"]
