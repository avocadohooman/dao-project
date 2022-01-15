import config from "../src/utils/config.js";
import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

const voteModule = sdk.getVoteModule(config.voteModuleAddress);
const tokenModule = sdk.getTokenModule(config.tokenModuleAddress);

(async () => {
	try {
		const amount = 420_000;
		//create proposal to mint 420000 new token to the treasury
		await voteModule.propose(
			"Should the 42DAO mint an additional " + amount + " token into the treasury?",
			[
				{
					// Our nativeToken is ETH. nativeTokenValue is the amount of ETH we want
					// to send in this proposal. In this case, we're sending 0 ETH.
					// We're just minting new tokens to the treasury. So, set to 0.				
					nativeTokenValue: 0,
					transactionData: tokenModule.contract.interface.encodeFunctionData(
					// We're doing a mint! And, we're minting to the voteModule, which is
					// acting as our treasury.
						"mint",
						[ 
							voteModule.address,
							ethers.utils.parseUnits(amount.toString(), 18),
						]
					),
					toAddress: tokenModule.address,
				},
			]
		)
		console.log("✅ Successfully created proposal to mint tokens");
	} catch (error) {
		console.log('❌ failed to create first proposal', error);
		process.exit(1);
	}
	try {
		const amount = 6_900;
		await voteModule.propose(
			"Should the 42DAO transfer " + amount + " token from the treasure to " + process.env.WALLET_ADDRESS + " for being ...ahm... the first awesome user!",
			[
				{
					nativeTokenValue: 0,
					transactionData: tokenModule.contract.interface.encodeFunctionData(
						"transfer",
						[
							process.env.WALLET_ADDRESS,
							ethers.utils.parseUnits(amount.toString(), 18),
						]
					),
					toAddress: tokenModule.address,
				}
			]
		);
		console.log(
			"✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!"
		);
	} catch (error) {
		console.log('❌ failed to create second proposal', error);
	}
})();
