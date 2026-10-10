export function getMemberImageUrl(bioguideId, size = "225x275") {
  if (!bioguideId) return "/fallback-avatar.svg";
  return `https://unitedstates.github.io/images/congress/${size}/${bioguideId}.jpg`;
}
