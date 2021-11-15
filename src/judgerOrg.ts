import { BigInt } from "@graphprotocol/graph-ts"
import {
  JudgerOrg as JudgerOrgContract,
  DelegateChanged,
  DelegateVotesChanged,
  OwnerChanged,
  Transfer,
  assignJudgerEvent,
  finishEvent,
  setAssignJudgerNumEvent,
  setContactEvent,
  setIdleStatusEvent,
  setMaxCaseNumEvent,
  setNameEvent,
  setRateMantissaEvent,
  setRemarkEvent,
  setUrlEvent,
  setWhiteJudgerEvent,
  transferERC20Event,
  setTimesEvent,
  setAcceptTokenEvent,
} from "../generated/templates/JudgerOrg/JudgerOrg"
import { MainContractPerson, MainContract, Person, Contract, ContractPerson, Proposal, ProposalPerson, ProposalJudger, MainContractJudger, JudgeProposal, Judger, JudgerOrg,JudgerOrgJudger } from "../generated/schema"



export function handleDelegateChanged(event: DelegateChanged): void {}
export function handleDelegateVotesChanged(event: DelegateVotesChanged): void {}

export function handleOwnerChanged(event: OwnerChanged): void {}

export function handleTransfer(event: Transfer): void {}

export function handleassignJudgerEvent(event: assignJudgerEvent): void {}

export function handlefinishEvent(event: finishEvent): void {}

export function handlesetTimesEvent(
  event: setTimesEvent
): void {
  
  let judgerOrgId = event.address.toHex();
  let judgerOrg = JudgerOrg.load(judgerOrgId)
  judgerOrg.limitJudgePeriodTime = event.params.limitJudgePeriodTime;
  judgerOrg.exitWaitPeriodTime = event.params.exitWaitPeriodTime;
  judgerOrg.save();
}
export function handlesetAcceptTokenEvent(
  event: setAcceptTokenEvent
): void {
  
}
export function handlesetAssignJudgerNumEvent(
  event: setAssignJudgerNumEvent
): void {
  
  let judgerOrgId = event.address.toHex();
  let judgerOrg = JudgerOrg.load(judgerOrgId)
  judgerOrg.assignJudgerNum = event.params.assignJudgerNum;
  judgerOrg.save();
}

export function handlesetContactEvent(event: setContactEvent): void {
  
  let judgerOrgId = event.address.toHex();
  let judgerOrg = JudgerOrg.load(judgerOrgId)
  judgerOrg.contact = event.params.contact;
  judgerOrg.save();
}

export function handlesetIdleStatusEvent(event: setIdleStatusEvent): void {
  
  let judgerOrgId = event.address.toHex();
  let judgerOrgJudger = JudgerOrgJudger.load(judgerOrgId + "-" + event.params.from.toHex())
  if (judgerOrgJudger == null) {
    judgerOrgJudger = new JudgerOrgJudger(judgerOrgId + "-" + event.params.from.toHex())
  }
  judgerOrgJudger.idleStatus = event.params.idleStatus;
  judgerOrgJudger.save();

}

export function handlesetMaxCaseNumEvent(event: setMaxCaseNumEvent): void {
  let judgerOrgId = event.address.toHex();
  let judgerOrg = JudgerOrg.load(judgerOrgId)
  judgerOrg.maxCaseNum = event.params.maxCaseNum;
  judgerOrg.save();
}

export function handlesetNameEvent(event: setNameEvent): void {
  
  let judgerOrgId = event.address.toHex();
  let judgerOrg = JudgerOrg.load(judgerOrgId)
  judgerOrg.name = event.params.name;
  judgerOrg.save();
}

export function handlesetRateMantissaEvent(event: setRateMantissaEvent): void {
  let judgerOrgId = event.address.toHex();
  let judgerOrg = JudgerOrg.load(judgerOrgId)
  judgerOrg.rateMantissa = event.params.rateMantissa;
  judgerOrg.save();
}

export function handlesetRemarkEvent(event: setRemarkEvent): void {
  let judgerOrgId = event.address.toHex();
  let judgerOrg = JudgerOrg.load(judgerOrgId)
  judgerOrg.remark = event.params.remark;
  judgerOrg.save();
}

export function handlesetUrlEvent(event: setUrlEvent): void {
  let judgerOrgId = event.address.toHex();
  let judgerOrg = JudgerOrg.load(judgerOrgId)
  judgerOrg.url = event.params.url;
  judgerOrg.save();
}

export function handlesetWhiteJudgerEvent(event: setWhiteJudgerEvent): void {
  
  let judgerOrgId = event.address.toHex();
  let judgerOrg = JudgerOrg.load(judgerOrgId)
  // if (judgerOrg == null) {
  //   judgerOrg = new JudgerOrg(judgerOrgId)
  // }
  // judgerOrg.save();
  
  let judger = Judger.load(event.params.dst.toHex())
  if (judger == null){
    judger = new Judger(event.params.dst.toHex())
  }
  judger.save();

  // person.waitSignedContracts.push(contract.id);
  // judger.save();
  let judgerOrgJudger = JudgerOrgJudger.load(judgerOrg.id + "-" + judger.id)
  if (judgerOrgJudger == null) {
    judgerOrgJudger = new JudgerOrgJudger(judgerOrg.id + "-" + judger.id)
  }
  judgerOrgJudger.judger = judger.id;
  judgerOrgJudger.judgerOrg = judgerOrg.id;
  judgerOrgJudger.status = event.params.amount;
  judgerOrgJudger.idleStatus = false;
  judgerOrgJudger.save();
}

export function handletransferERC20Event(event: transferERC20Event): void {}
