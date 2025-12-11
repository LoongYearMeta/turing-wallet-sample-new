import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/home/home.vue'),
    meta: {
      title: 'Home'
    }
  },
  {
    path: '/signing-demo',
    name: 'SigningDemo',
    redirect: '/signing-demo/message-signing',
    meta: {
      title: 'Signing Demo'
    }
  },
  {
    path: '/signing-demo/message-signing',
    name: 'MessageSigning',
    component: () => import('../views/Signing/msg-signing.vue'),
    meta: {
      title: 'Message Signing'
    }
  },
  {
    path: '/signing-demo/sign-transaction',
    name: 'SignTransaction',
    component: () => import('../views/Signing/sign-transaction.vue'),
    meta: {
      title: 'Sign Transaction'
    }
  },
  {
    path: '/exchange',
    name: 'ExchangeDemo',
    redirect: '/exchange/crypt',
    meta: {
      title: 'Exchange Demo'
    }
  },
  {
    path: '/exchange/crypt',
    name: 'ExchangeEncryptDecrypt',
    component: () => import('../views/exchange/crypt.vue'),
    meta: {
      title: 'Encrypt/Decrypt'
    }
  },
  {
    path: '/exchange/asm-hex',
    name: 'ExchangeAsmHex',
    component: () => import('../views/exchange/asm-hex.vue'),
    meta: {
      title: 'ASM <-> HEX'
    }
  },
  {
    path: '/exchange/calc-hex',
    name: 'ExchangeCalcHex',
    component: () => import('../views/exchange/calcHex.vue'),
    meta: {
      title: 'Script Hash'
    }
  },
  {
    path: '/crypt',
    redirect: '/exchange/crypt'
  },
  {
    path: '/decode-txraws',
    name: 'DecodeTxraws',
    component: () => import('../views/decode-txraws/decode-txraws.vue'),
    meta: {
      title: 'Decode Txraws'
    }
  },
  {
    path: '/keys-to-address',
    name: 'KeysToAddress',
    component: () => import('../views/Keys/keys-to-address.vue'),
    meta: {
      title: 'Random Key Generator'
    }
  },
  {
    path: '/tbc',
    name: 'TBC',
    component: () => import('../views/TBC/TBC_P2PKH.vue'),
    meta: {
      title: 'TBC'
    }
  },
  {
    path: '/ft',
    name: 'FT',
    component: () => import('../views/FT/FT.vue'),
    meta: {
      title: 'FT'
    }
  },
  {
    path: '/nft',
    name: 'NFT',
    component: () => import('../views/NFT/NFT.vue'),
    meta: {
      title: 'NFT'
    }
  },
  {
    path: '/poolnft',
    name: 'POOLNFT',
    component: () => import('../views/POOLNFT/POOLNFT.vue'),
    meta: {
      title: 'POOLNFT'
    }
  },
  {
    path: '/wallet-test',
    name: 'WalletTest',
    component: () => import('../views/Wallet/wallet-test.vue'),
    meta: {
      title: 'Turing Wallet Test'
    }
  },
  {
    path: '/mint-history',
    name: 'MintHistory',
    component: () => import('../views/history/mint-history/mint-history.vue'),
    meta: {
      title: 'Mint History'
    }
  },
  {
    path: '/history',
    name: 'History',
    redirect: '/history/records',
    meta: {
      title: 'History'
    }
  },
  {
    path: '/history/records',
    name: 'HistoryRecords',
    component: () => import('../views/history/history-records/history-records.vue'),
    meta: {
      title: 'History Records'
    }
  },
  {
    path: '/history/mint-history',
    name: 'HistoryMintHistory',
    component: () => import('../views/history/mint-history/mint-history.vue'),
    meta: {
      title: 'Mint History'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

