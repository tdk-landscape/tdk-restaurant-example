import { Hono } from 'hono';

const app = new Hono();

const menuItems = [
    { id: 'item_01', name: 'Coal-roasted carrots', station: 'garde-manger', available: true, remaining: 18 },
    { id: 'item_02', name: 'Dry-aged ribeye', station: 'grill', available: true, remaining: 7 },
    { id: 'item_03', name: 'Lemon posset', station: 'pastry', available: false, remaining: 0 },
];

const floorTables = [
    { id: 'A1', status: 'seated', covers: 2, server: 'Mina', turnMinutes: 42 },
    { id: 'A2', status: 'reset', covers: 0, server: 'Mina', turnMinutes: 0 },
    { id: 'B7', status: 'hold', covers: 4, server: 'Jonah', turnMinutes: 12 },
    { id: 'B8', status: 'seated', covers: 3, server: 'Jonah', turnMinutes: 67 },
    { id: 'Rail', status: 'seated', covers: 5, server: 'Ari', turnMinutes: 28 },
    { id: 'PDR', status: 'hold', covers: 8, server: 'Nora', turnMinutes: 18 },
];

app.get('/health', (c) => c.json({ status: 'ok', service: 'menu-api', timestamp: new Date().toISOString() }));

app.get('/api/operations-management', (c) => c.json({
    data: {
        service: 'operations-management',
        generatedAt: new Date().toISOString(),
        floor: {
            tables: floorTables,
            totals: {
                seated: floorTables.filter((table) => table.status === 'seated').length,
                holds: floorTables.filter((table) => table.status === 'hold').length,
                covers: floorTables.reduce((sum, table) => sum + table.covers, 0),
            },
        },
        menu: {
            items: menuItems,
            unavailable: menuItems.filter((item) => !item.available),
        },
    },
}));

app.get('/api/v1/menu-items', (c) => c.json({ data: menuItems }));

app.get('/api/v1/eighty-six', (c) => c.json({ data: menuItems.filter((item) => !item.available) }));

export default {
    port: 4120,
    fetch: app.fetch,
};
