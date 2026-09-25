set -e
FF=${FFMPEG:-ffmpeg}
theme=$1; out=../../public/work/effort-keeper
mkdir -p $out
$FF -y -loglevel error -i master-$theme.mp4 -i sfx.wav -map 0:v -map 1:a \
  -vf "scale=1080:1080:flags=lanczos,format=yuv420p" -c:v libx264 -preset veryslow -crf 22 -tune animation \
  -c:a aac -b:a 128k -shortest -movflags +faststart $out/reel-$theme.mp4
$FF -y -loglevel error -i master-$theme.mp4 -vf "select=eq(n\,0),scale=1080:1080:flags=lanczos" -frames:v 1 -q:v 3 $out/poster-$theme.jpg
ls -la $out
