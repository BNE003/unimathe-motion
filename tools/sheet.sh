#!/bin/zsh
# Kontaktbogen: tools/sheet.sh out.png img1.png img2.png ...
out=$1; shift
html=$(mktemp -t sheet).html
n=$#
{
  echo '<html><body style="margin:0;background:#222;display:flex;gap:8px">'
  for f in "$@"; do echo "<div style=\"color:#fff;font:14px monospace\"><img src=\"file://$f\" style=\"width:540px;display:block\">$(basename $f)</div>"; done
  echo '</body></html>'
} > $html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files --window-size=$((n*548)),985 --screenshot="$out" "file://$html" >/dev/null 2>&1
echo "$out"
