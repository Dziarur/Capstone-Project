const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { execFile } = require("child_process");
const db = require("./database");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "ganti-dengan-secret-kuat";
const PORT = process.env.PORT || 5000;

// Middleware Auth
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token diperlukan" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token tidak valid" });
    req.user = user;
    next();
  });
};

//  AUTH
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "Semua field wajib" });
  try {
    const hashed = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed],
      function (err) {
        if (err?.message.includes("UNIQUE"))
          return res.status(400).json({ error: "Username/email sudah ada" });
        res.json({ message: "Register berhasil", userId: this.lastID });
      },
    );
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [username, username],
    async (err, user) => {
      if (!user) return res.status(401).json({ error: "User tidak ditemukan" });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: "Password salah" });
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "24h" },
      );
      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    },
  );
});

// 📝 QUIZ
app.get("/api/quiz/questions", authenticate, (req, res) => {
  // Hardcode 20 soal VARK sesuai urutan
  const questions = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    text: `Pertanyaan VARK nomor ${i + 1} (skala 1-5)`,
    category:
      i < 5
        ? "visual"
        : i < 10
          ? "auditory"
          : i < 15
            ? "readwrite"
            : "kinesthetic",
  }));
  res.json({ questions });
});

app.post("/api/quiz/submit", authenticate, (req, res) => {
  const { answers } = req.body; // [{id: 1, score: 4}, ...]
  if (!Array.isArray(answers) || answers.length !== 20)
    return res.status(400).json({ error: "Harus 20 jawaban (1-5)" });

  // Urutkan sesuai ID agar array pasti: V1-V5, A1-A5, R1-R5, K1-K5
  const sorted = answers.sort((a, b) => a.id - b.id);
  const inputArray = sorted.map((a) => a.score);

  // Hitung score per kategori
  const scores = { visual: 0, auditory: 0, readwrite: 0, kinesthetic: 0 };
  sorted.forEach((a, idx) => {
    if (idx < 5) scores.visual += a.score;
    else if (idx < 10) scores.auditory += a.score;
    else if (idx < 15) scores.readwrite += a.score;
    else scores.kinesthetic += a.score;
  });

  //  Panggil Python untuk scaling & prediksi
  const scriptPath = path.join(__dirname, "../ml/predict.py");
  execFile(
    "python",
    [scriptPath, JSON.stringify(inputArray)],
    (err, stdout) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Gagal menjalankan model ML", detail: err.message });

      try {
        const result = JSON.parse(stdout);
        const { probabilities, predicted_style } = result;

        // Simpan ke SQLite
        db.run(
          `INSERT INTO quiz_results (user_id, scores, input_array, probabilities, predicted_style)
         VALUES (?, ?, ?, ?, ?)`,
          [
            req.user.id,
            JSON.stringify(scores),
            JSON.stringify(inputArray),
            JSON.stringify(probabilities),
            predicted_style,
          ],
          function (err) {
            if (err)
              return res.status(500).json({ error: "Gagal simpan hasil" });
            res.json({
              resultId: this.lastID,
              scores,
              probabilities,
              predicted_style,
            });
          },
        );
      } catch (e) {
        res.status(500).json({ error: "Format output Python tidak valid" });
      }
    },
  );
});

//  HISTORY
app.get("/api/quiz/history", authenticate, (req, res) => {
  db.all(
    "SELECT id, scores, probabilities, predicted_style, created_at FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Gagal ambil history" });
      res.json({ history: rows });
    },
  );
});

app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`),
);
