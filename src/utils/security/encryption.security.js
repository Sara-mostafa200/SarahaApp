import crypto from "crypto";
import fs from "node:fs";

export const encrypted = ({ plaintext = "" }) => {
  const iv = crypto.randomBytes(Number(process.env.IV_LENGTH));
  const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY);
  const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);

  let encryptedData = cipher.update(plaintext, "utf-8", "hex");

  encryptedData += cipher.final("hex");

  return `${iv.toString("hex")}:${encryptedData}`;
};

export const decrypted = ({ value = "" } = {}) => {
  const [ivHex, encryptedData] = value.split(":");

  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY,
    iv
  );

  let decryptedData = decipher.update(encryptedData, "hex", "utf-8");

  decryptedData += decipher.final("utf-8");

  return decryptedData;
};

// Asymmetric Encryption

if (fs.existsSync("publicKey.pem") && fs.existsSync("privateKey.pem")) {
  
} else {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },

    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });

  fs.writeFileSync("publicKey.pem", publicKey);
  fs.writeFileSync("privateKey.pem", privateKey);
}

export const AsymmetricEncryption = ({ text = "" } = {}) => {
  const BufferText = Buffer.from(text);
  const publicKey = fs.readFileSync("publicKey.pem");

  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    BufferText
  );

  return encrypted.toString("hex");
};

export const AsymmetricDecryption = ({ encryptedData = "" } = {}) => {
  const privateKey = fs.readFileSync("privateKey.pem");
  const Data = Buffer.from(encryptedData , 'hex')
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Data
  );

  return decrypted.toString("utf-8");
};
