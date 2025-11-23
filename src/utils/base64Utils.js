export const encodeToBase64 = (content) => {
  const bytes = new TextEncoder('utf-8').encode(content);
  const binaryString = String.fromCharCode(...bytes);
  return btoa(binaryString);
};

export const decodeFromBase64 = (base64Content) => {
  const binaryString = atob(base64Content);
  const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
};
