import { useEffect, useState } from 'react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';

type NewMovieForm = {
    title: string;
    genre: string;
    durationMinutes: string;
    releaseDate: string;
};

const isAdminRole = (role?: string) => {
    if (!role) return false;
    return role === 'ADMIN' || role === 'ROLE_ADMIN';
};

export default function Movies() {
    const [movies, setMovies] = useState<any[]>([]);
    const [displayName, setDisplayName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [creatingMovie, setCreatingMovie] = useState(false);
    const [createMessage, setCreateMessage] = useState('');
    const [createMessageKind, setCreateMessageKind] = useState<'info' | 'error'>('info');
    const [newMovie, setNewMovie] = useState<NewMovieForm>({
        title: '',
        genre: '',
        durationMinutes: '90',
        releaseDate: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const storedUserRaw = localStorage.getItem('user');
                let storedUserRole = '';
                let storedUserName = '';
                if (storedUserRaw) {
                    try {
                        const storedUser = JSON.parse(storedUserRaw);
                        storedUserRole = storedUser?.role || '';
                        storedUserName = storedUser?.fullName || storedUser?.name || storedUser?.email || '';
                    } catch {
                        storedUserRole = '';
                        storedUserName = '';
                    }
                }

                const [moviesRes, profileRes] = await Promise.all([
                    api.get('/movies/'),
                    api.get('/users/me').catch(() => null),
                ]);

                setMovies(moviesRes.data?.data || []);

                const profile = profileRes?.data;
                const nextDisplayName =
                    profile?.fullName || profile?.name || profile?.email || storedUserName;
                setDisplayName(nextDisplayName);

                const roles: string[] = Array.isArray(profile?.roles) ? profile.roles : [];
                const hasAdminRole = roles.some((role) => isAdminRole(role)) || isAdminRole(profile?.role) || isAdminRole(storedUserRole);
                setIsAdmin(hasAdminRole);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch movies');
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) return <Loading />;
    if (error) return <p className="alert alert-error">{error}</p>;

    const handleCreateMovie = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingMovie(true);
        setCreateMessage('');

        try {
            const payload = {
                title: newMovie.title.trim(),
                genre: newMovie.genre.trim(),
                durationMinutes: Number(newMovie.durationMinutes),
                releaseDate: new Date(newMovie.releaseDate).toISOString(),
            };

            const res = await api.post('/movies/', payload);
            const createdMovie = res.data;

            setMovies((prev) => [createdMovie, ...prev]);
            setCreateMessageKind('info');
            setCreateMessage('Movie created successfully.');
            setNewMovie({
                title: '',
                genre: '',
                durationMinutes: '90',
                releaseDate: '',
            });
        } catch (err: any) {
            setCreateMessageKind('error');
            setCreateMessage(err.response?.data?.message || 'Failed to create movie');
        } finally {
            setCreatingMovie(false);
        }
    };

    return (
        <section className="movies-page">
            <header className="section-head">
                <p className="eyebrow">
                    {displayName ? `Welcome, ${displayName}` : 'Choose your show'}
                </p>
                <h1 className="page-title">Available Movies</h1>
            </header>
            {isAdmin && (
                <section className="admin-movie-panel">
                    <h2 className="admin-movie-panel__title">Add New Movie (Admin)</h2>
                    {createMessage && (
                        <p className={createMessageKind === 'error' ? 'alert alert-error' : 'alert alert-info'}>
                            {createMessage}
                        </p>
                    )}
                    <form className="form-stack" onSubmit={handleCreateMovie}>
                        <input
                            className="input"
                            type="text"
                            placeholder="Movie title"
                            value={newMovie.title}
                            onChange={(e) => setNewMovie((prev) => ({ ...prev, title: e.target.value }))}
                            required
                        />
                        <input
                            className="input"
                            type="text"
                            placeholder="Genre"
                            value={newMovie.genre}
                            onChange={(e) => setNewMovie((prev) => ({ ...prev, genre: e.target.value }))}
                            required
                        />
                        <input
                            className="input"
                            type="number"
                            min="1"
                            placeholder="Duration (minutes)"
                            value={newMovie.durationMinutes}
                            onChange={(e) => setNewMovie((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                            required
                        />
                        <input
                            className="input"
                            type="date"
                            value={newMovie.releaseDate}
                            onChange={(e) => setNewMovie((prev) => ({ ...prev, releaseDate: e.target.value }))}
                            required
                        />
                        <button className="btn btn-primary" type="submit" disabled={creatingMovie}>
                            {creatingMovie ? 'Creating...' : 'Create Movie'}
                        </button>
                    </form>
                </section>
            )}
            <div className="movies-grid">
                {movies.map(movie => (
                    <MovieCard key={movie._id || movie.id} movie={movie} />
                ))}
            </div>
        </section>
    );
}
