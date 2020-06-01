#! /bin/sh
mkdir -p .ganache
ganache-cli \
  --db .ganache \
  -l 8000038 \
  -i 1234 \
  -e 100000 \
  -a 10 \
  -u 0 \
  -g 1000000000 \
  -m "wait nephew visual song prevent ribbon much stick hour token account food"