import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        let cancelled = false;

        const fetchProfile = async () => {
            if (!token) {
                setDisplayName('');
                return;
            }

            try {
                const res = await api.get('/users/me');
                if (cancelled) return;
                const profile = res.data;
                const name = profile?.fullName || profile?.name || profile?.email || '';
                setDisplayName(name);
            } catch {
                if (!cancelled) {
                    setDisplayName('');
                }
            }
        };

        fetchProfile();

        return () => {
            cancelled = true;
        };
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setDisplayName('');
        navigate('/login');
    };

    return (
        <nav className="top-nav">
            <div className="top-nav__inner">
                <button className="brand" type="button" onClick={() => navigate('/movies')}>
                    <span className="brand__dot" aria-hidden="true" />
                    MovieTicket
                </button>
                <NavLink to="/movies" className="nav-link">
                    Movies
                </NavLink>
            {token ? (
                <div className="top-nav__auth">
                    {displayName && <span className="top-nav__user">{displayName}</span>}
                    <button className="btn btn-ghost" type="button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            ) : (
                <div className="top-nav__actions">
                    <NavLink to="/login" className="nav-link">Login</NavLink>
                    <NavLink to="/register" className="btn btn-primary">Register</NavLink>
                </div>
            )}
            </div>
        </nav>
    );
}
