import { Account, Creator, ERC1155Balance, ERC1155Contract, ERC1155Creator, ERC1155Token, ERC1155Transfer, ERC721Contract, ERC721Creator, ERC721Token, ERC721Transfer, Transaction , RoyaltiesNFT } from "../../generated/schema";
import { Approval, ApprovalForAll, BaseUriChanged, CreateERC721Rarible, CreateERC721RaribleUser, Creators, DefaultApproval, MinterStatusChanged, RoyaltiesSet, Transfer } from "../../generated/templates/ERC721Proxy/ERC721Proxy";
import { CreateERC1155Rarible, CreateERC1155RaribleUser, Supply, TransferBatch, TransferSingle, URI } from "../../generated/templates/ERC1155Proxy/ERC1155Proxy";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { fetchOrCreateAccount, generateCombineKey, updateBlockEntity, updateContractCount, updateERC1155Balance, updateOwnedTokenCount } from "../utils";
import { ContractAddress } from "../enum";
export function handleApproval(event: Approval): void {
  // Logic to handle the Approval event
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  // Logic to handle the ApprovalForAll event
}

export function handleBaseUriChanged(event: BaseUriChanged): void {
  // Logic to handle the BaseUriChanged event
}

export function handleCreateERC721Rarible(event: CreateERC721Rarible): void {
  let collection = ERC721Contract.load(event.address.toHexString());
  if (collection !== null) {
    collection.name = event.params.name;
    collection.symbol = event.params.symbol;
    collection.count = BigInt.fromI32(0);
    collection.holderCount = BigInt.fromI32(0);
    collection.save();
  }
  else {
    let newCollection = new ERC721Contract(event.address.toHexString());
    newCollection.name = event.params.name;
    newCollection.symbol = event.params.symbol;
    newCollection.txCreation = event.transaction.hash.toHexString();
    newCollection.asAccount = fetchOrCreateAccount(event.params.owner).id;
    newCollection.holderCount = BigInt.fromI32(0);
    newCollection.count = BigInt.fromI32(0);
    newCollection.save()
  }
}

export function handleCreateERC721RaribleUser(event: CreateERC721RaribleUser): void {
  let collection = ERC721Contract.load(event.address.toHexString());
  if (collection !== null) {
    collection.name = event.params.name;
    collection.symbol = event.params.symbol;
    collection.count = BigInt.fromI32(0);
    collection.holderCount = BigInt.fromI32(0);
    collection.save();
  }
  else {
    let newCollection = new ERC721Contract(event.address.toHexString());
    newCollection.name = event.params.name;
    newCollection.symbol = event.params.symbol;
    newCollection.txCreation = event.transaction.hash.toHexString();
    newCollection.asAccount = fetchOrCreateAccount(event.transaction.from).id;;
    newCollection.count = BigInt.fromI32(0);
    newCollection.holderCount = BigInt.fromI32(0);
    newCollection.save()
  }
}
export function handleCreateERC1155Rarible(event: CreateERC1155Rarible): void {
  let collection = ERC1155Contract.load(event.address.toHexString());
  if (collection !== null) {
    collection.name = event.params.name;
    collection.symbol = event.params.symbol;
    collection.count = BigInt.fromI32(0);
    collection.holderCount = BigInt.fromI32(0);
    collection.save();
  }
  else {
    let newCollection = new ERC1155Contract(event.address.toHexString());
    newCollection.name = event.params.name;
    newCollection.symbol = event.params.symbol;
    newCollection.txCreation = event.transaction.hash.toHexString();
    newCollection.asAccount = fetchOrCreateAccount(event.transaction.from).id;
    newCollection.count = BigInt.fromI32(0);
    newCollection.holderCount = BigInt.fromI32(0);
    newCollection.save()
  }
}

export function handleCreateERC1155RaribleUser(event: CreateERC1155RaribleUser): void {
  let collection = ERC1155Contract.load(event.address.toHexString());
  if (collection !== null) {
    collection.name = event.params.name;
    collection.symbol = event.params.symbol;
    collection.count = BigInt.fromI32(0);
    collection.holderCount = BigInt.fromI32(0);
    collection.save();
  }
  else {
    let newCollection = new ERC1155Contract(event.address.toHexString());
    newCollection.name = event.params.name;
    newCollection.symbol = event.params.symbol;
    newCollection.asAccount = fetchOrCreateAccount(event.transaction.from).id;
    newCollection.count = BigInt.fromI32(0);
    newCollection.holderCount = BigInt.fromI32(0);
    newCollection.save()
  }
}

export function handleDefaultApproval(event: DefaultApproval): void {
  // Logic to handle the DefaultApproval event
}

export function handleMinterStatusChanged(event: MinterStatusChanged): void {
  // Logic to handle the MinterStatusChanged event
}


export function handleRoyaltiesSet(event: RoyaltiesSet): void {
  const listroyalties = event.params.royalties;
  for(let i =0 ; i < listroyalties.length ; i++){
    let registry = RoyaltiesNFT.load(event.address.toHexString()+ '-' + event.params.tokenId.toString() + '-' + listroyalties[i].account.toHexString());
    if (registry == null) {
      registry = new RoyaltiesNFT(event.address.toHexString()+ '-' + event.params.tokenId.toString() + '-' + listroyalties[i].account.toHexString());
      registry.tokenId = event.params.tokenId.toString();
      registry.account = listroyalties[i].account.toHexString();
      registry.value = listroyalties[i].value.toI32();
      registry.contract = event.address.toHexString();
    }
    registry.save();
  }
  // Logic to handle the RoyaltiesSet event
}

export function handleTransfer(event: Transfer): void {
  if (event.params.to.toHexString() == ContractAddress.erc721marketplace) {
    return;
  }
  if (event.params.from != Address.fromString(ContractAddress.ZERO) && event.params.to != Address.fromString(ContractAddress.erc721marketplace)) {
    updateOwnedTokenCount(event.params.from.toHexString(), event.address.toHexString(), false, event.block.timestamp)
  }
  if (event.params.to != Address.fromString(ContractAddress.ZERO) && event.params.from != Address.fromString(ContractAddress.erc721marketplace)) {
    updateOwnedTokenCount(event.params.to.toHexString(), event.address.toHexString(), true, event.block.timestamp)
  }
  let tokenId = generateCombineKey([event.address.toHexString(), event.params.tokenId.toString()]);
  let token = ERC721Token.load(tokenId);
  // Handle the new transaction
  let transaction = Transaction.load(event.transaction.hash.toHex());
  if (transaction == null) {
    transaction = new Transaction(event.transaction.hash.toHex());
    transaction.timestamp = event.block.timestamp;
    transaction.blockNumber = event.block.number;
    transaction.save();
  }

  // If the token does not exist yet, create it - this indicates a minting event
  if (token == null) {
    token = new ERC721Token(tokenId);
    token.tokenId = event.params.tokenId.toString()
    token.contract = event.address.toHexString();
    token.identifier = event.params.tokenId;
    token.owner = event.params.to.toHexString();
    token.txCreation = event.transaction.hash.toHexString()
    let zeroAccount = Account.load('0x0000000000000000000000000000000000000000');
    updateBlockEntity(event, event.address, event.params.tokenId, event.params.from, event.params.to, 'Mint', BigInt.fromI32(0), BigInt.fromI32(1), Address.fromString(ContractAddress.ZERO));
    updateContractCount(event.address.toHexString(), BigInt.fromI32(1), 'ERC721');    
    if (zeroAccount == null) {
      zeroAccount = new Account('0x0000000000000000000000000000000000000000');
      zeroAccount.save();
    }
    // Set the approval to the zero address when the token is minted
    token.approval = zeroAccount.id;
    token.uri = ""; // Set the URI based on your logic
    token.save();
  } else {
    // Assuming approval is cleared on transfer
    token.approval = '0x0000000000000000000000000000000000000000';
    token.owner = event.params.to.toHex(); // Update the owner
    if (event.params.from.toHexString() != ContractAddress.erc721marketplace) {
      updateBlockEntity(event, event.address, event.params.tokenId, event.params.from, event.params.to, 'Transfer', BigInt.fromI32(0), BigInt.fromI32(1), Address.fromString(ContractAddress.ZERO));
    }
    token.save();
  }

  // Ensure 'to' account is created
  let accountToId = event.params.to.toHex();
  let accountTo = Account.load(accountToId);
  if (accountTo == null) {
    accountTo = new Account(accountToId);
    accountTo.save();
  }

  // Create the transfer event entity
  let transferId = generateCombineKey([event.transaction.hash.toHex(), event.address.toHex(), tokenId])
  let transfer = new ERC721Transfer(transferId);
  transfer.transaction = transaction.id;
  transfer.contract = event.address.toHex();
  transfer.token = tokenId;
  transfer.to = accountTo.id;
  transfer.from = event.params.from.toHex();
  transfer.timestamp = event.block.timestamp;
  transfer.emitter = event.params.from.toHex();
  transfer.save();

  // Ensure 'from' account is created
  if (event.params.from.toHex() != "0x0000000000000000000000000000000000000000") {
    let accountFromId = event.params.from.toHex();
    let accountFrom = Account.load(accountFromId);
    if (accountFrom == null) {
      accountFrom = new Account(accountFromId);
      accountFrom.save();
    }
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  if (event.params.to.toHexString() == ContractAddress.erc1155marketplace) {
    return;
  }
  let transaction = Transaction.load(event.transaction.hash.toHex());
  if (transaction == null) {
    transaction = new Transaction(event.transaction.hash.toHex());
    transaction.timestamp = event.block.timestamp;
    transaction.blockNumber = event.block.number;
    transaction.save();
  }

  // let tokenId = event.params.id.toString();
  let tokenId = generateCombineKey([event.address.toHexString(), event.params.id.toString()]);
  let token = ERC1155Token.load(tokenId);
  if (token == null) {
    token = new ERC1155Token(tokenId);
    token.tokenId = event.params.id.toString();
    // Initialize other ERC1155Token properties here
    token.save();
  }

  // Update balances for 'from' and 'to' accounts
  if (event.params.from.toHexString() != ContractAddress.erc1155marketplace)
    updateERC1155Balance(event.params.from, tokenId, event.params.value.times(BigInt.fromI32(-1)), event.address.toHex()); // Subtract value
  updateERC1155Balance(event.params.to, tokenId, event.params.value, event.address.toHex()); // Add value

  // Create ERC1155Transfer entity
  let transferId = generateCombineKey([event.transaction.hash.toHex(), event.address.toHex(), tokenId])
  let transfer = new ERC1155Transfer(transferId);
  transfer.transaction = transaction.id;
  transfer.token = token.id;
  transfer.from = fetchOrCreateAccount(event.params.from).id;
  transfer.to = fetchOrCreateAccount(event.params.to).id;
  transfer.value = event.params.value.toBigDecimal();
  transfer.valueExact = event.params.value;
  transfer.timestamp = event.block.timestamp;
  transfer.contract = event.address.toHex();
  // transfer.fromBalance = balance.value || balance.valueExact.toI32();
  // Set the emitter if available or use operator
  transfer.emitter = fetchOrCreateAccount(event.params.operator).id;
  if (event.params.from.toHexString() != ContractAddress.erc1155marketplace) {
    updateBlockEntity(event, event.address, event.params.id, event.params.from, event.params.to, 'Transfer', BigInt.fromI32(0), event.params.value, Address.fromString(ContractAddress.ZERO));
  }
  // if (event.params.from != Address.fromString(ContractAddress.ZERO)) {
  //   updateOwnedTokenCountERC1155(event.params.from.toHexString(), event.address.toHexString(), false, event.params.value, event.block.timestamp)
  // }
  // if (event.params.to != Address.fromString(ContractAddress.ZERO) && event.params.from != Address.fromString(ContractAddress.erc1155marketplace)) {
  //   updateOwnedTokenCountERC1155(event.params.to.toHexString(), event.address.toHexString(), true, event.params.value, event.block.timestamp)
  // }
  transfer.save();
}

export function handleTranferBatch(event: TransferBatch): void {
  if (event.params.to.toHexString() == ContractAddress.erc1155marketplace) {
    return;
  }
  let transaction = Transaction.load(event.transaction.hash.toHex());
  if (transaction == null) {
    transaction = new Transaction(event.transaction.hash.toHex());
    transaction.timestamp = event.block.timestamp;
    transaction.blockNumber = event.block.number;
    transaction.save();
  }
  for (let i = 0; i < event.params.ids.length; i++) {
    // if (event.params.from != Address.fromString(ContractAddress.ZERO)) {
    //   updateOwnedTokenCountERC1155(event.params.from.toHexString(), event.address.toHexString(), false, event.params.values[i],event.block.timestamp)
    // }
    // if (event.params.to != Address.fromString(ContractAddress.ZERO) && event.params.from != Address.fromString(ContractAddress.erc1155marketplace)) {
    //   updateOwnedTokenCountERC1155(event.params.to.toHexString(), event.address.toHexString(), true, event.params.values[i],event.block.timestamp)
    // }
    let tokenId = generateCombineKey([event.address.toHexString(), event.params.ids[i].toString()]);
    // let tokenId = event.params.ids[i].toString();
    let token = ERC1155Token.load(tokenId);
    if (token == null) {
      token = new ERC1155Token(tokenId);
      token.tokenId = event.params.ids[i].toString();
      // Initialize other ERC1155Token properties here
      token.save();
    }

    // Update balances for 'from' and 'to' accounts
    if (event.params.from.toHexString() != ContractAddress.erc1155marketplace)
      updateERC1155Balance(event.params.from, tokenId, event.params.values[i].times(BigInt.fromI32(-1)), event.address.toHex()); // Subtract value
    updateERC1155Balance(event.params.to, tokenId, event.params.values[i], event.address.toHex()); // Add value

    // Create ERC1155Transfer entity
    let transferId = generateCombineKey([event.transaction.hash.toHex(), event.address.toHex(), tokenId])
    let transfer = new ERC1155Transfer(transferId);
    transfer.transaction = transaction.id;
    transfer.token = token.id;
    transfer.from = fetchOrCreateAccount(event.params.from).id;
    transfer.to = fetchOrCreateAccount(event.params.to).id;
    transfer.value = event.params.values[i].toBigDecimal();
    transfer.timestamp = event.block.timestamp;
    // Set the emitter if available or use operator
    transfer.emitter = fetchOrCreateAccount(event.params.operator).id;
    if (event.params.to.toHexString() != ContractAddress.erc1155marketplace) {
      updateBlockEntity(event, event.address, event.params.ids[i], event.params.from, event.params.to, 'Transfer', BigInt.fromI32(0), event.params.values[i], Address.fromString(ContractAddress.ZERO));
    }
    transfer.save();
  }
}
export function handleSupply(event: Supply): void {
  let tokenId = generateCombineKey([event.address.toHexString(), event.params.tokenId.toString()]);
  let token = ERC1155Token.load(tokenId);
  if (token === null) {
    token = new ERC1155Token(tokenId);
    token.tokenId = event.params.tokenId.toString()
    token.txCreation = event.transaction.hash.toHexString();
    updateBlockEntity(event, event.address, event.params.tokenId, Address.fromString(ContractAddress.ZERO), Address.fromString(ContractAddress.ZERO), 'Mint', BigInt.fromI32(0), event.params.value, Address.fromString(ContractAddress.ZERO));
    updateContractCount(event.address.toHexString(), BigInt.fromI32(1), 'ERC1155');
  }
  token.identifier = event.params.tokenId;
  token.contract = event.address.toHexString();
  // Assume we create a balance entity for totalSupply
  let balanceId = generateCombineKey([event.address.toHex(), event.params.tokenId.toString()])
  let totalSupply = new ERC1155Balance(balanceId);
  totalSupply.value = event.params.value.toBigDecimal();
  totalSupply.valueExact = event.params.value;
  totalSupply.contract = event.address.toHex();
  totalSupply.token = token.id;
  totalSupply.save();

  token.totalSupply = totalSupply.id;
  token.save();
}

export function handle1155Creators(event: Creators): void {
  // let tokenId = event.params.tokenId.toString();
  let collection = ERC1155Contract.load(event.address.toHexString());

  // Create the Collection entity if it doesn't exist
  if (!collection) {
    collection = new ERC1155Contract(event.address.toHexString());
    // Initialize other necessary fields for Collection
    collection.txCreation = event.transaction.hash.toHexString();
    collection.save();
  }

  let creatorsArray = event.params.creators;
  for (let i = 0; i < creatorsArray.length; i++) {
    let creatorAddress = creatorsArray[i].account;
    let share = creatorsArray[i].value;
    let creatorId = creatorAddress.toHex();

    let creator = Creator.load(creatorId);
    if (!creator) {
      creator = new Creator(creatorId);
      // Initialize other necessary fields for Creator
      creator.save();
    }

    // let collectionCreatorId = collection.id + "-" + creatorId;
    let collectionCreatorId = generateCombineKey([collection.id, creatorId]);
    let collectionCreator = new ERC1155Creator(collectionCreatorId);
    collectionCreator.collection = collection.id;
    collectionCreator.creator = creatorId;
    collectionCreator.share = share; // Assuming share can be represented as BigInt
    collectionCreator.save();
  }
}
export function handle721Creators(event: Creators): void {
  // let tokenId = event.params.tokenId.toString();
  // let collectionAddr = event.address.toHexString()
  let collection = ERC721Contract.load(event.address.toHexString());

  // Create the Collection entity if it doesn't exist
  if (!collection) {
    collection = new ERC721Contract(event.address.toHexString());
    // Initialize other necessary fields for Collection
    collection.txCreation = event.transaction.hash.toHexString();
    collection.save();
  }

  let creatorsArray = event.params.creators;
  for (let i = 0; i < creatorsArray.length; i++) {
    let creatorAddress = creatorsArray[i].account;
    let share = creatorsArray[i].value;
    let creatorId = creatorAddress.toHex();

    let creator = Creator.load(creatorId);
    if (!creator) {
      creator = new Creator(creatorId);
      // Initialize other necessary fields for Creator
      creator.save();
    }

    // let collectionCreatorId = collection.id + "-" + creatorId;
    let collectionCreatorId = generateCombineKey([collection.id, creatorId]);
    let collectionCreator = new ERC721Creator(collectionCreatorId);
    collectionCreator.collection = collection.id;
    collectionCreator.creator = creatorId;
    collectionCreator.share = share; // Assuming share can be represented as BigInt
    collectionCreator.save();
  }
}

export function handleURI(event: URI): void {
  let token = ERC1155Token.load(event.params.id.toString());
  if (token) {
    token.uri = event.params.value.toString();
    token.save();
  }
}