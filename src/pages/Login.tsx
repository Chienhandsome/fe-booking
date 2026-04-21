import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/users/login', { email, password });
            const token = res.data?.accessToken || res.data?.token || '';
            if (!token) {
                throw new Error('Token missing in login response');
            }
            localStorage.setItem('token', token);
            if (res.data?.user) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
            }
            navigate('/movies');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-page">
            <div className="auth-card">
                <p className="eyebrow">Welcome back</p>
                <h1 className="page-title">Login</h1>
                {error && <p className="alert alert-error">{error}</p>}
                <form onSubmit={handleLogin} className="form-stack">
                <input
                    className="input"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    className="input"
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                />
                <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            </div>
        </section>
    );
}
