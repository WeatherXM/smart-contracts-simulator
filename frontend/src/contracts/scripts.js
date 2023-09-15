import config from "../contracts/config.json";
import proofs from "../contracts/proofs.json";
import { ethers } from "ethers";
console.log('config:', config)

export async function getAllocatedRewards(cycle, address, provider){
    try {

        let proofValues = proofs[address].proof
        const rewardPool = new ethers.Contract(
            config.rewardPoolAddress,
            config.rewardPoolArtifact.abi,
            provider.getSigner(0)
        );
        proofValues = proofs[address].proof.map(val => {return val})
        const allocatedRewards = await rewardPool.getRemainingAllocatedRewards(
            address, 
            ethers.utils.parseEther(proofs[address].cumulativeAmount), 
            Number(cycle.toString()) - 1, 
            proofValues
        );
        return ethers.utils.formatUnits(allocatedRewards.toString(), 'ether') ;
    }
    catch(err) {
        console.log('err:', err)
    }
}
