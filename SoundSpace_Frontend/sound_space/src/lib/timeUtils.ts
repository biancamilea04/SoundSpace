const DIVISIONS: { amount: number; name: string }[] = [
    { amount: 60,                        name: 's' },
    { amount: 60,                        name: 'm' },
    { amount: 24,                        name: 'h' },
    { amount: 7,                         name: 'd' },
    { amount: 4.34524,                   name: 'w' },
    { amount: 12,                        name: 'mo' },
    { amount: Number.POSITIVE_INFINITY,  name: 'y' },
];

export function formatRelativeTime(iso: string): string {
    let duration = (new Date(iso).getTime() - Date.now()) / 1000;
    const isPast = duration < 0;
    duration = Math.abs(duration);

    for (const division of DIVISIONS) {
        if (duration < division.amount) {
            const rounded = Math.round(duration);
            return isPast ? `${rounded} ${division.name} ago` : `in ${rounded} ${division.name}`;
        }
        duration /= division.amount;
    }

    return iso;
}
