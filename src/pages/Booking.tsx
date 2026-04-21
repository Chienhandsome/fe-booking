import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';

type PaymentResult = {
    bookingId?: string;
    status?: 'SUCCESS' | 'FAILED' | string;
    message?: string;
    transactionId?: string | null;
};

export default function Booking() {
    const location = useLocation();
    const navigate = useNavigate();
    const { movieId, movieTitle } = location.state || {};
    const [numberOfSeats, setNumberOfSeats] = useState(1);
    const [message, setMessage] = useState('');
    const [messageKind, setMessageKind] = useState<'info' | 'error'>('info');
    const [loading, setLoading] = useState(false);
    const [needConfirmRedirect, setNeedConfirmRedirect] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const messageClass = messageKind === 'error' ? 'alert alert-error' : 'alert alert-info';

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
            socketRef.current?.disconnect();
        };
    }, []);

    if (!movieId) {
        return <p className="alert alert-error">No movie selected. Please go back and select a movie.</p>;
    }

    const waitForPaymentNotification = (bookingId: string) => {
        const configuredSocketUrl = import.meta.env.VITE_NOTIFICATION_SOCKET_URL?.trim();
        const configuredSocketPath = import.meta.env.VITE_NOTIFICATION_SOCKET_PATH?.trim();

        const connectionCandidates = [
            {
                url: configuredSocketUrl || 'http://127.0.0.1:8084',
                path: configuredSocketPath || '/socket.io',
            },
            {
                url: window.location.origin,
                path: '/api/notification/socket.io',
            },
        ];

        let candidateIndex = 0;

        const connect = () => {
            const current = connectionCandidates[candidateIndex];

            socketRef.current?.disconnect();

            const socket = io(current.url, {
                path: current.path,
                transports: ['websocket', 'polling'],
                reconnection: false,
                timeout: 5000,
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                timeoutRef.current = window.setTimeout(() => {
                    setMessageKind('error');
                    setMessage('Payment notification timeout. Please check booking history.');
                    setLoading(false);
                    socket.disconnect();
                }, 30000);
            });

            socket.on('connect_error', () => {
                socket.disconnect();

                candidateIndex += 1;
                if (candidateIndex < connectionCandidates.length) {
                    connect();
                    return;
                }

                setMessageKind('error');
                setMessage('Cannot connect to payment notification channel.');
                setLoading(false);
            });

            socket.on('PAYMENT_RESULT', (payload: PaymentResult) => {
                if (!payload?.bookingId || payload.bookingId !== bookingId) {
                    return;
                }

                if (timeoutRef.current) {
                    window.clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }

                if (payload.status === 'SUCCESS') {
                    setMessageKind('info');
                    setMessage(payload.message || `Booking #${bookingId} confirmed successfully.`);
                } else {
                    setMessageKind('error');
                    setMessage(payload.message || 'Payment failed. Please try again.');
                }

                setNeedConfirmRedirect(true);
                setLoading(false);
                socket.disconnect();
            });
        };

        connect();
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setNeedConfirmRedirect(false);
        setMessageKind('info');
        setMessage('Creating booking...');
        
        try {
            const res = await api.post('/bookings', {
                movieId,
                ticketQuantity: numberOfSeats,
            });
            const bookingId = res.data?._id || res.data?.id || res.data?.bookingId;

            if (!bookingId) {
                setMessageKind('error');
                setMessage('Booking created but missing bookingId from server response.');
                setLoading(false);
                return;
            }

            setMessage(`Booking #${bookingId} created. Waiting for payment result...`);
            waitForPaymentNotification(String(bookingId));
        } catch (err: any) {
            setMessageKind('error');
            setMessage(err.response?.data?.message || 'Booking failed');
            setLoading(false);
        }
    };

    const handleConfirmAndBack = () => {
        navigate('/movies');
    };

    return (
        <section className="booking-page">
            <div className="booking-card">
            <p className="eyebrow">Secure your seat</p>
            <h1 className="page-title">Book Tickets</h1>
            <p className="booking-meta"><strong>Movie:</strong> {movieTitle || movieId}</p>

            {message && (
                <div className={messageClass}>
                    {message}
                </div>
            )}

            {needConfirmRedirect ? (
                <form className="form-stack" onSubmit={(e) => e.preventDefault()}>
                    <p className="booking-meta">Review complete. Continue when you are ready.</p>
                    <button
                        className="btn btn-primary"
                        type="button"
                        onClick={handleConfirmAndBack}
                    >
                        Xac nhan va quay lai Movies
                    </button>
                </form>
            ) : (
                <form onSubmit={handleBooking} className="form-stack">
                    <label className="field-label">
                        Number of Seats:
                        <input
                            className="input"
                            type="number" 
                            min="1" 
                            value={numberOfSeats} 
                            onChange={e => setNumberOfSeats(Number(e.target.value))}
                            required
                        />
                    </label>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Processing...' : 'Confirm Booking'}
                    </button>
                </form>
            )}
            </div>
        </section>
    );
}
