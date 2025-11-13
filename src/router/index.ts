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
    path: '/crypt',
    name: 'Crypt',
    component: () => import('../views/crypt/crypt.vue'),
    meta: {
      title: 'Encrypt/Decrypt Demo'
    }
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
    path: '/records',
    name: 'HistoryRecords',
    component: () => import('../views/history/history-records.vue'),
    meta: {
      title: 'History Records'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

