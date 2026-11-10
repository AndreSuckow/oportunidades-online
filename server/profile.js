// Only Google-hosted profile images from the verified identity are accepted.
export function googlePicture(value) {
  try {
    const url=new URL(value);
    if(url.protocol!=='https:' || url.username || url.password || url.port) return '';
    if(url.hostname!=='googleusercontent.com' && !url.hostname.endsWith('.googleusercontent.com')) return '';
    return url.href;
  } catch { return ''; }
}
