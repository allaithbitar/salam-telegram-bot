import CryptoJS from "crypto-js";

export const encrypt = (string) => {
  const parsedPassword = CryptoJS.enc.Utf8.parse(string);
  const key = CryptoJS.enc.Utf8.parse(process.env.SETTINGS_TOKEN_HASH_SALT);
  const iv = CryptoJS.enc.Hex.parse(process.env.SETTINGS_TOKEN_IV);
  return CryptoJS.DES.encrypt(parsedPassword, key, { iv }).toString();
};

export const decrypt = (string) => {
  const key = CryptoJS.enc.Utf8.parse(process.env.SETTINGS_TOKEN_HASH_SALT);
  const iv = CryptoJS.enc.Hex.parse(process.env.SETTINGS_TOKEN_IV);
  return CryptoJS.DES.decrypt(string, key, { iv }).toString(CryptoJS.enc.Utf8);
};
