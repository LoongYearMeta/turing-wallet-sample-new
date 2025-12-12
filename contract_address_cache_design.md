# 合约地址缓存组件设计方案

## 一、需要输入合约地址的交易类型分析

### 交易类型清单

| 交易类型 | 字段名 | 字段类型 | 文件路径 | 是否必填 |
|---------|--------|---------|---------|---------|
| **NFT_TRANSFER** | `nft_contract_address` | NFT合约地址 | `src/views/NFT/components/NFT_TRANSFER.vue` | ✅ 必填 |
| **FT_TRANSFER** | `ft_contract_address` | FT合约地址 | `src/views/FT/components/TRANSFER.vue` | ✅ 必填 |
| **NFT_CREATE** | `collection_id` | 合集ID | `src/views/NFT/components/CREATE_NFT.vue` | ✅ 必填 |
| **POOLNFT_INIT** | `nft_contract_address` | PoolNFT合约地址 | `src/views/POOLNFT/components/INIT.vue` | ✅ 必填 |
| **POOLNFT_MINT** | `ft_contract_address` | FT合约地址 | `src/views/POOLNFT/components/MINT.vue` | ✅ 必填 |
| **POOLNFT_LP_INCREASE** | `nft_contract_address` | PoolNFT合约地址 | `src/views/POOLNFT/components/INCREASE.vue` | ✅ 必填 |
| **POOLNFT_LP_CONSUME** | `nft_contract_address` | PoolNFT合约地址 | `src/views/POOLNFT/components/CONSUME.vue` | ✅ 必填 |
| **POOLNFT_LP_BURN** | `nft_contract_address` | PoolNFT合约地址 | `src/views/POOLNFT/components/BURN.vue` | ✅ 必填 |
| **POOLNFT_SWAP_TO_TOKEN** | `nft_contract_address` | PoolNFT合约地址 | `src/views/POOLNFT/components/TO_TOKEN.vue` | ✅ 必填 |
| **POOLNFT_SWAP_TO_TBC** | `nft_contract_address` | PoolNFT合约地址 | `src/views/POOLNFT/components/TO_TBC.vue` | ✅ 必填 |
| **POOLNFT_MERGE** | `nft_contract_address` | PoolNFT合约地址 | `src/views/POOLNFT/components/MERGE-POOLNFT.vue` | ✅ 必填 |
| **MERGE-FTLP** | `nft_contract_address` | PoolNFT合约地址 | `src/views/POOLNFT/components/MERGE-FTLP.vue` | ✅ 必填 |

### 地址类型分类

1. **NFT合约地址** (`nft_contract_address`)
   - 来源：NFT_CREATE 的响应（返回 NFT 合约地址）
   - 用途：NFT_TRANSFER, POOLNFT_INIT, POOLNFT_LP_INCREASE, POOLNFT_LP_CONSUME, POOLNFT_LP_BURN, POOLNFT_SWAP_TO_TOKEN, POOLNFT_SWAP_TO_TBC, POOLNFT_MERGE, MERGE-FTLP

2. **FT合约地址** (`ft_contract_address`)
   - 来源：FT_MINT 的响应（返回 FT 合约地址）
   - 用途：FT_TRANSFER, POOLNFT_MINT

3. **合集ID** (`collection_id`)
   - 来源：COLLECTION_CREATE 的响应（返回合集ID）
   - 用途：NFT_CREATE

---

## 二、地址来源分析

### 从历史记录中提取地址

#### 1. 从 transactionHistory 提取

**NFT合约地址**：
- 来源交易：`NFT_CREATE`
- 提取位置：`response` 中的合约地址字段（需要确认字段名，可能是 `contractAddress`, `nftContractAddress`, `contract_address` 等）

**FT合约地址**：
- 来源交易：`FT_MINT`
- 提取位置：`response` 中的合约地址字段

**合集ID**：
- 来源交易：`COLLECTION_CREATE`
- 提取位置：`response` 中的合集ID字段（可能是 `collectionId`, `collection_id` 等）

#### 2. 从 mintHistory 提取

**NFT合约地址**：
- 来源交易：`NFT_CREATE`
- 提取位置：`response` 中的合约地址字段

**FT合约地址**：
- 来源交易：`FT_MINT`, `POOLNFT_MINT`
- 提取位置：`response` 中的合约地址字段

**合集ID**：
- 来源交易：`COLLECTION_CREATE`
- 提取位置：`response` 中的合集ID字段

---

## 三、地址缓存工具设计

### 3.1 数据结构

```typescript
// src/utils/contractAddressCache.ts

export interface ContractAddressItem {
  id: string;                    // 唯一ID
  address: string;               // 合约地址
  type: 'nft' | 'ft' | 'collection';  // 地址类型
  source: string;                // 来源交易类型（如 'NFT_CREATE', 'FT_MINT'）
  txid: string;                  // 关联的交易ID
  label?: string;                // 用户自定义标签（可选）
  timestamp: number;             // 添加时间戳
  lastUsed?: number;             // 最后使用时间戳
}

export type AddressType = 'nft' | 'ft' | 'collection';
```

### 3.2 存储结构

```typescript
// localStorage 存储键
const ADDRESS_CACHE_STORAGE_KEY = 'contract_address_cache';
const MAX_CACHE_COUNT = 50;  // 最多缓存50个地址

// 存储格式
{
  nft: ContractAddressItem[],      // NFT合约地址列表
  ft: ContractAddressItem[],       // FT合约地址列表
  collection: ContractAddressItem[] // 合集ID列表
}
```

### 3.3 核心功能

```typescript
// 1. 添加地址到缓存
export function addContractAddress(
  address: string,
  type: AddressType,
  source: string,
  txid: string,
  label?: string
): void

// 2. 获取指定类型的地址列表
export function getContractAddresses(type: AddressType): ContractAddressItem[]

// 3. 获取所有地址（按类型分组）
export function getAllContractAddresses(): {
  nft: ContractAddressItem[];
  ft: ContractAddressItem[];
  collection: ContractAddressItem[];
}

// 4. 更新地址使用时间
export function updateAddressLastUsed(id: string): void

// 5. 删除地址
export function removeContractAddress(id: string): void

// 6. 清除指定类型的所有地址
export function clearContractAddresses(type: AddressType): void

// 7. 从历史记录中自动提取并缓存地址
export function extractAndCacheAddressesFromHistory(): void
```

---

## 四、地址选择组件设计

### 4.1 组件结构

```vue
<!-- src/components/ContractAddressSelector.vue -->
<template>
  <div class="contract-address-selector">
    <!-- 输入框 + 下拉按钮 -->
    <div class="selector-input-wrapper">
      <MyTextarea
        v-model="inputValue"
        :placeholder="placeholder"
        :readonly="readonly"
        :copyable="true"
        :deletable="true"
        class="selector-input"
      />
      <button
        @click="toggleDropdown"
        class="selector-dropdown-btn"
        :class="{ active: isDropdownOpen }"
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>

    <!-- 下拉选择框 -->
    <div v-if="isDropdownOpen" class="selector-dropdown">
      <!-- 搜索框 -->
      <div class="dropdown-search">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="Search address..."
          class="search-input"
        />
      </div>

      <!-- 地址列表 -->
      <div class="dropdown-list">
        <div
          v-for="item in filteredAddressList"
          :key="item.id"
          @click="selectAddress(item)"
          class="dropdown-item"
        >
          <div class="item-address">{{ item.address }}</div>
          <div class="item-meta">
            <span class="item-source">{{ item.source }}</span>
            <span class="item-time">{{ formatTime(item.timestamp) }}</span>
          </div>
        </div>
        <div v-if="filteredAddressList.length === 0" class="dropdown-empty">
          No addresses found
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="dropdown-actions">
        <button @click="clearAll" class="action-btn clear-btn">Clear All</button>
      </div>
    </div>
  </div>
</template>
```

### 4.2 组件 Props

```typescript
interface Props {
  modelValue: string;              // v-model 绑定值
  addressType: AddressType;        // 地址类型：'nft' | 'ft' | 'collection'
  placeholder?: string;             // 输入框占位符
  readonly?: boolean;               // 是否只读
}
```

### 4.3 组件功能

1. **地址选择**：点击下拉项选择地址
2. **搜索过滤**：根据关键词搜索地址
3. **自动填充**：从缓存中加载地址列表
4. **使用记录**：选择地址后更新最后使用时间
5. **手动输入**：支持手动输入地址（不限制只能从缓存选择）

---

## 五、自动提取地址逻辑

### 5.1 从响应中提取地址

```typescript
// src/utils/contractAddressCache.ts

/**
 * 从交易响应中提取合约地址
 */
function extractAddressFromResponse(
  method: string,
  response: any
): { address: string; type: AddressType } | null {
  if (!response) return null;

  // NFT_CREATE 返回 NFT 合约地址
  if (method === 'NFT_CREATE') {
    const address = response.contractAddress || 
                   response.nftContractAddress || 
                   response.contract_address ||
                   response.address;
    if (address) {
      return { address, type: 'nft' };
    }
  }

  // FT_MINT 返回 FT 合约地址
  if (method === 'FT_MINT' || method === 'POOLNFT_MINT') {
    const address = response.contractAddress || 
                   response.ftContractAddress || 
                   response.contract_address ||
                   response.address;
    if (address) {
      return { address, type: 'ft' };
    }
  }

  // COLLECTION_CREATE 返回合集ID
  if (method === 'COLLECTION_CREATE') {
    const address = response.collectionId || 
                   response.collection_id || 
                   response.id;
    if (address) {
      return { address, type: 'collection' };
    }
  }

  return null;
}
```

### 5.2 从历史记录中批量提取

```typescript
/**
 * 从所有历史记录中提取并缓存地址
 */
export function extractAndCacheAddressesFromHistory(): void {
  // 1. 从 transactionHistory 提取
  const walletStore = useWalletStore();
  const { walletInfo } = storeToRefs(walletStore);
  
  if (walletInfo.value.curAddress) {
    const transactionHistory = getTransactionHistory(walletInfo.value.curAddress);
    transactionHistory.forEach(item => {
      const extracted = extractAddressFromResponse(item.method, item.response);
      if (extracted) {
        addContractAddress(
          extracted.address,
          extracted.type,
          item.method,
          item.txid
        );
      }
    });
  }

  // 2. 从 mintHistory 提取
  const mintHistory = getMintHistory();
  mintHistory.forEach(item => {
    const extracted = extractAddressFromResponse(item.type, item.response);
    if (extracted) {
      addContractAddress(
        extracted.address,
        extracted.type,
        item.type,
        item.txid
      );
    }
  });
}
```

---

## 六、集成方案

### 6.1 在交易成功后自动缓存地址

```typescript
// 在 NFT_CREATE 成功后
const response = await sendTransaction(params);
const txid = extractTxid(response);

// 提取并缓存 NFT 合约地址
const extracted = extractAddressFromResponse('NFT_CREATE', response);
if (extracted) {
  addContractAddress(
    extracted.address,
    extracted.type,
    'NFT_CREATE',
    txid
  );
}
```

### 6.2 在表单中使用地址选择组件

```vue
<!-- NFT_TRANSFER.vue -->
<template>
  <div class="form-item">
    <label>NFT Contract Address <span class="required">*</span></label>
    <ContractAddressSelector
      v-model="nftTransferForm.nft_contract_address"
      address-type="nft"
      placeholder="Please input NFT contract address (from NFT_CREATE result)"
    />
    <div v-if="errors.nft_contract_address" class="form-item-error">
      {{ errors.nft_contract_address }}
    </div>
  </div>
</template>
```

---

## 七、实现步骤

### 阶段1：创建地址缓存工具
1. 创建 `src/utils/contractAddressCache.ts`
2. 实现地址缓存的核心功能
3. 实现从历史记录中提取地址的逻辑

### 阶段2：创建地址选择组件
1. 创建 `src/components/ContractAddressSelector.vue`
2. 实现下拉选择功能
3. 实现搜索过滤功能
4. 实现样式和交互

### 阶段3：集成到交易表单
1. 在 NFT_TRANSFER 中集成
2. 在 FT_TRANSFER 中集成
3. 在 NFT_CREATE 中集成（collection_id）
4. 在所有 POOLNFT 相关表单中集成

### 阶段4：自动提取和缓存
1. 在交易成功后自动提取地址
2. 在页面加载时从历史记录中提取地址
3. 添加手动刷新缓存的功能

---

## 八、用户体验优化

### 8.1 功能特性

1. **智能排序**：
   - 按最后使用时间排序（最近使用的在前）
   - 按添加时间排序（最新的在前）

2. **地址标签**：
   - 支持用户自定义标签
   - 显示来源交易类型和时间

3. **快速搜索**：
   - 支持按地址、标签、来源搜索
   - 实时过滤结果

4. **自动填充**：
   - 页面加载时自动从历史记录提取地址
   - 交易成功后自动添加到缓存

5. **地址验证**：
   - 验证地址格式
   - 显示地址类型提示

### 8.2 UI/UX 设计

1. **下拉选择框**：
   - 输入框右侧显示下拉按钮
   - 点击按钮展开/收起下拉列表
   - 支持键盘导航（上下箭头选择，Enter确认）

2. **地址列表**：
   - 显示地址（完整或截断）
   - 显示来源交易类型
   - 显示添加时间
   - 悬停高亮效果

3. **搜索功能**：
   - 下拉框顶部显示搜索框
   - 实时过滤地址列表
   - 支持清空搜索

4. **空状态**：
   - 无地址时显示提示信息
   - 提供"从历史记录提取"按钮

---

## 九、技术实现细节

### 9.1 地址去重

```typescript
// 添加地址时检查是否已存在
function addContractAddress(...) {
  const existing = getContractAddresses(type);
  const isDuplicate = existing.some(item => item.address === address);
  
  if (isDuplicate) {
    // 更新最后使用时间
    updateAddressLastUsed(existing.find(item => item.address === address)!.id);
    return;
  }
  
  // 添加新地址
  // ...
}
```

### 9.2 缓存限制

```typescript
// 限制每种类型的地址数量
const MAX_ADDRESSES_PER_TYPE = 20;

function addContractAddress(...) {
  const addresses = getContractAddresses(type);
  
  if (addresses.length >= MAX_ADDRESSES_PER_TYPE) {
    // 删除最久未使用的地址
    const sorted = addresses.sort((a, b) => 
      (a.lastUsed || 0) - (b.lastUsed || 0)
    );
    removeContractAddress(sorted[0].id);
  }
  
  // 添加新地址
  // ...
}
```

### 9.3 地址格式验证

```typescript
// 验证地址格式
function isValidAddress(address: string, type: AddressType): boolean {
  if (!address || !address.trim()) return false;
  
  // 根据类型验证格式
  // NFT/FT 合约地址可能是特定格式
  // 合集ID可能是特定格式
  
  return true; // 简化实现
}
```

---

## 十、总结

### 需要输入合约地址的交易类型（12个）

1. NFT_TRANSFER - nft_contract_address
2. FT_TRANSFER - ft_contract_address
3. NFT_CREATE - collection_id
4. POOLNFT_INIT - nft_contract_address
5. POOLNFT_MINT - ft_contract_address
6. POOLNFT_LP_INCREASE - nft_contract_address
7. POOLNFT_LP_CONSUME - nft_contract_address
8. POOLNFT_LP_BURN - nft_contract_address
9. POOLNFT_SWAP_TO_TOKEN - nft_contract_address
10. POOLNFT_SWAP_TO_TBC - nft_contract_address
11. POOLNFT_MERGE - nft_contract_address
12. MERGE-FTLP - nft_contract_address

### 核心设计

1. **地址缓存工具**：管理地址的存储、提取、查询
2. **地址选择组件**：提供下拉选择、搜索、自动填充功能
3. **自动提取机制**：从历史记录中自动提取地址并缓存
4. **用户体验优化**：智能排序、标签、搜索、验证

### 实现优先级

1. **高优先级**：NFT_TRANSFER, FT_TRANSFER, NFT_CREATE（使用频率高）
2. **中优先级**：POOLNFT_INIT, POOLNFT_MINT（常用操作）
3. **低优先级**：其他 POOLNFT 操作（使用频率较低）

