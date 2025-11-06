import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: () => import('../views/Wallet.vue'),
    meta: {
      title: '钱包'
    }
  },
  {
    path: '/wallet/test',
    name: 'WalletTest',
    component: () => import('../views/WalletTest.vue'),
    meta: {
      title: '钱包测试'
    }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('../views/Transactions.vue'),
    meta: {
      title: '交易记录'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: {
      title: '设置'
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
    component: () => import('../views/MessageSigning.vue'),
    meta: {
      title: 'Message Signing'
    }
  },
  {
    path: '/signing-demo/sign-transaction',
    name: 'SignTransaction',
    component: () => import('../views/SignTransaction.vue'),
    meta: {
      title: 'Sign Transaction'
    }
  },
  {
    path: '/crypt',
    name: 'Crypt',
    component: () => import('../views/Crypt.vue'),
    meta: {
      title: 'Encrypt/Decrypt Demo'
    }
  },
  {
    path: '/decode-txraws',
    name: 'DecodeTxraws',
    component: () => import('../views/DecodeTxraws.vue'),
    meta: {
      title: 'Decode Txraws'
    }
  },
  {
    path: '/keys-to-address',
    name: 'KeysToAddress',
    component: () => import('../views/KeysToAddress.vue'),
    meta: {
      title: 'Keys to Address'
    }
  },
  {
    path: '/tbc',
    name: 'TBC',
    component: () => import('../views/TBC.vue'),
    meta: {
      title: 'TBC'
    }
  },
  {
    path: '/ft',
    name: 'FT',
    component: () => import('../views/FT.vue'),
    meta: {
      title: 'FT'
    }
  },
  {
    path: '/nft',
    name: 'NFT',
    component: () => import('../views/NFT.vue'),
    meta: {
      title: 'NFT'
    }
  },
  {
    path: '/poolnft',
    name: 'POOLNFT',
    component: () => import('../views/POOLNFT.vue'),
    meta: {
      title: 'POOLNFT'
    }
  },
  {
    path: '/wallet-test',
    name: 'WalletTest',
    component: () => import('../views/WalletTestPage.vue'),
    meta: {
      title: 'Turing Wallet Test'
    }
  },
  {
    path: '/records',
    name: 'HistoryRecords',
    component: () => import('../views/HistoryRecords.vue'),
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

