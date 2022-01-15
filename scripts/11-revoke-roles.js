import config from "../src/utils/config.js";
import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(config.tokenModuleAddress);

(async () => { 
	try {
		console.log("👀 Roles that exist right now:", await tokenModule.getAllRoleMembers());
		await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);	
		console.log("🎉 Roles after revoking ourselves", await tokenModule.getAllRoleMembers());
	    console.log("✅ Successfully revoked our superpowers from the ERC-20 contract");
	} catch (error) {
		console.log('❌ failed to revoke rights', error);
	}
})();
