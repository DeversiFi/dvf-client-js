const nock = require('nock')

module.exports = () => {
  const getConfResponse = {
    starkKeyHex: '0x011869c13b32ab9b7ec84e2b31c1de58baaaa6bbb2443a33bbad8df739a6e957',
    DVF: {
      exchangeSymbols: ['ETH:USDT', 'ZRX:USDT', 'ZRX:ETH'],
      exchangeAddress: '0xBd25cD867C304F079E696CBE44D958f3d3B683ba',
      starkExContractAddress: '0xA9F9cC1189b9d6051b26467b29629787C671905d',
      tempStarkVaultId: 1,
      defaultFeeRate: 0.0025
    },
    tokenRegistry: {
      ETH: {
        decimals: 18,
        quantization: 10000000000,
        minOrderSize: 0.05,
        settleSpread: 0,
        starkTokenId:
          '0xb333e3142fe16b78628f19bb15afddaef437e72d6d7f5c6c20c6801a27fba6'
      },
      USDT: {
        decimals: 6,
        quantization: 1,
        minOrderSize: 10,
        settleSpread: 0,
        starkTokenId:
          '0x180bef8ae3462e919489763b84dc1dc700c45a249dec4d1136814a639f2dd7b',
        tokenAddress: '0x4c5f66596197a86fb30a2435e2ef4ddcb39342c9'
      },
      ZRX: {
        decimals: 18,
        quantization: 10000000000,
        minOrderSize: 20,
        settleSpread: 0,
        starkTokenId:
          '0x3901ee6a6c5ac0f6e284f4273b961b7e9f29d25367d31d90b75820473a202f7',
        tokenAddress: '0xcd077abedd831a3443ffbe24fb76661bbb17eb69'
      },
      BTC: {
        decimals: 18,
        quantization: 10000000000,
        minOrderSize: 0.0004,
        settleSpread: 0,
        starkTokenId:
          '0x21ef21d6b234cd669edd702dd3d1d017be888337010b950ae3679eb4194b4bc',
        tokenAddress: '0x40d8978500bf68324a51533cd6a21e3e59be324a'
      }
    }
  }

  nock('https://api.stg.deversifi.com')
    .post('/v1/trading/r/getConf', {})
    .reply(200, getConfResponse)

  const mockGasResponse = {
    cheap: 700000000,
    average: 600000000,
    fast: 500000000
  }

  nock('https://api.stg.deversifi.com')
    .post('/v1/trading/r/getGasPrice', body => {
      return true
    })
    .reply(200, mockGasResponse)

  const getUserConfResponse = {
    DVF: {
      exchangeSymbols: ['ETH:USDT', 'ZRX:USDT', 'ZRX:ETH'],
      exchangeAddress: '0xBd25cD867C304F079E696CBE44D958f3d3B683ba',
      starkExContractAddress: '0xA9F9cC1189b9d6051b26467b29629787C671905d',
      tempStarkVaultId: 1,
      defaultFeeRate: 0.0025
    },
    tokenRegistry: {
      ETH: {
        decimals: 18,
        quantization: 10000000000,
        minOrderSize: 0.1,
        starkTokenId:
          '0xb333e3142fe16b78628f19bb15afddaef437e72d6d7f5c6c20c6801a27fba6',
        starkVaultId: 1000001
      },
      USDT: {
        decimals: 6,
        quantization: 1,
        minOrderSize: 25,
        settleSpread: 0,
        starkTokenId:
          '0x180bef8ae3462e919489763b84dc1dc700c45a249dec4d1136814a639f2dd7b',
        tokenAddress: '0x4c5f66596197a86fb30a2435e2ef4ddcb39342c9',
        starkVaultId: 1000002
      },
      ZRX: {
        decimals: 18,
        quantization: 10000000000,
        minOrderSize: 40,
        starkTokenId:
          '0x3901ee6a6c5ac0f6e284f4273b961b7e9f29d25367d31d90b75820473a202f7',
        tokenAddress: '0xcd077abedd831a3443ffbe24fb76661bbb17eb69',
        starkVaultId: 1000003
      },
      BTC: {
        decimals: 18,
        quantization: 10000000000,
        minOrderSize: 0.0001,
        starkTokenId:
          '0x21ef21d6b234cd669edd702dd3d1d017be888337010b950ae3679eb4194b4bc',
        tokenAddress: '0x40d8978500bf68324a51533cd6a21e3e59be324a',
        starkVaultId: 1000004
      }
    },
    isRegistered: true,
    ethAddress: '0xf858c2f2ac6b96df8c801bce90a3124a52d1915a'
  }

  nock('https://api.stg.deversifi.com')
    .post('/v1/trading/r/getUserConf', body => {
      return true
    })
    .reply(200, getUserConfResponse)
}
