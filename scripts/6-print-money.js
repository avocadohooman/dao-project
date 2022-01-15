import config from "../src/utils/config.js";
import sdk from "./1-initialize-sdk.js";
import { ethers } from 'ethers';

const tokenModule = sdk.getTokenModule(config.tokenModuleAddress);

(async () => {
	try {
		// Set the max amount of token supply
		const amount = 420_000;
		// We use the util function from "ethers" to convert the amount
		// to have 18 decimals (which is the standard for ERC20 tokens).
		/*
			We then do amountWith18Decimals which is pretty important. Basically, it will convert our 
			token supply number to a string with 18 decimal places. So, 1000000 turns into 
			"1000000.000000000000000000" — it adds 18 decimal places and turns the # into a string. 
			We do this for two reasons:
				1) Numbers in code are not very precise in terms of decimal places and math. Here, we decide to 
				work with numbers as strings, not as actual numbers, which makes precision good but math hard. 
				Ethers has a bunch of functionality to interact with these string numbers.
				2) Why would we want 18 decimal places? Well, it allows our token to be sent very precisely by users. 
				For example, what if I wanted to send 0.00000001 of my token to a friend? In this case, I 
				could! I have 18 decimal places worth of precision. Basically — we can send really 
				small amounts of tokens with no problem.
		*/
		const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
		// Interact with our ERC-20 contract and mint the token
		await tokenModule.mint(amountWith18Decimals);
		const totalSupply = await tokenModule.totalSupply();
		console.log(
			"✅ There now is",
			ethers.utils.formatUnits(totalSupply, 18),
			"$NOPANIC in circulation",
		);
	} catch (error) {
		console.error("Failed to print money", error);
	}
})()