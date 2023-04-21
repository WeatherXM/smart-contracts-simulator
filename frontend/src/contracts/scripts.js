import config from "../contracts/config.json";
import proofs from "../contracts/proofs.json";
import { ethers } from "ethers";

export async function getAllocatedRewards(cycle, address, provider){
    let proofValues = []
    const rewardPool = new ethers.Contract(
        config.rewardPoolAddress,
        config.rewardPoolArtifact.abi,
        provider.getSigner(0)
    );
    proofValues = proofs[address].proof.map(val => {return val})
    console.log(proofs[address].cumulativeAmount)
    const allocatedRewards = await rewardPool.getRemainingAllocatedRewards(
        address, 
        ethers.utils.parseEther(proofs[address].cumulativeAmount), 
        cycle, 
        proofValues
    );
    return ethers.utils.formatUnits(allocatedRewards.toString(), 'ether') ;
}
