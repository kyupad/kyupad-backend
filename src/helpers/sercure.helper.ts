import CryptoJS from 'crypto-js';

const encrypt = (content: string, secretKey: string, active = true): string => {
  if (!active) return content;
  return CryptoJS.AES.encrypt(content, secretKey).toString();
};

const decrypt = (
  encryptedString: string,
  secretKey: string,
  active = true,
): string => {
  if (!active) return encryptedString;
  return CryptoJS.AES.decrypt(encryptedString, secretKey).toString(
    CryptoJS.enc.Utf8,
  );
};
export { encrypt, decrypt };
