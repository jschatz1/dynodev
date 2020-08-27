export function lowerCaseNoSpecialChars(s) {
  return s
    .trim()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s/gi, '_')
    .toLowerCase();
}

export function camelToSnakeCase(s) {
  return s[0]
  .replace(
    /[^\w\s]/gi, ''
  )
  .toLowerCase() + s.slice(
    1, s.length
  )
  .replace(
    /[^\w\s]/gi, ''
  )
  .replace(
    /\s/gi, '_'
  )
  .replace(
    /[A-Z]/g,
    letter => `_${letter.toLowerCase()}`
  )
  .trim();
}
