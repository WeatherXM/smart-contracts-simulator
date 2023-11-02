<script lang="js">
  import { fetchBalance, getAccount, readContract, writeContract } from '@wagmi/core'
  import Web3 from 'web3'
  import config from '../contracts/config.json'
  import proofs from '../contracts/proofs.json'
  import tree from '../contracts/tree.json'

  export default {
    data() {
      return {
        balance: 0,
        claimed: 0
      };
    },
    methods: {
      updateData: async function (address) {
        const account = await getAccount()
        const balance = await fetchBalance({
          address: account.address,
          token: config.tokenAddress,
          chainId: 421613
        })

        const claimed = await readContract({
          address: config.rewardPoolAddress,
          abi: config.rewardPoolArtifact.abi,
          functionName: 'claims',
          args: [account.address]
        })

        this.balance = balance.formatted
        this.claimed = Web3.utils.fromWei(claimed, 'ether')
      },
      claim: async function () {
        const account = await getAccount()

        console.log('file: HelloWorld.vue:40 -> account:', account)

        const txRes = await writeContract({
          address: config.rewardPoolAddress,
          abi: config.rewardPoolArtifact.abi,
          functionName: 'claim',
          args: [
            Web3.utils.toWei('1', 'ether'), // amount to claim
            Web3.utils.toWei(proofs[account.address].cumulativeAmount, 'ether'), // total allocated
            '0', // cycle
            proofs[account.address].proof
          ]
        })

        console.log('file: HelloWorld.vue:53 -> txRes:', txRes)
      }
    },
    created() {
      this.updateData()
    },
  }
</script>

<template>
  <div class="greetings" :key="balance">
    <w3m-button />
    Balance: {{balance}}
    <br/>
    Claimed: {{claimed}}
    <br/>
    <button @click="claim">Claim 1</button>
  </div>
</template>




<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
