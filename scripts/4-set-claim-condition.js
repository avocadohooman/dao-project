import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule("0x3d14E510FcdAf9dA410e393694AD14f325a5C6DC");

(async () => {
	try {
		const claimConditionFactory = bundleDrop.getClaimConditionFactory();
		// Specify condition
		claimConditionFactory.newClaimPhase({
			startTime: new Date(),
			maxQuantity: 50_000,
			maxQuantityPerTransaction: 1,
		});	

		/*
			Why do we pass in a 0? Well, basically our membership NFT has a tokenId of 0 
			since it's the first token in our ERC-1155 contract. 
		*/
		await bundleDrop.setClaimCondition(0, claimConditionFactory);
		console.log("✅ Successfully set claim condition on bundle drop:", bundleDrop.address);
	} catch (error) {
		console.log('error failed to create NFT', error);
	}
})()