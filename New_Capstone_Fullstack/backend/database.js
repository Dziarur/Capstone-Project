const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// ✅ Gunakan path.join untuk kompatibilitas Windows
const dbPath = path.join(__dirname, "capstone.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Gagal connect database:", err.message);
  } else {
    console.log("✅ Connected to SQLite:", dbPath);
    initializeTables();
  }
});

const initializeTables = () => {
  db.serialize(() => {
    // Tabel Users
    db.run(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
      (err) => {
        if (err) console.error("❌ Error create users table:", err.message);
      },
    );

    // Tabel Quiz Results
    db.run(
      `
      CREATE TABLE IF NOT EXISTS quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        scores TEXT,
        input_array TEXT,
        probabilities TEXT,
        predicted_style TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `,
      (err) => {
        if (err)
          console.error("❌ Error create quiz_results table:", err.message);
      },
    );

    // Tabel Questions
    db.run(
      `
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_text TEXT NOT NULL,
        category TEXT NOT NULL,
        question_number INTEGER NOT NULL
      )
    `,
      (err) => {
        if (err) console.error("❌ Error create questions table:", err.message);
        // Cek & insert questions hanya jika tabel sudah ready
        insertQuestions();
      },
    );
  });
};

const insertQuestions = () => {
  // Cek dulu apakah sudah ada data
  db.get("SELECT COUNT(*) as count FROM questions", [], (err, row) => {
    if (err || row.count > 0) return; // Sudah ada, skip insert

    const questions = [
      // Visual (V1-V5)
      ["Saya lebih mudah memahami dengan melihat diagram/grafik", "visual", 1],
      ["Saya suka mencatat informasi penting", "visual", 2],
      ["Saya lebih suka membaca buku daripada mendengarkan", "visual", 3],
      ["Saya mudah mengingat wajah orang", "visual", 4],
      ["Saya suka menggunakan warna dalam catatan saya", "visual", 5],
      // Auditory (A1-A5)
      [
        "Saya lebih mudah memahami dengan mendengarkan penjelasan",
        "auditory",
        6,
      ],
      ["Saya suka berdiskusi dengan orang lain", "auditory", 7],
      ["Saya mudah mengingat apa yang orang katakan", "auditory", 8],
      ["Saya suka membaca dengan suara keras", "auditory", 9],
      ["Saya lebih suka podcast daripada membaca", "auditory", 10],
      // Read/Write (R1-R5)
      ["Saya suka membuat daftar dan menulis catatan", "readwrite", 11],
      ["Saya lebih suka instruksi tertulis", "readwrite", 12],
      ["Saya suka membaca buku dan artikel", "readwrite", 13],
      ["Saya lebih mudah paham dengan membaca manual", "readwrite", 14],
      ["Saya suka menulis esai atau rangkuman", "readwrite", 15],
      // Kinesthetic (K1-K5)
      ["Saya lebih mudah belajar dengan praktik langsung", "kinesthetic", 16],
      ["Saya suka melakukan eksperimen", "kinesthetic", 17],
      ["Saya tidak bisa duduk diam terlalu lama", "kinesthetic", 18],
      ["Saya belajar dengan mencoba-coba", "kinesthetic", 19],
      ["Saya lebih suka aktivitas fisik saat belajar", "kinesthetic", 20],
    ];

    const stmt = db.prepare(
      "INSERT INTO questions (question_text, category, question_number) VALUES (?, ?, ?)",
    );
    questions.forEach((q) => stmt.run(q[0], q[1], q[2]));
    stmt.finalize();
    console.log(`✅ ${questions.length} questions inserted`);
  });
};

module.exports = db;
