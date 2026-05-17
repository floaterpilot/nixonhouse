export function decodeEntities(value = '') {
  return String(value)
    .replaceAll('<![CDATA[', '')
    .replaceAll(']]>', '')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .trim();
}

export function stripHtml(value = '') {
  return decodeEntities(String(value).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function firstMatch(block, pattern) {
  return decodeEntities(block.match(pattern)?.[1] || '');
}

function firstAttribute(block, pattern) {
  return decodeEntities(block.match(pattern)?.[1] || '');
}

export function parseAtomEntries(xml) {
  return [...String(xml).matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map(([block]) => {
    const categories = [...block.matchAll(/<category\b[^>]*\bterm=["']([^"']+)["'][^>]*>/gi)].map((match) =>
      decodeEntities(match[1])
    );

    return {
      title: firstMatch(block, /<title\b[^>]*>([\s\S]*?)<\/title>/i),
      link:
        firstAttribute(block, /<link\b[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*>/i) ||
        firstAttribute(block, /<link\b[^>]*href=["']([^"']+)["'][^>]*>/i),
      published: firstMatch(block, /<published\b[^>]*>([\s\S]*?)<\/published>/i),
      updated: firstMatch(block, /<updated\b[^>]*>([\s\S]*?)<\/updated>/i),
      summary: stripHtml(firstMatch(block, /<summary\b[^>]*>([\s\S]*?)<\/summary>/i)),
      thumbnail: firstAttribute(block, /<media:thumbnail\b[^>]*url=["']([^"']+)["'][^>]*>/i),
      videoId: firstMatch(block, /<yt:videoId\b[^>]*>([\s\S]*?)<\/yt:videoId>/i),
      categories
    };
  });
}

export function parseRssItems(xml) {
  return [...String(xml).matchAll(/<item\b[\s\S]*?<\/item>/gi)].map(([block]) => {
    const categories = [...block.matchAll(/<category\b[^>]*>([\s\S]*?)<\/category>/gi)].map((match) =>
      decodeEntities(match[1])
    );

    return {
      title: firstMatch(block, /<title\b[^>]*>([\s\S]*?)<\/title>/i),
      link: firstMatch(block, /<link\b[^>]*>([\s\S]*?)<\/link>/i),
      published: firstMatch(block, /<pubDate\b[^>]*>([\s\S]*?)<\/pubDate>/i),
      summary: stripHtml(firstMatch(block, /<description\b[^>]*>([\s\S]*?)<\/description>/i)),
      categories
    };
  });
}
