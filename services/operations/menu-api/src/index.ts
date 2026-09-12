import { Hono } from 'hono';

const app = new Hono();

const menuItems = [
    { id: 'item_01', name: 'Coal-roasted carrots', station: 'garde-manger', available: true, remaining: 18 },
    { id: 'item_02', name: 'Dry-aged ribeye', station: 'grill', available: true, remaining: 7 },
    { id: 'item_03', name: 'Lemon posset', station: 'pastry', available: false, remaining: 0 },
];

app.get('/health', (c) => c.json({ status: 'ok', service: 'menu-api', timestamp: new Date().toISOString() }));

app.get('/api/v1/menu-items', (c) => c.json({ data: menuItems }));

app.get('/api/v1/eighty-six', (c) => c.json({ data: menuItems.filter((item) => !item.available) }));

export default {
    port: 4120,
    fetch: app.fetch,
};
