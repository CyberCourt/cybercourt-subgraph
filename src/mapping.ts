import { BigInt, Bytes, log ,Address} from "@graphprotocol/graph-ts"
import {
  Entrance,
  OwnershipTransferred,
  addContractEvent,
  addStakeEvent,
  applyExitEvent,
  createKindleEvent,
  createMainContractEvent,
  exitStakeEvent,
  finishConProposalEvent,
  finishContractSignEvent,
  finishJudgerProposalEvent,
  launchJudgerProposalEvent,
  launchProposalEvent,
  signContractEvent,
  signJudgerProposalEvent,
  signProposalEvent,
  applyJudgeEvent,
  setTokenFaucetEvent,
  finishExitEvent
} from "../generated/Entrance/Entrance"
import { MainContractPerson,  MainContract, Person, Contract, ContractPerson, Proposal, ProposalPerson, ProposalJudger, MainContractJudger, JudgeProposal, Judger, JudgerOrg,JudgerOrgJudger,Token } from "../generated/schema"
import { MainContract as MainContractContract } from '../generated/Entrance/MainContract'
import { JudgerOrg as JudgerOrgContract } from '../generated/templates';
import { GovernorAlpha as GovernorAlphaContract } from '../generated/templates';

export function handleOwnershipTransferred(event: OwnershipTransferred): void {


}

export function handleaddContractEvent(event: addContractEvent): void {
  let mainContractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex();
  let entrance = Entrance.bind(event.address);
  let mainContractAddr = entrance.mainContractMap(event.params.judgerOrgAddr, event.params.mainContractOrder);
  let mainContractContract = MainContractContract.bind(mainContractAddr);
  let contractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex() + "-" + BigInt.fromI32(event.params.contractOrder).toHex();

  log.warning("contractId{}", [contractId]);
  let contract = Contract.load(contractId);
  if (contract == null) {
    contract = new Contract(contractId);
  }
  contract.mainContractOrder = event.params.mainContractOrder;
  contract.contractOrder = event.params.contractOrder;
  contract.judgerOrgAddr = event.params.judgerOrgAddr;
  contract.mainContract = mainContractId;
  contract.startBlockTime = mainContractContract.contractMap(event.params.contractOrder);
  contract.contentOrIpfsHash = event.params.contentOrIpfsHash;
  contract.save();

  let num = mainContractContract.contractPersonAddrMapNum();
  for (let i = 0; i < num; i++) {
    let personAddr = mainContractContract.contractPersonAddrMap(i);
    let person = Person.load(personAddr.toHex())
    if (person == null) {
      person = new Person(personAddr.toHex())
    }
    // person.waitSignedContracts.push(contract.id);
    person.save();
    let contractPerson = ContractPerson.load(contract.id + "-" + person.id)
    if (contractPerson == null) {
      contractPerson = new ContractPerson(contract.id + "-" + person.id)
    }
    contractPerson.person = person.id;
    contractPerson.contract = contract.id;
    contractPerson.signStatus = 0;
    contractPerson.save();
  }
}

export function handleaddStakeEvent(event: addStakeEvent): void {

  let entrance = Entrance.bind(event.address);
  let mainContractAddr = entrance.mainContractMap(event.params.judgerOrgAddr, event.params.mainContractOrder);
  let mainContractContract = MainContractContract.bind(mainContractAddr);
  let mainContractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex();

  let mainContractPerson = MainContractPerson.load(mainContractId + "-" + event.params.from.toHex());
  mainContractPerson.balance = mainContractContract.contractPersonMap(event.params.from).value1;
  mainContractPerson.save();
  let mainContract = MainContract.load(mainContractId)
  mainContract.totalStake = mainContractContract.basicInfo().value9;
  mainContract.save();
}

export function handleapplyExitEvent(event: applyExitEvent): void {

  let entrance = Entrance.bind(event.address);
  let mainContractAddr = entrance.mainContractMap(event.params.judgerOrgAddr, event.params.mainContractOrder);
  let mainContractContract = MainContractContract.bind(mainContractAddr);
  let mainContractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex();
  let entity = MainContract.load(mainContractId)
  entity.applyExitBlockTime = mainContractContract.basicInfo().value2;
  entity.status = mainContractContract.basicInfo().value10;
  entity.save();

}


export function handlecreateMainContractEvent(event: createMainContractEvent): void {
  // let person = Person.load(event.params.addr.toHex());

  log.warning("handlecreateMainContractEvent{}",[event.params.mainContractOrder.toHex()]);
  let mainContractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex();
  let mainContractContract = MainContractContract.bind(event.params.mainContractAddr);
  let contractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex() + "-" + BigInt.fromI32(0).toHex();
  let contract = Contract.load(contractId);
  if (contract == null) {
    contract = new Contract(contractId);
  }
  contract.mainContractOrder = event.params.mainContractOrder;
  contract.contractOrder = 0;
  contract.judgerOrgAddr = event.params.judgerOrgAddr;
  contract.mainContract = mainContractId;
  contract.startBlockTime = mainContractContract.contractMap(0);
  contract.contentOrIpfsHash = event.params.contentOrIpfsHash;
  contract.save();
  // if (person == null) {
  // let person = new Person(event.params.mainContractAddr.toHex())
  let num = mainContractContract.contractPersonAddrMapNum();
  for (let i = 0; i < num; i++) {
    let personAddr = mainContractContract.contractPersonAddrMap(i);
    let person = Person.load(personAddr.toHex())
    if (person == null) {
      person = new Person(personAddr.toHex())
    }
    // person.waitSignedContracts.push(contract.id);
    person.save();
    let contractPerson = ContractPerson.load(contract.id + "-" + person.id)
    if (contractPerson == null) {
      contractPerson = new ContractPerson(contract.id + "-" + person.id)
    }
    contractPerson.person = person.id;
    contractPerson.contract = contract.id;
    contractPerson.signStatus = 0;
    contractPerson.save();
  }

  let entity = MainContract.load(mainContractId)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new MainContract(mainContractId)

    // Entity fields can be set using simple assignments
  }
  entity.mainContractOrder = event.params.mainContractOrder
  // BigInt and BigDecimal math are supported
  entity.mainContractAddr = event.params.mainContractAddr
  entity.token = mainContractContract.token();
  entity.startBlockTime = mainContractContract.basicInfo().value0;
  entity.endBlockTime = mainContractContract.basicInfo().value1;
  entity.applyExitBlockTime = mainContractContract.basicInfo().value2;
  entity.applyJudgeBlockTime = mainContractContract.basicInfo().value3;
  entity.exitWaitPeriodTime = mainContractContract.basicInfo().value4;
  entity.controlledToken = mainContractContract.basicInfo().value5;
  entity.limitJudgePeriodTime = mainContractContract.basicInfo().value6;
  entity.succJudgeProposalOrder = mainContractContract.basicInfo().value7;
  entity.succConPersonProposalOrder = mainContractContract.basicInfo().value8;
  entity.totalStake = mainContractContract.basicInfo().value9;
  entity.status = mainContractContract.basicInfo().value10;

  for (let i = 0; i < num; i++) {
    let personAddr = mainContractContract.contractPersonAddrMap(i);
    let person = Person.load(personAddr.toHex())

    let mainContractPerson = MainContractPerson.load(entity.id + "-" + person.id)
    if (mainContractPerson == null) {
      mainContractPerson = new MainContractPerson(entity.id + "-" + person.id)
    }
    mainContractPerson.person = person.id;
    mainContractPerson.mainContract = entity.id;
    mainContractPerson.balance = mainContractContract.contractPersonMap(personAddr).value1;
    log.warning("balance{}", [mainContractPerson.balance.toHex()]);
    mainContractPerson.save();
  }

  // Entity fields can be set based on event parameters
  entity.judgerOrgAddr = event.params.judgerOrgAddr

  // Entities can be written to the store with `.save()`
  entity.save()
}

export function handlefinishExitEvent(event: finishExitEvent): void {


  let entrance = Entrance.bind(event.address);
  let mainContractAddr = entrance.mainContractMap(event.params.judgerOrgAddr, event.params.mainContractOrder);
  let mainContractContract = MainContractContract.bind(mainContractAddr);
  let mainContractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex();

  let num = mainContractContract.contractPersonAddrMapNum();
  for (let i=0;i<num;i++){
    let mainContractPerson = MainContractPerson.load(mainContractId + "-" + mainContractContract.contractPersonAddrMap(i).toHex());
    mainContractPerson.balance = BigInt.fromI32(0);
    mainContractPerson.save();
  }

  let mainContract = MainContract.load(mainContractId)
  mainContract.totalStake = mainContractContract.basicInfo().value9;
  mainContract.status = mainContractContract.basicInfo().value10;
  mainContract.save();
}

export function handleexitStakeEvent(event: exitStakeEvent): void {

  let entrance = Entrance.bind(event.address);
  let mainContractAddr = entrance.mainContractMap(event.params.judgerOrgAddr, event.params.mainContractOrder);
  let mainContractContract = MainContractContract.bind(mainContractAddr);
  let mainContractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex();

  let mainContractPerson = MainContractPerson.load(mainContractId + "-" + event.params.from.toHex());
  mainContractPerson.balance = mainContractContract.contractPersonMap(event.params.from).value1;
  mainContractPerson.save();
  let mainContract = MainContract.load(mainContractId)
  mainContract.totalStake = mainContractContract.basicInfo().value9;
  mainContract.status = mainContractContract.basicInfo().value10;
  mainContract.save();
}

export function handlefinishConProposalEvent(
  event: finishConProposalEvent
): void {

  let entrance = Entrance.bind(event.address);
  let mainContractAddr = entrance.mainContractMap(event.params.judgerOrgAddr, event.params.mainContractOrder);
  let mainContractContract = MainContractContract.bind(mainContractAddr);
  let mainContractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex();

  let num = mainContractContract.contractPersonAddrMapNum();
  for (let i=0;i<num;i++){
    let mainContractPerson = MainContractPerson.load(mainContractId + "-" + mainContractContract.contractPersonAddrMap(i).toHex());
    mainContractPerson.balance = BigInt.fromI32(0);
    mainContractPerson.save();
  }

  let mainContract = MainContract.load(mainContractId)
  mainContract.totalStake = mainContractContract.basicInfo().value9;
  mainContract.status = mainContractContract.basicInfo().value10;
  mainContract.save();
}

export function handlefinishContractSignEvent(
  event: finishContractSignEvent
): void {
  let entrance = Entrance.bind(event.address);
  let mainContractAddr = entrance.mainContractMap(event.params.judgerOrgAddr, event.params.mainContractOrder);
  let mainContractContract = MainContractContract.bind(mainContractAddr);
  let mainContractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex();

  

  let mainContract = MainContract.load(mainContractId)
  mainContract.status = mainContractContract.basicInfo().value10;
  mainContract.save();
}

export function handlefinishJudgerProposalEvent(
  event: finishJudgerProposalEvent
): void {

  let entrance = Entrance.bind(event.address);
  let mainContractAddr = entrance.mainContractMap(event.params.judgerOrgAddr, event.params.mainContractOrder);
  let mainContractContract = MainContractContract.bind(mainContractAddr);
  let mainContractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex();

  
  let num = mainContractContract.contractPersonAddrMapNum();
  for (let i=0;i<num;i++){
    let mainContractPerson = MainContractPerson.load(mainContractId + "-" + mainContractContract.contractPersonAddrMap(i).toHex());
    mainContractPerson.balance = BigInt.fromI32(0);
    mainContractPerson.save();
  }

  let mainContract = MainContract.load(mainContractId)
  mainContract.totalStake = mainContractContract.basicInfo().value9;
  mainContract.status = mainContractContract.basicInfo().value10;
  mainContract.save();

  num = mainContractContract.judgerMapNum();
  for (var i = 0; i < num; i++) {
    var personAddr = mainContractContract.judgerMap(i);;
    let personAddrHex = personAddr.toHex();
    
    let mainContractJudger = MainContractJudger.load(mainContractId + "-" + personAddrHex)
    if (mainContractJudger == null) {
      mainContractJudger = new MainContractJudger(mainContractId + "-" + personAddrHex)
    }
    mainContractJudger.status = 1;
    mainContractJudger.save();
  }
}


export function handlelaunchProposalEvent(event: launchProposalEvent): void {
  let mainContractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex();

  let proposalId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex() + "-" + event.params.proposalOrder.toHex();
  let proposal = Proposal.load(proposalId);
  if (proposal == null) {
    proposal = new Proposal(proposalId);
  }
  proposal.mainContractOrder = event.params.mainContractOrder;
  proposal.judgerOrgAddr = event.params.judgerOrgAddr;
  proposal.proposalOrder = event.params.proposalOrder;
  proposal.mainContract = mainContractId;
  

  // proposal.agreeNum = 0;
  // proposal.rejectNum = 0;
  // proposal.proposer = event.params.from;
  proposal.save();



  let entrance = Entrance.bind(event.address);
  let mainContractAddr = entrance.mainContractMap(event.params.judgerOrgAddr, event.params.mainContractOrder);
  let mainContractContract = MainContractContract.bind(mainContractAddr);
  let num = mainContractContract.contractPersonAddrMapNum();
  for (let i = 0; i < num; i++) {
    let personAddr = mainContractContract.contractPersonAddrMap(i);

    let proposalPerson = ProposalPerson.load(proposal.id + "-" + personAddr.toHex())
    if (proposalPerson == null) {
      proposalPerson = new ProposalPerson(proposal.id + "-" + personAddr.toHex())
    }
    proposalPerson.person = personAddr.toHex();
    proposalPerson.proposal = proposal.id;
    proposalPerson.signStatus = 0;
    proposalPerson.save();
  }
}


export function handlesetTokenFaucetEvent(event: setTokenFaucetEvent): void {
  let tokenId = event.params.token.toHex();
  let token = Token.load(tokenId);
  if (token != null) {
    token.tokenFaucet = event.params.tokenFaucet;
    token.save();
  }
}
export function handlesignContractEvent(event: signContractEvent): void {
  let contractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex() + "-" + BigInt.fromI32(event.params.contractOrder).toHex();
  let contractPerson = ContractPerson.load(contractId + "-" + event.params.from.toHex());
  if (contractPerson != null) {
    contractPerson.signStatus = event.params.signStatus;
    contractPerson.save();
  }
}
export function handlesignProposalEvent(event: signProposalEvent): void {
  let proposalId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex() + "-" + event.params.proposalOrder.toHex();
  let proposalPerson = ProposalPerson.load(proposalId + "-" + event.params.from.toHex());
  if (proposalPerson != null) {
    proposalPerson.signStatus = event.params.signStatus;
    proposalPerson.save();
  }
}

export function handleapplyJudgeEvent(event: applyJudgeEvent): void {
  let mainContractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex();

  let entrance = Entrance.bind(event.address);
  let mainContractAddr = entrance.mainContractMap(event.params.judgerOrgAddr, event.params.mainContractOrder);
  let mainContractContract = MainContractContract.bind(mainContractAddr);
  

  let mainContract = MainContract.load(mainContractId)
  mainContract.status = mainContractContract.basicInfo().value10;
  mainContract.save();
  let num = event.params.judgerAddr.length;
  for (var i = 0; i < num; i++) {
    var personAddr = mainContractContract.judgerMap(i);;
    let personAddrHex = personAddr.toHex();
    let person = Judger.load(personAddrHex)
    if (person == null) {
      person = new Judger(personAddrHex)
      person.save();
    }
    // person.waitSignedContracts.push(contract.id);
    let mainContractJudger = MainContractJudger.load(mainContractId + "-" + person.id)
    if (mainContractJudger == null) {
      mainContractJudger = new MainContractJudger(mainContractId + "-" + person.id)
    }
    mainContractJudger.judger = person.id;
    mainContractJudger.mainContract = mainContractId;
    mainContractJudger.status = 0;
    mainContractJudger.save();
  }
}
export function handlesignJudgerProposalEvent(
  event: signJudgerProposalEvent
): void {
  let proposalId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex() + "-" + event.params.proposalOrder.toHex();
  let proposalPerson = ProposalJudger.load(proposalId + "-" + event.params.from.toHex());
  
  if (proposalPerson == null) {
    proposalPerson = new ProposalJudger(proposalId + "-" + event.params.from.toHex())
  }
  proposalPerson.judger = event.params.from.toHex();
  proposalPerson.proposal = proposalId;
  proposalPerson.signStatus = event.params.signStatus;
  proposalPerson.save();
}

export function handlelaunchJudgerProposalEvent(
  event: launchJudgerProposalEvent
): void {
  let mainContractId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex();

  let proposalId = event.params.judgerOrgAddr.toHex() + "-" + event.params.mainContractOrder.toHex() + "-" + event.params.proposalOrder.toHex();
  let proposal = JudgeProposal.load(proposalId);
  if (proposal == null) {
    proposal = new JudgeProposal(proposalId);
  }
  proposal.mainContractOrder = event.params.mainContractOrder;
  proposal.judgerOrgAddr = event.params.judgerOrgAddr;
  proposal.proposalOrder = event.params.proposalOrder;
  proposal.mainContract = mainContractId;

  proposal.save();

  let entrance = Entrance.bind(event.address);
  let mainContractAddr = entrance.mainContractMap(event.params.judgerOrgAddr, event.params.mainContractOrder);
  let mainContractContract = MainContractContract.bind(mainContractAddr);
  let num = mainContractContract.judgerMapNum();
  for (let i = 0; i < num; i++) {
    let personAddr = mainContractContract.judgerMap(i);

    let proposalPerson = ProposalJudger.load(proposal.id + "-" + personAddr.toHex())
    if (proposalPerson == null) {
      proposalPerson = new ProposalJudger(proposal.id + "-" + personAddr.toHex())
    }
    proposalPerson.judger = personAddr.toHex();
    proposalPerson.proposal = proposal.id;
    proposalPerson.signStatus = 0;
    proposalPerson.save();
  }
}


export function handlecreateKindleEvent(event: createKindleEvent): void {
  log.warning("handlecreateKindleEvent{}",[event.params.judgerOrgAddr.toHex()]);
  let judgerOrgId = event.params.judgerOrgAddr.toHex();
  let judgerOrg = JudgerOrg.load(judgerOrgId)
  if (judgerOrg == null) {
    judgerOrg = new JudgerOrg(judgerOrgId)
  }
  judgerOrg.governorAlphaAddr = event.params.governAddr
  judgerOrg.save();
  
  let judger = Judger.load(event.params.from.toHex())
  if (judger == null) {
    judger = new Judger(event.params.from.toHex())
  }
  // person.waitSignedContracts.push(contract.id);
  judger.save();
  // let judgerOrgJudger = JudgerOrgJudger.load(judgerOrg.id + "-" + judger.id)
  // if (judgerOrgJudger == null) {
  //   judgerOrgJudger = new JudgerOrgJudger(judgerOrg.id + "-" + judger.id)
  // }
  // judgerOrgJudger.judger = judger.id;
  // judgerOrgJudger.judgerOrg = judgerOrg.id;
  // judgerOrgJudger.status = BigInt.fromI32(1);
  // judgerOrgJudger.idleStatus = false;
  // judgerOrgJudger.save();
  JudgerOrgContract.create(event.params.judgerOrgAddr);
  GovernorAlphaContract.create(event.params.governAddr);
}
