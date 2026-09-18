import { Hono } from 'hono';

const app = new Hono();

const reservations = [
    { id: 'res_710', guestName: 'Mira Patel', partySize: 4, time: '19:00', table: 'B12', status: 'CONFIRMED' },
    { id: 'res_711', guestName: 'Jon Bell', partySize: 2, time: '19:15', table: 'Window 3', status: 'SEATED' },
    { id: 'res_712', guestName: 'Ada Marin', partySize: 6, time: '19:45', table: 'Chef Rail', status: 'WAITLISTED' },
];

app.get('/health', (c) => c.json({ status: 'ok', service: 'reservation-api', timestamp: new Date().toISOString() }));

app.get('/api/guest-management', (c) => c.json({
    data: {
        service: 'guest-management',
        generatedAt: new Date().toISOString(),
        reservations,
        waitlist: reservations.filter((reservation) => reservation.status === 'WAITLISTED'),
        summary: {
            reservations: reservations.length,
            seated: reservations.filter((reservation) => reservation.status === 'SEATED').length,
            confirmed: reservations.filter((reservation) => reservation.status === 'CONFIRMED').length,
            waitlisted: reservations.filter((reservation) => reservation.status === 'WAITLISTED').length,
            covers: reservations.reduce((sum, reservation) => sum + reservation.partySize, 0),
        },
    },
}));

app.get('/api/v1/reservations', (c) => {
    return c.json({ data: reservations, total: reservations.length, serviceWindow: 'dinner' });
});

app.get('/api/v1/waitlist', (c) => {
    return c.json({
        data: reservations.filter((reservation) => reservation.status === 'WAITLISTED'),
        quotedMinutes: 18,
    });
});

export default {
    port: 4100,
    fetch: app.fetch,
};
