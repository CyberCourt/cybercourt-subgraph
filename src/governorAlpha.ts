import { BigInt ,log,Bytes,Address} from "@graphprotocol/graph-ts"
import {
  GovernorAlpha as GovernorAlphaContract ,
  ProposalCanceled,
  ProposalCreated,
  ProposalExecuted,
  ProposalQueued,
  VoteCast
} from "../generated/templates/GovernorAlpha/GovernorAlpha"
import { GovernorProposal } from "../generated/schema"

export function handleProposalCanceled(event: ProposalCanceled): void {
  let governorProposal = GovernorProposal.load(event.address.toHex() + "-" + event.params.id.toHex())
  governorProposal.canceled = true;
  governorProposal.save();
}

export function handleProposalCreated(event: ProposalCreated): void {
  log.warning("event.address.toHex(){}", [event.address.toHex()]);
  let governorAlphaContract = GovernorAlphaContract.bind(event.address);
  let governorProposal = GovernorProposal.load(event.address.toHex() + "-" + event.params.id.toHex())
  if (governorProposal == null) {
    governorProposal = new GovernorProposal(event.address.toHex() + "-" + event.params.id.toHex())
  }
  governorProposal.judgerOrg = governorAlphaContract.pool().toHex();
  governorProposal.proposer = event.params.proposer;
  let myArray = event.params.targets as Array<Bytes>;
  
  // governorProposal.targets = event.parameters[2].value.toAddressArray();
  // for (let i=0;i<event.params.targets.length;i++){
    
  //   let s = event.params.targets[i];
  //   governorProposal.targets.push(s);
  // }
  governorProposal.order = event.params.id;
  governorProposal.targets = myArray;
  governorProposal.values = event.params.values;
  governorProposal.signatures =event.params.signatures;
  governorProposal.calldatas =event.params.calldatas;
  governorProposal.description =event.params.description;
  governorProposal.startBlock = governorAlphaContract.proposals(event.params.id).value3;
  governorProposal.startBlockTime = event.block.timestamp;
  governorProposal.endBlock = governorAlphaContract.proposals(event.params.id).value4;
  governorProposal.endBlockTime = governorAlphaContract.votingPeriod().times(BigInt.fromI32(2)).plus(event.block.timestamp) ;
  governorProposal.canceled = false;
  governorProposal.executed = false;
  governorProposal.forVotes = BigInt.fromI32(0);
  governorProposal.againstVotes = BigInt.fromI32(0);
  governorProposal.votesDiff = BigInt.fromI32(0);
  // governorProposal.state = governorAlphaContract.state(event.params.id);
  governorProposal.save();
}

export function handleProposalExecuted(event: ProposalExecuted): void {
  let governorProposal = GovernorProposal.load(event.address.toHex() + "-" + event.params.id.toHex())
  if (governorProposal !=null){
    governorProposal.executed = true;
    governorProposal.save();
  }
}

export function handleProposalQueued(event: ProposalQueued): void {
  let governorProposal = GovernorProposal.load(event.address.toHex() + "-" + event.params.id.toHex())
  if (governorProposal !=null){
    governorProposal.eta = event.params.eta;
    governorProposal.save();
  }
}

export function handleVoteCast(event: VoteCast): void {
  let governorProposal = GovernorProposal.load(event.address.toHex() + "-" + event.params.proposalId.toHex())
  if (governorProposal !=null){
    if (event.params.support){
      governorProposal.forVotes = governorProposal.forVotes.plus(event.params.votes)
    }else{
      governorProposal.againstVotes = governorProposal.againstVotes.plus(event.params.votes)
    }
    governorProposal.votesDiff = governorProposal.forVotes.minus(governorProposal.againstVotes);
    governorProposal.save();
  }
}
