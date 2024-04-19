export const handleCumulativeData = (chunk: string): string | undefined => {
  chunk = chunk.replace(/^data: /, '').replace(/\n\n$/, '');
  const messages = chunk.split('\n\n');
  const lastMessage = messages[messages.length - 1];
  if (lastMessage !== '') {
    return lastMessage;
  }
};