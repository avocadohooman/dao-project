import config from "../src/utils/config.js";
import sdk from "./1-initialize-sdk.js";

const appModule = sdk.getAppModule(config.appAddress);

(async () => {
	try {
		const voteModule = await appModule.deployVoteModule({
			// name of governance contract
			name: "42DAO's Proposal to life, the universe and everythin else",

			// location of the governance token
			votingTokenAddress: config.tokenModuleAddress,

			// after proposal has been deployed, 
			// when can members vote? 0 = immediately
			proposalStartWaitTimeInSeconds: 0,

			// How long do members have to vote on a proposal when it's created?
			// Here, we set it to 24 hours (86400 seconds)
			proposalVotingTimeInSeconds: 24 * 60 * 60,
	
			// is really interesting. Let’s say a member creates a proposal and the other 199 DAO members are on vacation at 
			// Disney World and aren’t online. Well, in this case, if that one DAO member creates the proposal 
			// and votes “YES” on their own proposal — that means 100% of the votes said “YES”
			// For the sake of example, let’s just do votingQuorumFraction: 0 which means the proposal will pass regardless 
			// of what % of token was used on the vote. This means one person could technically pass a proposal themselves 
			// if the other members are on vacation lol. For now, this is fine. The quorum you set in the real 
			// world depends on your supply and how much you initially airdropped.
			votingQuorumFraction: 0,

			// What's the minimum # of tokens a user needs to be allowed to create a proposal?
			// I set it to 0. Meaning no tokens are required for a user to be allowed to
			// create a proposal.
			minimumNumberOfTokensNeededToPropose: "0",

		});
		console.log(
			"✅ Successfully deployed vote module, address:",
			voteModule.address,
		);
	} catch (error) {
		console.error("Failed to deploy vote module", error);
	}
})()