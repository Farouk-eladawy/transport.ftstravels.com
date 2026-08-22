/** FTS Transport fork — disable ilicense UI and third-party license checks. */
export const FTS_STANDALONE =
  process.env.NEXT_PUBLIC_FTS_STANDALONE !== 'false' &&
  process.env.NEXT_PUBLIC_FTS_STANDALONE !== '0';
