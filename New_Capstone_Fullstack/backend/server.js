const express = require('express');
const app = express();
const PORT = 9000;
const Database = require('better-sqlite3');
const db = Database('C:\\Users\\LENOVO\\Program Python\\Capstone_git\\Capstone-Project\\New_Capstone_Fullstack\\DB\\sqlite-test.db'); // Automatically creates the file
const cors = require('cors'); // Essential for letting React talk to Express

app.use(cors());
app.use(express.json());

// A simple POST route for Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const query = db.prepare('SELECT * FROM users WHERE name = ? AND passwot = ?');
    const user = query.get(username, password);

    if (user) {
        res.status(200).json({
            message: "Login successful",
            token: "secret-token-123",
            user: user
        });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

app.listen(9000, () => console.log("Server running on port 9000"));