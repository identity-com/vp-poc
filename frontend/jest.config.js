module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  testEnvironment: 'jest-environment-uint8array',
  transformIgnorePatterns: ['/node_modules/(?!'
  + '@solana/wallet-adapter|'
  + '@identity.com/wallet-adapter-wallets|'
  + '@identity.com/wallet-adapter-sollet|'
  + '@identity.com/wallet-adapter-base|'
  + '@project-serum/sol-wallet-adapter'
  + ')'],
};
