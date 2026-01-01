// NOTE: copied from websites monorepo

type Stake = any;

export enum SESSION_NODE {
  /** Average millisecond per block (~2 minutes per block) */
  MS_PER_BLOCK = 2 * 60 * 1000,
  /** The number of confirmations required for a session network action */
  NETWORK_REQUIRED_CONFIRMATIONS = 5,
  /** Average network confirmation time. Time to get all confirmations. */
  NETWORK_CONFIRMATION_TIME_AVG_MS = 12 * 60 * 1000,
  /** Min Operator Fee */
  MIN_OPERATOR_FEE = 0,
  /** Max Operator Fee */
  MAX_OPERATOR_FEE = 100,
  /** Max contributors */
  MAX_CONTRIBUTORS = 10,
  /** A small contributor is one who contributes less than 1/DIVISOR of the total */
  SMALL_CONTRIBUTOR_DIVISOR = 4,
  /** 2 Hours in ms */
  INITIAL_DOWNTIME_CREDITS_MS = 2 * 60 * 60 * 1000,
}

export const blocksInMs = (blocks: number) => blocks * SESSION_NODE.MS_PER_BLOCK;
export const msInBlocks = (ms: number) => Math.floor(ms / SESSION_NODE.MS_PER_BLOCK);

export class BlockTimeManager {
  private readonly networkTime: number;
  private readonly currentBlock: number;

  constructor(networkTime: number, currentBlock: number) {
    this.networkTime = networkTime;
    this.currentBlock = currentBlock;
  }

  getDateOfBlock(targetBlock: number) {
    return new Date(this.networkTime * 1000 + blocksInMs(targetBlock - this.currentBlock));
  }
}
export enum CONTRIBUTION_CONTRACT_STATUS {
  // Contract is initialised w/ no contributions. Call `contributeFunds`
  // to transition into `OpenForPublicContrib`
  WaitForOperatorContrib = 0,

  // Contract has been initially funded by operator. Public and reserved
  // contributors can now call `contributeFunds`. When the contract is
  // collaterialised with exactly the staking requirement, the contract
  // transitions into `WaitForFinalized` state.
  OpenForPublicContrib = 1,

  // Operator must invoke `finalizeNode` to transfer the tokens and the
  // node registration details to the `stakingRewardsContract` to
  // transition to `Finalized` state.
  WaitForFinalized = 2,

  // Contract interactions are blocked until `reset` is called.
  Finalized = 3,
}

export enum EXIT_TYPE {
  /** The node is deregistered by consensus */
  DEREGISTER = 'deregister',
  /** The node is exited by contributor request */
  EXIT = 'exit',
}

export enum ARBITRUM_EVENT {
  //////////////////////////////////////////////////////////////
  //          ServiceNodeContributionFactory Events           //
  //////////////////////////////////////////////////////////////
  /** New contribution contract. Emitted by the ServiceNodeContributionFactory contract */
  NewServiceNodeContributionContract = 'NewServiceNodeContributionContract',
  //////////////////////////////////////////////////////////////
  //               ServiceNodeContribution Events             //
  //////////////////////////////////////////////////////////////
  /** The contribution contract has been finalized. Emitted by the ServiceNodeContribution contract */
  Finalized = 'Finalized',
  /** A new contribution has been made. Emitted by the ServiceNodeContribution contract */
  NewContribution = 'NewContribution',
  /** Contract is open for public contributions. Emitted by the ServiceNodeContribution contract @see {@link CONTRIBUTION_CONTRACT_STATUS.OpenForPublicContrib} */
  OpenForPublicContribution = 'OpenForPublicContribution',
  /** Contract is filled. Emitted by the ServiceNodeContribution contract @see {@link CONTRIBUTION_CONTRACT_STATUS.Filled} */
  Filled = 'Filled',
  /** A Contribution has been withdrawn. Emitted by the ServiceNodeContribution contract */
  WithdrawContribution = 'WithdrawContribution',
  /** The staker's beneficiary address has been updated. Emitted by the ServiceNodeContribution contract */
  UpdateStakerBeneficiary = 'UpdateStakerBeneficiary',
  /** The contract's manual finalize flag has been updated. Emitted by the ServiceNodeContribution contract */
  UpdateManualFinalize = 'UpdateManualFinalize',
  /** The contract's fee has been updated. Emitted by the ServiceNodeContribution contract */
  UpdateFee = 'UpdateFee',
  /** The contract's pubkeys have been updated. Emitted by the ServiceNodeContribution contract */
  UpdatePubkeys = 'UpdatePubkeys',
  /** The contract's reserved contributors have been updated. Emitted by the ServiceNodeContribution contract */
  UpdateReservedContributors = 'UpdateReservedContributors',
  /** The contract has been reset. Emitted by the ServiceNodeContribution contract */
  Reset = 'Reset',
  //////////////////////////////////////////////////////////////
  //                ServiceNodeRewards Events                 //
  //////////////////////////////////////////////////////////////
  /** A new seeded service node has been created. Emitted by the ServiceNodeRewards contract */
  NewSeededServiceNode = 'NewSeededServiceNode',
  /** A new service node has been created. Emitted by the ServiceNodeRewards contract */
  NewServiceNodeV2 = 'NewServiceNodeV2',
  /** A service node exit request has been made. Emitted by the ServiceNodeRewards contract */
  ServiceNodeExitRequest = 'ServiceNodeExitRequest',
  /** A service node has exited. Emitted by the ServiceNodeRewards contract */
  ServiceNodeExit = 'ServiceNodeExit',
  /** A service node has been liquidated. Emitted by the ServiceNodeRewards contract */
  ServiceNodeLiquidated = 'ServiceNodeLiquidated',
  /** Rewards have been claimed. Emitted by the ServiceNodeRewards contract */
  RewardsClaimed = 'RewardsClaimed',
  /** The staking requirement has been updated. Emitted by the ServiceNodeRewards contract */
  StakingRequirementUpdated = 'StakingRequirementUpdated',
  /** The claim threshold has been updated. Emitted by the ServiceNodeRewards contract */
  ClaimThresholdUpdated = 'ClaimThresholdUpdated',
  /** The claim cycle has been updated. Emitted by the ServiceNodeRewards contract */
  ClaimCycleUpdated = 'ClaimCycleUpdated',
  /** The liquidation ratios have been updated. Emitted by the ServiceNodeRewards contract */
  LiquidationRatiosUpdated = 'LiquidationRatiosUpdated',
  /** The BLS non signer indices have been updated. Emitted by the ServiceNodeRewards contract */
  BLSNonSignerIndicesUpdated = 'BLSNonSignerIndicesUpdated',
  //////////////////////////////////////////////////////////////
  //                         Token Events                     //
  //////////////////////////////////////////////////////////////
  /** A token transfer has occurred. Emitted by the Token contract */
  Transfer = 'Transfer',
  /** An approval has occurred. Emitted by the Token contract */
  Approval = 'Approval',
}
export enum STAKE_EVENT_STATE {
  UNKNOWN = 0,
  ACTIVE = 1,
  EXIT_REQUESTED = 2,
  EXITED = 3,
}

const STATE_EVENTS = new Set([
  ARBITRUM_EVENT.NewSeededServiceNode,
  ARBITRUM_EVENT.NewSeededServiceNode,
  ARBITRUM_EVENT.NewServiceNodeV2,
  ARBITRUM_EVENT.ServiceNodeExitRequest,
  ARBITRUM_EVENT.ServiceNodeExit,
  ARBITRUM_EVENT.ServiceNodeLiquidated,
]);

export function parseStakeEventState(stake: Stake) {
  const stateEvents = stake.events.filter((event) => STATE_EVENTS.has(event.name));
  const latestEvent = stateEvents[0];
  if (!latestEvent) return STAKE_EVENT_STATE.UNKNOWN;

  switch (latestEvent.name) {
    case ARBITRUM_EVENT.NewSeededServiceNode:
    case ARBITRUM_EVENT.NewServiceNodeV2:
      return STAKE_EVENT_STATE.ACTIVE;
    case ARBITRUM_EVENT.ServiceNodeExitRequest:
      return STAKE_EVENT_STATE.EXIT_REQUESTED;
    case ARBITRUM_EVENT.ServiceNodeExit:
    case ARBITRUM_EVENT.ServiceNodeLiquidated:
      return STAKE_EVENT_STATE.EXITED;
    default:
      return STAKE_EVENT_STATE.UNKNOWN;
  }
}

export enum STAKE_STATE {
  /** @see {STAKE_EVENT_STATE.EXITED}
   *
   * To determine if the stake was exited by `unlock` or `deregistration`, use {@link isStakeDeregistered}
   * */
  EXITED = 'Exited',
  /** @see {STAKE_EVENT_STATE.EXIT_REQUESTED} */
  AWAITING_EXIT = 'Ready To Exit',
  /**
   * If a stake is in the `deregistered` state, it means that the node has been deregistered by the network. All states are mutually exclusive, so it can't also be {@link STAKE_STATE.EXITED}.
   */
  DEREGISTERED = 'Deregistered',
  /** @see {STAKE_EVENT_STATE.ACTIVE}
   * and`active = true */
  RUNNING = 'Running',
  /** @see {STAKE_EVENT_STATE.ACTIVE}
   * and`active = false */
  DECOMMISSIONED = 'Decommissioned',
  /** Unknown state */
  UNKNOWN = 'Unknown',
}

export function isStakeDeregistered(stake: Stake) {
  return !!(
    stake.exit_type === EXIT_TYPE.DEREGISTER &&
    stake.deregistration_height &&
    stake.deregistration_height > 0
  );
}

export function isStakeRequestingExit(stake: Stake) {
  const eventState = parseStakeEventState(stake);
  return eventState === STAKE_EVENT_STATE.EXIT_REQUESTED;
}

export function isStakeReadyToExit(stake: Stake, blockHeight: number) {
  const eventState = parseStakeEventState(stake);
  return (
    eventState === STAKE_EVENT_STATE.EXIT_REQUESTED &&
    stake.requested_unlock_height &&
    stake.requested_unlock_height < blockHeight
  );
}

export function parseStakeState(stake: Stake, blockHeight: number) {
  const eventState = parseStakeEventState(stake);

  if (isStakeDeregistered(stake)) {
    return STAKE_STATE.DEREGISTERED;
  }

  if (eventState === STAKE_EVENT_STATE.EXITED) {
    return STAKE_STATE.EXITED;
  }

  if (eventState === STAKE_EVENT_STATE.EXIT_REQUESTED) {
    return isStakeReadyToExit(stake, blockHeight) ? STAKE_STATE.AWAITING_EXIT : STAKE_STATE.RUNNING;
  }

  if (eventState === STAKE_EVENT_STATE.ACTIVE) {
    return stake.active ? STAKE_STATE.RUNNING : STAKE_STATE.DECOMMISSIONED;
  }

  return STAKE_STATE.UNKNOWN;
}
