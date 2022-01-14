import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule("0x3d14E510FcdAf9dA410e393694AD14f325a5C6DC");

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
