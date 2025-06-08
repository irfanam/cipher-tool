import CryptoJS from "crypto-js";

const PRESET_PASSWORD = process.env.PRESET_PASSWORD;

function keyHash(k) {
  let sum = 0;
  for (let x of k) sum += x.charCodeAt(0);
  return sum;
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

  const m = keyHash(key) % 26;

  if (action === "encode") {
    let r = "";
    for (let i = 0; i < text.length; i++) {
      let ch = text[i];
      if (/[a-zA-Z]/.test(ch)) {
        let charCode = ((ch.toUpperCase().charCodeAt(0) - 65 + m) % 26) + 65;
        r += String.fromCharCode(charCode);
      } else {
        r += ch;
      }
    }
    return res.status(200).json({ result: r });
  }

  if (action === "decode") {
    let r = "";
    for (let i = 0; i < text.length; i++) {
      let ch = text[i];
      if (/[A-Z]/.test(ch)) {
        let charCode = ((ch.charCodeAt(0) - 65 - m + 26) % 26) + 65;
        r += String.fromCharCode(charCode);
      } else {
        r += ch;
      }
    }
    return res.status(200).json({ result: r.toLowerCase() });
  }

  res.status(400).json({ error: "Invalid action" });
}
