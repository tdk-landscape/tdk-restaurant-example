type TicketEvent = {
    id: string;
    table: string;
    elapsedMinutes: number;
};

export function scoreTicketAging(event: TicketEvent) {
    const urgency = event.elapsedMinutes >= 14 ? 'EXPEDITE' : event.elapsedMinutes >= 9 ? 'WATCH' : 'NORMAL';
    return { ...event, urgency, scoredAt: new Date().toISOString() };
}

if (import.meta.main) {
    setInterval(() => {
        const signal = scoreTicketAging({ id: `tkt_${Date.now()}`, table: 'B12', elapsedMinutes: 12 });
        console.log('[Kitchen Worker] ticket signal', signal);
    }, 10000);
}
