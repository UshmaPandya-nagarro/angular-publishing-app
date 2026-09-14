addEventListener('message', ({ data }) => {
  const html = data ?? '';

  const plainText = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = plainText.length === 0 ? [] : plainText.split(' ');

  const wordCount = words.length;

  const characterCount = plainText.length;

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  postMessage({
    wordCount,
    characterCount,
    readingTime,
  });
});
