export function buildHeaders(shared) {
  return {
    'Content-Type': 'application/json',
    ...(shared ? { 'X-Agent-Secret': shared } : {})
  };
}
