import config from "../src/utils/config.js";
import sdk from "./1-initialize-sdk.js";
import { ethers } from 'ethers';

const budleDropModule = sdk.getBundleDropModule(config.bundleDropAddress);
const tokenModule = sdk.getTokenModule(config.tokenModuleAddress);

(async () => {
	try {
		// Grab all the address of people who have claimed a membership NFT, with a 
		// tokenId of 0
		const walletAddresses = await budleDropModule.getAllClaimerAddresses("0");
		if (walletAddresses.length === 0) {
			console.log("No members yet! Get some :)");
			process.exit(0);
		}

		// loop through all members and drop token
		const airdropTargets = walletAddresses.map((address) => {
			// pick a randome number between 1000 and 10000
			const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
			console.log("✅ Going to airdrop", randomAmount, "tokens to", address);

			const airdropTarget = {
				address,
				amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
			}
			return airdropTarget;
		});
		console.log("🌈 Starting airdrop...");
		await tokenModule.transferBatch(airdropTargets);
		console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
	} catch (error) {
		console.error("Failed to airdrop tokens", error);
	}
})()