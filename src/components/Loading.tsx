export default function Loading() {
    return (
        <div className="loading-wrap" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <p>Loading data...</p>
        </div>
    );
}
