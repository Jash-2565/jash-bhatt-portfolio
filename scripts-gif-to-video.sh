#!/usr/bin/env bash
ROOT="${1:-public}"
vf="scale=trunc(iw/2)*2:trunc(ih/2)*2"
while IFS= read -r -d '' gif; do
  b="${gif%.gif}"
  [ -f "$b.mp4" ]  || ffmpeg -y -loglevel error -i "$gif" -an -movflags +faststart -pix_fmt yuv420p \
      -c:v libx264 -crf 24 -preset medium -vf "$vf" "$b.mp4" || echo "MP4 FAIL: $gif"
  [ -f "$b.webm" ] || ffmpeg -y -loglevel error -i "$gif" -an -c:v libvpx-vp9 -crf 34 -b:v 0 \
      -row-mt 1 -deadline good -cpu-used 5 -pix_fmt yuv420p -vf "$vf" "$b.webm" || echo "WEBM FAIL: $gif"
  [ -f "$b.poster.jpg" ] || ffmpeg -y -loglevel error -i "$gif" -frames:v 1 -vf "$vf" -q:v 3 "$b.poster.jpg" || echo "POSTER FAIL: $gif"
  echo "done: $(basename "$gif")"
done < <(find "$ROOT" -type f -iname '*.gif' -print0)
echo "ALL-CONVERSIONS-COMPLETE"
