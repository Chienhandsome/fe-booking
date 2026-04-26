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

type SocketConfigResolution =
    | { ok: true; url: string; path: string }
    | { ok: false; error: string };

const resolveSocketConfig = (): SocketConfigResolution => {
    const configuredSocketUrl = import.meta.env.VITE_NOTIFICATION_SOCKET_URL?.trim();
    const configuredSocketPath = import.meta.env.VITE_NOTIFICATION_SOCKET_PATH?.trim() || '/socket.io';

    if (configuredSocketUrl) {
        return {
            ok: true,
            url: configuredSocketUrl,
            path: configuredSocketPath,
        };
    }

    if (import.meta.env.DEV) {
        return {
            ok: true,
            // Dev-only fallback to current hostname and notification service port.
            url: `${window.location.protocol}//${window.location.hostname}:8084`,
            path: configuredSocketPath,
        };
    }

    return {
        ok: false,
        error: 'Missing VITE_NOTIFICATION_SOCKET_URL in production environment.',
    };
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

    const clearNotificationTimeout = () => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const teardownSocketConnection = () => {
        if (!socketRef.current) {
            return;
        }

        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
    };

    useEffect(() => {
        return () => {
            clearNotificationTimeout();
            teardownSocketConnection();
        };
    }, []);

    if (!movieId) {
        return <p className="alert alert-error">No movie selected. Please go back and select a movie.</p>;
    }

    const waitForPaymentNotification = (bookingId: string) => {
        clearNotificationTimeout();
        teardownSocketConnection();

        const socketConfig = resolveSocketConfig();
        if (!socketConfig.ok) {
            setMessageKind('error');
            setMessage(socketConfig.error);
            setLoading(false);
            return;
        }

        const socket = io(socketConfig.url, {
            path: socketConfig.path,
            transports: ['websocket', 'polling'],
            reconnection: false,
            timeout: 5000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            clearNotificationTimeout();
            timeoutRef.current = window.setTimeout(() => {
                setMessageKind('error');
                setMessage('Payment notification timeout. Please check booking history.');
                setLoading(false);
                clearNotificationTimeout();
                teardownSocketConnection();
            }, 30000);
        });

        socket.on('connect_error', () => {
            clearNotificationTimeout();
            setMessageKind('error');
            setMessage('Cannot connect to payment notification channel.');
            setLoading(false);
            teardownSocketConnection();
        });

        socket.on('PAYMENT_RESULT', (payload: PaymentResult) => {
            if (!payload?.bookingId || payload.bookingId !== bookingId) {
                return;
            }

            clearNotificationTimeout();

            if (payload.status === 'SUCCESS') {
                setMessageKind('info');
                setMessage(payload.message || `Booking #${bookingId} confirmed successfully.`);
            } else {
                setMessageKind('error');
                setMessage(payload.message || 'Payment failed. Please try again.');
            }

            setNeedConfirmRedirect(true);
            setLoading(false);
            teardownSocketConnection();
        });
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
