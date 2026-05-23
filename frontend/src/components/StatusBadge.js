function StatusBadge({ status }) {
    if (!status) {
        return <span className="badge">N/A</span>;
    }

    const badgeClass = `badge badge-${status}`;

    return <span className={badgeClass}>{status}</span>;
}

export default StatusBadge;