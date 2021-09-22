import sgb from '@/assets/images/networks/sgb.svg';
export default {
  name: 'SGB',
  name_long: 'Songbird',
  homePage: 'https://flare.xyz/introducing-songbird/',
  blockExplorerTX: 'https://songbird-explorer.flare.network/tx/[[txHash]]/internal-transactions',
  blockExplorerAddr: 'https://songbird-explorer.flare.network/address/[[address]]/transactions',
  chainID: 19,
  tokens: [],
  contracts: [],
  icon: sgb,
  currencyName: 'SGB',
  isTestNetwork: true,
  isEthVMSupported: {
    supported: false,
    url: null,
    websocket: null
  },
  gasPriceMultiplier: 1,
  coingeckoID: 'songbird'
};
