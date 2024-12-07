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
        address: '0x8a919b906abF4160ffb8a21a739205896d3f89bB',
        description: 'Known for high-profit BASE trades'
    },
    {
        id: '2',
        name: '🦈 TetraNode',
        address: '0x6ef460eb3563ccf801f5f0d0f87ebe675b4f3f41',
        description: 'Specializes in DeFi arbitrage'
    },
    {
        id: '3',
        name: '🐬 GiganticRebirth',
        address: '0x0f44c0a84f00bed2fd7f74db5b13d8c4e79574bf',
        description: 'Expert in BASE DEX trading'
    },
    {
        id: '4',
        name: '🦁 Light',
        address: '0x000000a52a03835517e9d193b3c27626e1bc96b1',
        description: 'Consistent performer in volatile markets'
    }
];


// a function to track all whales
// a function to check who all subscribed to which whale
// store chat id of subscribed traders and send notif if that whale transacts. 