export interface SubMenuItem { path: string; label: string }
export interface MenuItem { path?: string; label: string; children?: SubMenuItem[] }

// Centralized app menu used by Sidebar/Drawer/Home quick nav
export const appMenu: MenuItem[] = [
  { path: '/', label: 'Home' },
  {
    path: '/signing-demo',
    label: 'Signing Demo',
    children: [
      { path: '/signing-demo/message-signing', label: 'Message Signing' },
      { path: '/signing-demo/sign-transaction', label: 'Sign Transaction' },
    ],
  },
  { path: '/crypt', label: 'Encrypt/Decrypt Demo' },
  { path: '/decode-txraws', label: 'Decode Txraws' },
  { path: '/keys-to-address', label: 'Keys to Address' },
  { path: '/tbc', label: 'TBC' },
  { path: '/ft', label: 'FT' },
  { path: '/nft', label: 'NFT' },
  { path: '/poolnft', label: 'POOLNFT' },
  { path: '/wallet-test', label: 'Turing Wallet Test' },
  { path: '/records', label: 'History Records' },
]


