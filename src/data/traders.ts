interface Trader {
    id: string;
    name: string;
    address: string;
    description: string;
}

export const traders: Trader[] = [
    {
        id: '1',
        name: '🐋 DegenSpartan',
        address: '0xA86275c0fa6de82eb4a4D5DCe5A9bBf60984fC41',
        description: 'Known for high-profit BASE trades'
    },
    {
        id: '2',
        name: '🦈 TetraNode',
        address: '',
        description: 'Specializes in DeFi arbitrage'
    },
    {
        id: '3',
        name: '🐬 GiganticRebirth',
        address: '',
        description: 'Expert in BASE DEX trading'
    },
    {
        id: '4',
        name: '🦁 Light Giant',
        address: '',
        description: 'Consistent performer in volatile markets'
    }
];


// a function to track all whales
// a function to check who all subscribed to which whale
// store chat id of subscribed traders and send notif if that whale transacts. 