import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import {
  AskNew,
  AskCancel,
  Buy,
  OfferAccept,
  OfferNew,
  OfferCancel,
} from "../../generated/ERC1155Marketplace/ERC1155Marketplace"
import { ERC1155Contract, ERC1155Token, MarketEvent1155 } from "../../generated/schema"
import { fetchOrCreateERC1155Tokens, updateBlockEntity, updateERC1155Balance } from "../utils";


export function handleAskNew(event: AskNew): void {
  let transaction = new MarketEvent1155(event.params.askId.toString() + ' - Ask')
  // const nft = ERC1155Token.load(event.params.tokenId.toString());
  const nft = fetchOrCreateERC1155Tokens(event.params.nft.toHexString(), event.params.tokenId.toString())
  log.warning('nft found: {}',[nft.id])
  if (nft) {
    transaction.operation = "Ask"
    transaction.from = event.params.seller.toHexString();
    transaction.to = null;
    transaction.nftId = nft.id.toString();
    transaction.quantity = event.params.quantity
    transaction.quoteToken = event.params.quoteToken.toHexString();
    transaction.price = event.params.pricePerUnit
    transaction.event = "AskNew"
    transaction.txHash = event.transaction.hash.toHexString();
    transaction.timestamp = event.block.timestamp;
    transaction.operationId = event.params.askId;
    transaction.address = event.params.nft.toHexString();
    updateBlockEntity(
      event, event.params.nft, event.params.tokenId,
      event.params.seller, Address.fromString(transaction.from!), 'AskNew', event.params.pricePerUnit,
      event.params.quantity, Address.fromString(transaction.quoteToken!)
    );
    transaction.save()
  }
}
export function handleOfferNew(event: OfferNew): void {
  let transaction = new MarketEvent1155(event.params.offerId.toString() + ' - Offer')
  const nft = fetchOrCreateERC1155Tokens(event.params.nft.toHexString(), event.params.tokenId.toString())
  log.warning('nft found: {}',[nft.id])
  if (nft) {
    transaction.operation = "Offer"
    transaction.to = event.params.buyer.toHexString();
    transaction.from = null;
    transaction.nftId = nft.id;
    transaction.quantity = event.params.quantity
    transaction.quoteToken = event.params.quoteToken.toHexString();
    transaction.price = event.params.pricePerUnit
    transaction.event = "Bid"
    transaction.txHash = event.transaction.hash.toHexString()
    transaction.timestamp = event.block.timestamp
    transaction.operationId = event.params.offerId;
    transaction.address = event.params.nft.toHexString();
    updateBlockEntity(
      event, event.params.nft, event.params.tokenId,
      Address.fromString(transaction.from!), event.params.buyer, 'AskNew', event.params.pricePerUnit,
      event.params.quantity, Address.fromString(transaction.quoteToken!)
    );
    transaction.save()
  }
}

export function handleAskCancel(event: AskCancel): void {
  let transaction = MarketEvent1155.load(event.params.askId.toString() + ' - Ask')
  if (transaction) {
    transaction.event = "AskCancel"
    if (transaction.from != null && transaction.nftId != null) {
      updateERC1155Balance(Address.fromString(transaction.from as string), transaction.nftId as string, transaction.quantity.times(BigInt.fromI32(-1)), event.address.toHex()); // Subtract value
    }
  if (!transaction || !transaction.nftId || !transaction.from) return;

  let nft = ERC1155Token.load(transaction.nftId!);
  if (!nft) return;

  let contract = ERC1155Contract.load(nft.contract);
  if (!contract) return;

  updateBlockEntity(
    event, Address.fromString(contract.id), BigInt.fromString(nft.tokenId),
    Address.fromString(transaction.from!), Address.fromString(transaction.to!), 'AskCancel', BigInt.fromI32(0),
    transaction.amounts, Address.fromString(transaction.quoteToken!)
  );
    transaction.save()
  }
}

export function handleOfferCancel(event: OfferCancel): void {
  let transaction = MarketEvent1155.load(event.params.offerId.toString() + ' - Offer')
  if (transaction) {
    transaction.event = "CancelBid"
    if (!transaction || !transaction.nftId || !transaction.from) return;

    let nft = ERC1155Token.load(transaction.nftId!);
    if (!nft) return;

    let contract = ERC1155Contract.load(nft.contract);
    if (!contract) return;

    updateBlockEntity(
      event, Address.fromString(contract.id), BigInt.fromString(nft.tokenId),
      Address.fromString(transaction.from!), Address.fromString(transaction.to!), 'AskCancel', BigInt.fromI32(0),
      transaction.amounts, Address.fromString(transaction.quoteToken!)
    );
    transaction.save()
  }
}

export function handleBuy(event: Buy): void {
  let transaction = MarketEvent1155.load(event.params.askId.toString() + ' - Ask');
  if (!transaction || !transaction.nftId || !transaction.from) return;

  let nft = ERC1155Token.load(transaction.nftId!);
  if (!nft) return;

  let contract = ERC1155Contract.load(nft.contract);
  if (!contract) return;

  updateBlockEntity(
    event, Address.fromString(contract.id), BigInt.fromString(nft.tokenId),
    Address.fromString(transaction.from!), event.params.buyer, 'Trade', event.params.price,
    event.params.quantity, Address.fromString(transaction.quoteToken!)
  );

  transaction.to = event.params.buyer.toHexString();
  transaction.quantity = transaction.quantity.minus(event.params.quantity);

  if (transaction.quantity && transaction.quantity.isZero()) {
    transaction.event = "Trade";
  } else {
    transaction.event = "AskNew";
  }

  if (transaction.from) {
    updateERC1155Balance(
      Address.fromString(transaction.from!), transaction.nftId!, 
      event.params.quantity.times(BigInt.fromI32(-1)), event.address.toHex()
    );
  }

  transaction.save();
}

export function handleAcceptOffer(event: OfferAccept): void {
  let transaction = MarketEvent1155.load(event.params.offerId.toString() + ' - Offer')
  if (!transaction || !transaction.nftId || !transaction.to) return;
  

    transaction.from = event.params.seller.toHexString();
    transaction.quantity = transaction.quantity.minus(event.params.quantity)
    // if (transaction.from != null && transaction.nftId != null) {
    //   updateERC1155Balance(Address.fromString(transaction.from as string), transaction.nftId as string, event.params.quantity.times(BigInt.fromI32(-1)), event.address.toHex()); // Subtract value
    // }
    if (transaction.quantity.isZero()) {
      transaction.event = "AcceptBid"
    } else {
      transaction.event = "Bid"
    }
    transaction.save()
    log.warning('Alo here: {}', [transaction.nftId!])

    let nft = ERC1155Token.load(transaction.nftId!);
    if (!nft) return;

    log.error('Here here1: {}', [nft.id, nft.contract])
    let contract = ERC1155Contract.load(nft.contract);
    if (!contract) return;

    log.error('Here here2: {}', [nft.id, contract.id])
    log.error('Here here3: {}', [transaction.from!])
    updateBlockEntity(
      event, Address.fromString(contract.id), BigInt.fromString(nft.tokenId),
      event.params.seller, Address.fromString(transaction.to!), 'AcceptBid', event.params.price,
      event.params.quantity, Address.fromString(transaction.quoteToken!)
    );
  }
