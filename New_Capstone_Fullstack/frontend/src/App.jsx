import { useState } from "react";
import { authAPI, quizAPI } from "./api";

function App() {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register(
        formData.username,
        formData.email,
        formData.password,
      );
      alert("✅ Registrasi berhasil! Silakan login");
      setPage("login");
      setFormData({ username: "", email: "", password: "" });
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || "Terjadi kesalahan"));
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.login(formData.username, formData.password);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setPage("quiz");
    } catch (err) {
      alert(
        "❌ Login gagal: " + (err.response?.data?.error || "Terjadi kesalahan"),
      );
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPage("login");
    setAnswers([]);
    setResult(null);
  };

  // Handle Quiz Submit
  const handleSubmitQuiz = async () => {
    if (answers.length !== 20) {
      alert("⚠️ Jawab semua 20 soal!");
      return;
    }
    setLoading(true);
    try {
      const res = await quizAPI.submit(answers);
      setResult(res.data);
      setPage("result");
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || "Gagal submit quiz"));
    }
    setLoading(false);
  };

  const handleAnswer = (id, score) => {
    setAnswers((prev) => {
      const exists = prev.find((a) => a.id === id);
      if (exists) {
        return prev.map((a) => (a.id === id ? { id, score } : a));
      }
      return [...prev, { id, score }];
    });
  };

  // Questions Data
  const questions = [
    {
      id: 1,
      text: "Saya lebih mudah memahami dengan melihat diagram/grafik",
      category: "Visual",
    },
    { id: 2, text: "Saya suka mencatat informasi penting", category: "Visual" },
    {
      id: 3,
      text: "Saya lebih suka membaca buku daripada mendengarkan",
      category: "Visual",
    },
    { id: 4, text: "Saya mudah mengingat wajah orang", category: "Visual" },
    {
      id: 5,
      text: "Saya suka menggunakan warna dalam catatan saya",
      category: "Visual",
    },
    {
      id: 6,
      text: "Saya lebih mudah memahami dengan mendengarkan penjelasan",
      category: "Auditory",
    },
    {
      id: 7,
      text: "Saya suka berdiskusi dengan orang lain",
      category: "Auditory",
    },
    {
      id: 8,
      text: "Saya mudah mengingat apa yang orang katakan",
      category: "Auditory",
    },
    {
      id: 9,
      text: "Saya suka membaca dengan suara keras",
      category: "Auditory",
    },
    {
      id: 10,
      text: "Saya lebih suka podcast daripada membaca",
      category: "Auditory",
    },
    {
      id: 11,
      text: "Saya suka membuat daftar dan menulis catatan",
      category: "Read/Write",
    },
    {
      id: 12,
      text: "Saya lebih suka instruksi tertulis",
      category: "Read/Write",
    },
    {
      id: 13,
      text: "Saya suka membaca buku dan artikel",
      category: "Read/Write",
    },
    {
      id: 14,
      text: "Saya lebih mudah paham dengan membaca manual",
      category: "Read/Write",
    },
    {
      id: 15,
      text: "Saya suka menulis esai atau rangkuman",
      category: "Read/Write",
    },
    {
      id: 16,
      text: "Saya lebih mudah belajar dengan praktik langsung",
      category: "Kinesthetic",
    },
    { id: 17, text: "Saya suka melakukan eksperimen", category: "Kinesthetic" },
    {
      id: 18,
      text: "Saya tidak bisa duduk diam terlalu lama",
      category: "Kinesthetic",
    },
    {
      id: 19,
      text: "Saya belajar dengan mencoba-coba",
      category: "Kinesthetic",
    },
    {
      id: 20,
      text: "Saya lebih suka aktivitas fisik saat belajar",
      category: "Kinesthetic",
    },
  ];

  // RENDER PAGES
  if (page === "login") {
    return (
      <div
        style={{
          maxWidth: "400px",
          margin: "80px auto",
          padding: "30px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#333" }}>🎓 Quiz VARK</h2>
        <h3 style={{ textAlign: "center", color: "#666" }}>Login</h3>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setPage("register")}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </form>
      </div>
    );
  }

  if (page === "register") {
    return (
      <div
        style={{
          maxWidth: "400px",
          margin: "50px auto",
          padding: "30px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#333" }}>🎓 Quiz VARK</h2>
        <h3 style={{ textAlign: "center", color: "#666" }}>Register</h3>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setPage("login")}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Kembali
          </button>
        </form>
      </div>
    );
  }

  if (page === "quiz") {
    const answeredCount = answers.length;
    const progress = (answeredCount / 20) * 100;

    return (
      <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2>📝 Quiz Gaya Belajar VARK</h2>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        <div
          style={{
            background: "#e9ecef",
            height: "30px",
            borderRadius: "15px",
            marginBottom: "20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              background: "#28a745",
              height: "100%",
              transition: "width 0.3s",
            }}
          ></div>
        </div>
        <p style={{ textAlign: "center" }}>Progress: {answeredCount}/20 soal</p>

        <div style={{ marginBottom: "20px" }}>
          {questions.map((q, idx) => {
            const userAnswer = answers.find((a) => a.id === q.id);
            return (
              <div
                key={q.id}
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  border: userAnswer ? "2px solid #28a745" : "2px solid #ddd",
                }}
              >
                <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
                  <span style={{ color: "#007bff" }}>{idx + 1}.</span> {q.text}
                  <span style={{ color: "#6c757d", fontSize: "14px" }}>
                    {" "}
                    ({q.category})
                  </span>
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleAnswer(q.id, score)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background:
                          userAnswer?.score === score ? "#007bff" : "#e9ecef",
                        color: userAnswer?.score === score ? "white" : "#333",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        transition: "all 0.2s",
                      }}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6c757d",
                    margin: "5px 0 0 0",
                    textAlign: "center",
                  }}
                >
                  1 = Sangat Tidak Sesuai | 5 = Sangat Sesuai
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSubmitQuiz}
          disabled={loading || answeredCount !== 20}
          style={{
            width: "100%",
            padding: "15px",
            background: answeredCount === 20 ? "#28a745" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: answeredCount === 20 ? "pointer" : "not-allowed",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {loading ? "⏳ Memproses..." : `Submit Quiz (${answeredCount}/20)`}
        </button>
      </div>
    );
  }

  if (page === "result" && result) {
    const sortedProbs = Object.entries(result.probabilities).sort(
      (a, b) => b[1] - a[1],
    );

    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "50px auto",
          padding: "30px",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        }}
      >
        <h2>🎉 Hasil Quiz</h2>

        <div
          style={{
            padding: "30px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "12px",
            margin: "30px 0",
            color: "white",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
            Gaya Belajar Dominan Anda:
          </h3>
          <h1 style={{ margin: "0", fontSize: "36px" }}>
            {result.predicted_style}
          </h1>
        </div>

        <h4 style={{ textAlign: "left", marginBottom: "15px" }}>
          📊 Probabilitas:
        </h4>
        {sortedProbs.map(([style, prob]) => (
          <div key={style} style={{ marginBottom: "15px", textAlign: "left" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
              }}
            >
              <strong>{style}</strong>
              <strong>{(prob * 100).toFixed(1)}%</strong>
            </div>
            <div
              style={{
                background: "#e9ecef",
                height: "25px",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${prob * 100}%`,
                  background:
                    style === result.predicted_style ? "#28a745" : "#007bff",
                  height: "100%",
                  transition: "width 0.5s",
                }}
              ></div>
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#f8f9fa",
            borderRadius: "8px",
            textAlign: "left",
          }}
        >
          <h4>📈 Score per Kategori:</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {Object.entries(result.scores).map(([key, value]) => (
              <li
                key={key}
                style={{ padding: "5px 0", borderBottom: "1px solid #ddd" }}
              >
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                {value}/25
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
          <button
            onClick={handleLogout}
            style={{
              flex: 1,
              padding: "12px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
          <button
            onClick={() => {
              setAnswers([]);
              setResult(null);
              setPage("quiz");
            }}
            style={{
              flex: 1,
              padding: "12px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Quiz Ulang
          </button>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}

export default App;
