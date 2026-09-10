#!/bin/bash
# EME cinematic video grade v2 — the ffmpeg twin of scripts/grade-photos.py.
# Usage: scripts/grade-video.sh <in> <out.mp4> [ss] [t]
# Output: 1280x720 H.264, no audio, faststart (the site's preview convention).
GRADE="curves=all='0/0.045 0.25/0.244 0.5/0.5175 0.75/0.791 1/0.99',colorbalance=rh=0.03:gh=-0.01:bh=-0.065:rs=-0.045:gs=-0.015:bs=0.055,eq=saturation=1.02,vignette=angle=PI/4.5,noise=alls=6:allf=t"
SS=${3:+-ss $3}; T=${4:+-t $4}
ffmpeg -y $SS $T -i "$1" -vf "scale=1280:720:flags=lanczos,$GRADE" -an -c:v libx264 -preset slow -crf 23 -maxrate 4.5M -bufsize 9M -pix_fmt yuv420p -movflags +faststart "$2"
