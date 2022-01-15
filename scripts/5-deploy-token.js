import config from "../src/utils/config.js";
import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule(config.appAddress);

(async () => {
	try {
		// Deploy a standard ERC-20 contract.
		const tokenModule = await app.deployTokenModule({
			// What's your token's name? Ex. "Ethereum"
			name: "42DAO Governance Token",
			// What's your token's symbol? Ex. "ETH"
			symbol: "NOPANIC",
			
		});
		console.log(
				"✅ Successfully deployed token module, address:",
				tokenModule.address,
		);
	} catch (error) {
		console.error("failed to deploy token module", error);
	}
})();
