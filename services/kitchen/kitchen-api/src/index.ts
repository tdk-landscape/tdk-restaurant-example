import { Hono } from 'hono';

const app = new Hono();

const tickets = [
    { id: 'tkt_301', table: 'B12', station: 'grill', course: 'mains', elapsedMinutes: 11, status: 'FIRING' },
    { id: 'tkt_302', table: 'Window 3', station: 'garde-manger', course: 'starters', elapsedMinutes: 5, status: 'PLATING' },
    { id: 'tkt_303', table: 'Chef Rail', station: 'pastry', course: 'dessert', elapsedMinutes: 2, status: 'QUEUED' },
];

app.get('/health', (c) => c.json({ status: 'ok', service: 'kitchen-api', timestamp: new Date().toISOString() }));

app.get('/api/v1/tickets', (c) => c.json({ data: tickets, total: tickets.length }));

app.get('/api/v1/stations', (c) => {
    return c.json({
        data: [
            { name: 'grill', openTickets: 8, averageFireMinutes: 14 },
            { name: 'garde-manger', openTickets: 5, averageFireMinutes: 7 },
            { name: 'pastry', openTickets: 3, averageFireMinutes: 9 },
        ],
    });
});

export default {
    port: 4110,
    fetch: app.fetch,
};
