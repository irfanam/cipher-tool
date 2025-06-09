import CryptoJS from "crypto-js";

const PRESET_PASSWORD = process.env.PRESET_PASSWORD;

function injectNoise(str) {
  const noise = "!@#%&*()-_+=<>?";
  return str.split('').map(char => {
    const rand1 = noise[Math.floor(Math.random() * noise.length)];
    const rand2 = noise[Math.floor(Math.random() * noise.length)];
    return rand1 + rand2 + char;
  }).join('');
}

function removeNoise(str) {
  return str.split('').filter((_, i) => i % 3 === 2).join('');
}

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { text, action, key } = req.body;
  if (!text || !action || !key) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  if (key !== PRESET_PASSWORD) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    if (action === "encode") {
      const encrypted = CryptoJS.AES.encrypt(text, key).toString();
      const reversed = encrypted.split('').reverse().join('');
      const base64ed = Buffer.from(reversed).toString('base64');
      const noised = injectNoise(base64ed);
      return res.status(200).json({ result: noised });
    }

    if (action === "decode") {
      const clean = removeNoise(text);
      const reversed = Buffer.from(clean, 'base64').toString('utf-8').split('').reverse().join('');
      const bytes = CryptoJS.AES.decrypt(reversed, key);
      const original = bytes.toString(CryptoJS.enc.Utf8);
      return res.status(200).json({ result: original });
    }

    res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    return res.status(500).json({ error: "Decryption failed or corrupted input." });
  }
}
