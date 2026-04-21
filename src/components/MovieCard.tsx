import { useNavigate } from 'react-router-dom';

interface Movie {
    _id?: string;
    id?: string | number;
  title: string;
}

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
    const navigate = useNavigate();
    const movieId = movie._id || movie.id;

    return (
        <article className="movie-card">
            <p className="movie-card__tag">Now showing</p>
            <h3 className="movie-card__title">{movie.title}</h3>
            <button
                className="btn btn-primary"
                onClick={() => navigate('/booking', { state: { movieId, movieTitle: movie.title } })}
                type="button"
                disabled={!movieId}
            >
                Book
            </button>
        </article>
    );
}
