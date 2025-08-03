/**
 * Generates a SHA256 hash from a given input string using Web Crypto API
 * @param input - The string to hash
 * @returns Promise resolving to the SHA256 hash as a hexadecimal string
 */
export const generateSHA256Hash = async (input: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Verifies if a given input matches a provided hash
 * @param input - The input string to verify
 * @param hash - The expected hash to compare against
 * @returns Promise resolving to true if the input matches the hash, false otherwise
 */
export const verifyHash = async (input: string, hash: string): Promise<boolean> => {
  const inputHash = await generateSHA256Hash(input);
  return inputHash === hash;
};
