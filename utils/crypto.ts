import crypto from "crypto";
import { cpz } from "../@types";

const pwd = process.env.ENCRYPTION_PWD;

//TODO: Use Vault to store keys
function createKey(userId: string) {
  const userKeys = userId.split("-");
  const pwdKeys = pwd.split("-");
  const pass = [
    pwdKeys[2],
    userKeys[4],
    pwdKeys[3],
    userKeys[1],
    userKeys[0],
    pwdKeys[0],
    pwdKeys[1],
    userKeys[2],
    pwdKeys[4],
    userKeys[3]
  ].join("");
  return crypto.scryptSync(pass, "salt", 32);
}

async function encrypt(
  userId: string,
  data: string
): Promise<cpz.EncryptedData> {
  const key = createKey(userId);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let crypted = cipher.update(data, "utf8", "hex");
  crypted += cipher.final("hex");
  return { iv: iv.toString("hex"), data: crypted };
}

async function decrypt(
  userId: string,
  encryptedData: cpz.EncryptedData
): Promise<string> {
  const key = createKey(userId);
  const iv = Buffer.from(encryptedData.iv, "hex");
  var decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  var decrypted = decipher.update(encryptedData.data, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export { encrypt, decrypt };
