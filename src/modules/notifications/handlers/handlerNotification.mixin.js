/**
 * Module Notification Apollo Mixin
 */
import {
  getEthTransfersV2,
  getTransactionsByHashes,
  getTransactionByHash,
  pendingTransaction,
  transactionEvent
} from '@/apollo/queries/notifications/notification.graphql';
import { Toast, ERROR } from '@/modules/toast/handler/handlerToast';
import { errorMsgs } from '@/apollo/configs/configErrorMsgs';

/**
 * Constants
 */
const MAX_ITEMS = 20;

export default {
  name: 'HandlerNotification',
  data() {
    return {
      getEthTransfersV2: '',
      getTransactionsByHashes: '',
      newPendingTransaction: '',
      getTransactionByHash: '',
      txHash: '',
      initialLoad: true,
      txHashes: [],
      ethTransfers: []
    };
  },
  apollo: {
    /**
     * Apollo query to get the last 20 eth transfers by owner
     */
    getEthTransfersV2: {
      query: getEthTransfersV2,
      variables() {
        return {
          owner: this.address,
          limit: MAX_ITEMS
        };
      },
      skip() {
        return !this.isEthNetwork || !this.address || this.address === null;
      },
      result({ data }) {
        if (data.getEthTransfersV2.transfers) {
          data.getEthTransfersV2.transfers.forEach(transfer => {
            const hash = transfer.transfer.transactionHash;
            !this.txHashes.includes(hash) ? this.txHashes.push(hash) : null;
          });
        }
      },
      error(error) {
        Toast(error.message, {}, ERROR);
      }
    },
    /**
     * Apollo query to fetch transaction details by hashes
     * Only returns 10 at a time
     */
    getTransactionsByHashes: {
      query: getTransactionsByHashes,
      variables() {
        return {
          hashes: this.txHashes
        };
      },
      fetchPolicy: 'cache-and-network',
      skip() {
        return this.txHashes.length === 0;
      },
      result({ data }) {
        if (data && data.getTransactionsByHashes) {
          let ethTransfers = [];
          if (this.initialLoad) {
            ethTransfers = data.getTransactionsByHashes;
            this.txHashes =
              this.txHashes.length > 10 ? this.txHashes.slice(10, 20) : [];
            this.initialLoad = false;
          } else {
            ethTransfers = this.ethTransfers.concat(
              data.getTransactionsByHashes
            );
            this.txHashes = [];
          }
          this.setFetchedTime();
          this.ethTransfers = ethTransfers;
        }
      },
      error(error) {
        Toast(error.message, {}, ERROR);
      }
    },
    /**
     * Apollo query to fetch transaction details by hash
     * Only fetches one at a time
     */
    getTransactionByHash: {
      query: getTransactionByHash,
      variables() {
        return {
          hash: this.txHash
        };
      },
      skip() {
        return !this.txHash || this.txHash === '' || this.txHash === null;
      },
      update: data => data.getTransactionByHash,
      result({ data }) {
        if (data) {
          if (data.to === this.address) {
            const getTransactionByHash = data.getTransactionByHash;
            const copyArray = this.ethTransfers;
            const foundIdx = copyArray.findIndex(item => {
              if (
                getTransactionByHash.transactionHash === item.transactionHash
              ) {
                return item;
              }
            });
            foundIdx >= 0
              ? copyArray.splice(foundIdx, 0, getTransactionByHash)
              : copyArray.push(getTransactionByHash);
            this.ethTransfers = copyArray;
          }
        }
      },
      error(error) {
        if (error.message.includes(errorMsgs.cannotReturnNull)) {
          return;
        }
        Toast(error.message, {}, ERROR);
      }
    },
    $subscribe: {
      /**
       * Apollo subscription for pending txs
       */
      newPendingTransaction: {
        query: pendingTransaction,
        variables() {
          return {
            owner: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"
          };
        },
        result({ data }) {
          console.error('in HERE!', data)
          // if (data && data.pendingTransaction) {
          //   const pendingTx = data.pendingTransaction;
          //   if (pendingTx.to?.toLowerCase() === "0x7a250d5630b4cf539739df2c5dacb4c659f2488d") {
          //     this.txHash = pendingTx.transactionHash;
          //   }
          // }
        },
        error(error) {
          console.error('error', error)
          // Toast(error.message, {}, ERROR);
        }
      },
      /**
       * Apollo subscription for transactions
       */
      subscribeToTxHash: {
        query: transactionEvent,
        variables() {
          return {
            hash: this.txHash
          };
        },
        result() {
          this.$apollo.queries.getTransactionByHash.refetch();
        },
        error(error) {
          Toast(error.message, {}, ERROR);
        }
      }
    }
  }
};
