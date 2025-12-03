## FT Mint 铸币流程说明（基于 `FT.MintFT`）

下面的流程图基于 `node_modules/tbc-contract/lib/contract/ft.js` 中的 `MintFT` 方法，展示一次 FT 铸币从输入参数到生成两笔交易 `txSource` 和 `txMint` 的完整过程。

```mermaid
flowchart TD
  A[调用 MintFT(privateKey_from, address_to, utxo)] --> B[读取实例属性<br/>name/symbol/decimal/totalSupply]
  B --> C[按 decimal 换算 totalSupply<br/>为最小单位 BigInt]
  C --> D[使用 BufferWriter 写入<br/>6 个 64bit 金额槽位<br/>第 1 个为总量 其余为 0]
  D --> E[生成 tapeAmount(hex)]
  E --> F[将 name/symbol/decimal<br/>转为十六进制<br/>nameHex/symbolHex/decimalHex]
  F --> G[构建 tapeScript:<br/>OP_FALSE OP_RETURN<br/>+tapeAmount +decimalHex<br/>+nameHex +symbolHex +4654617065]
  G --> H[计算 tapeSize]
  H --> I[从 privateKey 派生地址<br/>得到 publicKeyHash]
  I --> J[flagHex = 'for ft mint' 的 hex]

  J --> K[构建 txSource 交易]
  K --> K1[输入: from(utxo)]
  K1 --> K2[输出0: P2PKH + OP_RETURN flagHex<br/>satoshis=9900]
  K2 --> K3[输出1: tapeScript<br/>satoshis=0]
  K3 --> K4[设置找零地址<br/>privateKey.toAddress()]
  K4 --> K5[估算交易大小 txSize]
  K5 --> K6{txSize < 1000 ?}
  K6 -->|是| K7[设置固定手续费 fee(80)]
  K6 -->|否| K8[按字节设置 feePerKb(80)]
  K7 --> K9[签名 txSource 并 seal]
  K8 --> K9[签名 txSource 并 seal]
  K9 --> K10[序列化 txSourceRaw]

  K10 --> L[调用 getFTmintCode(txSource.hash,<br/>vout=0, address_to, tapeSize)]
  L --> L1[生成 codeScript]
  L1 --> L2[更新实例:<br/>this.codeScript/this.tapeScript]

  L2 --> M[构建最终铸币交易 tx]
  M --> M1[输入0: addInputFromPrevTx(txSource, 0)]
  M1 --> M2[输出0: codeScript<br/>satoshis=500]
  M2 --> M3[输出1: tapeScript<br/>satoshis=0]
  M3 --> M4[feePerKb(80)]
  M4 --> M5[设置找零地址<br/>privateKey.toAddress()]
  M5 --> M6[为输入0设置解锁脚本:<br/>(sig + publicKey)]
  M6 --> M7[签名 tx 并 seal]
  M7 --> M8[序列化 txMintRaw<br/>并设置 this.contractTxid = tx.hash]

  M8 --> N[返回数组 txraw:<br/>[txSourceRaw, txMintRaw]]
```

### 步骤要点概括

- **金额编码**：使用 6 个 64bit 槽位存储 FT 余额，第一个为实际总发行量，其余填 0，便于后续转账/拆分时复用同一编码结构。
- **tapeScript**：通过 `OP_FALSE OP_RETURN` 搭配 `金额 + decimal + name + symbol + 4654617065`，把代币元数据写入不可花费输出中。
- **两阶段交易**：
  - `txSource`：负责“记录元数据 + 标记为 FT 铸造来源”，本质是一个携带元数据的普通链上交易。
  - `txMint`：引用 `txSource` 的输出 0，正式生成携带 `codeScript + tapeScript` 的合约 UTXO，即真正代表 FT 合约的交易。
- **返回结果**：`MintFT` 返回 `[txSourceRaw, txMintRaw]`，通常需要依次广播这两笔交易完成整套铸币流程。

