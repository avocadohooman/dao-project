import config from "../src/utils/config.js";
import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

const voteModule = sdk.getVoteModule(config.voteModuleAddress);
const tokenModule = sdk.getTokenModule(config.tokenModuleAddress);

(async () => {
	try {
		// we give our treasury the power to mint additional token if needed
		await tokenModule.grantRole('minter', voteModule.address);
		console.log(
			"✅ Successfully gave vote module permissions to act on token module"
		);
	} catch (error) {
		console.error(
			"failed to grant vote module permissions on token module",
			error
		);
		process.exit(1);
	}

	try {
		// grab our wallet's token balance
		const ownedTokenBalance = await tokenModule.balanceOf(process.env.WALLET_ADDRESS);

		const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
		const percent90 = ownedAmount.div(100).mul(90);

		await tokenModule.transfer(
			voteModule.address,
			percent90,
		);
		console.log("✅ Successfully transferred tokens to vote module");
	} catch (error) {
		console.log("failed to transfer tokens to vote module", error)
	}
})();
