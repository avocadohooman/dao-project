import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";
import config from "../src/utils/config.js";

const bundleDrop = sdk.getBundleDropModule(config.bundleDropAddress);

(async () => {
	try {
		await bundleDrop.createBatch([
			{
				name: "Towel",
				description: "This NFT will give you access to the 42DAO",
				image: readFileSync("scripts/assets/towel.png")
			}
		])		
	    console.log("✅ Successfully created a new NFT in the drop!");
	} catch (error) {
		console.log('error failed to create NFT', error);
	}
})()
