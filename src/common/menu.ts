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
  {
    path: '/exchange',
    label: 'Exchange Demo',
    children: [
      { path: '/exchange/crypt', label: 'Encrypt/Decrypt' },
      { path: '/exchange/asm-hex', label: 'ASM <-> HEX' },
      { path: '/exchange/calc-hex', label: 'Script Hash' },
    ],
  },
  { path: '/decode-txraws', label: 'Decode Txraws' },
  { path: '/keys-to-address', label: 'Random Key Generator' },
  { path: '/tbc', label: 'TBC' },
  { path: '/ft', label: 'FT' },
  { path: '/nft', label: 'NFT' },
  { path: '/poolnft', label: 'POOLNFT' },
  { path: '/wallet-test', label: 'Turing Wallet Test' },
  {
    path: '/history',
    label: 'History',
    children: [
      { path: '/history/records', label: 'Transaction History' },
      { path: '/history/mint-history', label: 'Mint History' },
    ],
  },
]


