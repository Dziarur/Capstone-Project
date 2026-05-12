import { useState } from 'react';
import axios from 'axios';

function Login_page() {
    // State to store user info/token
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Networking call using Axios
            const response = await axios.post('http://localhost:9000/api/login', {
                username,
                password
            });

            // Saving info to State
            setUser(response.data);
            console.log("Token stored:", response.data.token);
        } catch (error) {
            alert("Login Failed!");
        }
    };

    // Conditional Rendering based on State
    if (user) {
        return (
            <div className="p-10">
                <h1 className="text-2xl font-bold">Welcome, {user.user.name}!</h1>
                <button onClick={() => setUser(null)} className="bg-red-500 text-white p-2 mt-4">Logout</button>
                {/* Your Quiz Component goes here later */}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="p-8 bg-white shadow-md rounded-lg">
                <h2 className="mb-4 text-xl font-bold text-center">Python Learning Login</h2>
                <input
                    type="text"
                    placeholder="Username"
                    className="block w-full p-2 mb-4 border rounded"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="block w-full p-2 mb-4 border rounded"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login_page;