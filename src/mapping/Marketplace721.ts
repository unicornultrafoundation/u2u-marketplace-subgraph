import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import {
  AskNew,
  AskCancel,
  Trade,
  AcceptBid,
  Bid,
  CancelBid
} from "../../generated/ERC721Marketplace/ERC721Marketplace"
import { ERC721Token, MarketEvent721, MarketFee } from "../../generated/schema"
import { fetchOrCreateAccount, fetchOrCreateERC721Tokens, generateCombineKey, updateBlockEntity, updateOwnedTokenCount, updateTotalTransactionCollection, updateTotalVolume, updateTotalVolumeMarket } from "../utils";
import { ContractAddress, ContractName } from "../enum";
import { ProtocolFee } from "../../generated/ERC1155Marketplace/ERC1155Marketplace";

function createEvent(contract: Address, tokenId: BigInt, bidderAddr: Address | null = null): MarketEvent721 {
  if (!bidderAddr) {
    // let ev = MarketEvent721.load(contract.toHexString() + "-" + tokenId.toString());
    let id = generateCombineKey([contract.toHexString(), tokenId.toString()])
    let ev = MarketEvent721.load(id)
    if (!ev)
      return new MarketEvent721(id);
    else  
      return ev;
  } else {
    let id = generateCombineKey([contract.toHexString(), tokenId.toString(), bidderAddr.toHexString()])
    let ev = MarketEvent721.load(id);
    if (!ev)
      return new MarketEvent721(id);
    else  
      return ev;
  }
}

export function handleAskNew(event: AskNew): void {
  let ev = createEvent(event.params._nft, event.params._tokenId);
  // const nft = ERC721Token.load(generateCombineKey([event.params._nft.toString(), event.params._tokenId.toString()]));
  const nft = fetchOrCreateERC721Tokens(event.params._nft.toHexString(), event.params._tokenId.toString(), event.transaction.hash.toHexString(), event.params._seller.toHexString());

  if (nft) {
    let id = generateCombineKey([event.params._nft.toHexString(), event.params._tokenId.toString()]);
    const checkNFT = ERC721Token.load(id);
    log.info('creating new event', []);
    ev.event = "AskNew";
    ev.timestamp = event.block.timestamp;
    ev.address = event.params._nft.toHexString();
    ev.txHash = event.transaction.hash.toHex();
    ev.from = event.params._seller.toHexString();
    ev.to = null;
    ev.nftId = nft.id;
    ev.quoteToken = event.params._quoteToken. toHexString();
    ev.price = event.params._price;
    // extend
    ev.nftIdExtend = generateCombineKey([event.params._nft.toHexString(), event.params._tokenId.toString()]);
    ev.tokenId = event.params._tokenId.toString();
    ev.addressExtend = event.params._nft.toHexString();
    ev.flagExtend = false;
    if(checkNFT == null){
      ev.flagExtend = true;
    }
    updateBlockEntity(event, event.params._nft, event.params._tokenId, event.params._seller, Address.fromString(ContractAddress.ZERO), 'AskNew', event.params._price, BigInt.fromI32(1), event.params._quoteToken);
    ev.save();
    let account = fetchOrCreateAccount(event.params._seller);
    account.onSaleCount = account.onSaleCount.plus(BigInt.fromI32(1));
    account.save();
  }
}

export function handleAskCancel(event: AskCancel): void {
  let ev = createEvent(event.params._nft, event.params._tokenId);
  const nft = fetchOrCreateERC721Tokens(event.params._nft.toHexString(), event.params._tokenId.toString(), event.transaction.hash.toHexString(), event.params._seller.toHexString());

  if (nft) {
    ev.event = "AskCancel";
    ev.timestamp = event.block.timestamp;
    ev.address = event.params._nft.toHexString();
    ev.txHash = event.transaction.hash.toHexString();
    ev.from = event.params._seller.toHexString();
    ev.nftId = nft.id;
    updateBlockEntity(event, event.params._nft, event.params._tokenId, event.params._seller, Address.fromString(ContractAddress.ZERO), 'AskCancel', BigInt.fromI32(0), BigInt.fromI32(1), Address.fromString(ev.quoteToken!));
    ev.save();
    let account = fetchOrCreateAccount(event.params._seller);
    account.onSaleCount = account.onSaleCount.minus(BigInt.fromI32(1));
    account.save();
  }
}

export function handleTrade(event: Trade): void {
  let ev = createEvent(event.params._nft, event.params._tokenId);
  const nft = fetchOrCreateERC721Tokens(event.params._nft.toHexString(), event.params._tokenId.toString(), event.transaction.hash.toHexString(), event.params.buyer.toHexString());

  if (nft) {
    let id = generateCombineKey([event.params._nft.toHexString(), event.params._tokenId.toString()]);
    const checkNFT = ERC721Token.load(id);
    ev.event = "Trade";
    ev.timestamp = event.block.timestamp;
    ev.address = event.params._nft.toHexString();
    ev.txHash = event.transaction.hash.toHexString();
    ev.from = event.params._seller.toHexString();
    ev.to = event.params.buyer.toHexString();
    ev.nftId = nft.id;
    ev.quoteToken = event.params._quoteToken.toHexString();
    ev.price = event.params._price;
    ev.netPrice = event.params._netPrice;
    // extend
    ev.nftIdExtend = generateCombineKey([event.params._nft.toHexString(), event.params._tokenId.toString()]);
    ev.tokenId = event.params._tokenId.toString();
    ev.addressExtend = event.params._nft.toHexString();
    ev.flagExtend = false;
    if(checkNFT == null){
      ev.flagExtend = true;
    }
    updateBlockEntity(event, event.params._nft, event.params._tokenId, event.params._seller, event.params.buyer, 'Trade', event.params._price, BigInt.fromI32(1), event.params._quoteToken);
    updateOwnedTokenCount(event.params.buyer.toHexString(), event.params._nft.toHexString(), true, event.block.timestamp)
    updateOwnedTokenCount(event.params._seller.toHexString(), event.params._nft.toHexString(), false, event.block.timestamp)
    updateTotalVolume(event.params._nft, ContractName.ERC_721, event.params._price)
    updateTotalVolumeMarket(event.address, ContractName.ERC_721, event.params._netPrice,BigInt.fromI32(1))
    updateTotalTransactionCollection(nft.contract, ContractName.ERC_721)
    ev.save();
    let account = fetchOrCreateAccount(event.params._seller);
    account.onSaleCount = account.onSaleCount.minus(BigInt.fromI32(1));
    account.save();
  }
}

export function handleAcceptBid(event: AcceptBid): void {
  let ev = createEvent(event.params._nft, event.params._tokenId, event.params.bidder);
  let evAsk = MarketEvent721.load(generateCombineKey([event.params._nft.toString(), event.params._tokenId.toString()]));
  const nft = fetchOrCreateERC721Tokens(event.params._nft.toHexString(), event.params._tokenId.toString(), event.transaction.hash.toHexString(), event.params.bidder.toHexString());
  if (nft) {
    let id = generateCombineKey([event.params._nft.toHexString(), event.params._tokenId.toString()]);
    const checkNFT = ERC721Token.load(id);
    ev.txHash = event.transaction.hash.toHexString();
    ev.timestamp = event.block.timestamp;
    ev.address = event.params._nft.toHexString();
    ev.event = "AcceptBid";
    ev.from = event.params._seller.toHexString();
    ev.to = event.params.bidder.toHexString();
    ev.nftId = nft.id;
    ev.quoteToken = event.params._quoteToken.toHexString();
    ev.price = event.params._price;
    ev.netPrice = event.params._netPrice;
    // extend
    ev.nftIdExtend = generateCombineKey([event.params._nft.toHexString(), event.params._tokenId.toString()]);
    ev.tokenId = event.params._tokenId.toString();
    ev.addressExtend = event.params._nft.toHexString();
    ev.flagExtend = false;
    if(checkNFT == null){
      ev.flagExtend = true;
    }
    updateBlockEntity(event, event.params._nft, event.params._tokenId, event.params._seller, event.params.bidder, 'AcceptBid', event.params._price, BigInt.fromI32(1), event.params._quoteToken);
    updateTotalVolume(event.params._nft, ContractName.ERC_721, event.params._price)
    updateTotalVolumeMarket(event.address, ContractName.ERC_721, event.params._netPrice,BigInt.fromI32(1))
    updateTotalTransactionCollection(nft.contract, ContractName.ERC_721)
    ev.save();
  }
  if (evAsk && evAsk.event == "AskNew") {
    evAsk.event = "AskCancel";
    evAsk.timestamp = event.block.timestamp;
    evAsk.address = event.params._nft.toHexString();
    evAsk.txHash = event.transaction.hash.toHexString();
    evAsk.save()
  }
}

export function handleBid(event: Bid): void {
  let ev = createEvent(event.params._nft, event.params._tokenId, event.params.bidder);
  const nft = fetchOrCreateERC721Tokens(event.params._nft.toHexString(), event.params._tokenId.toString(), event.transaction.hash.toHexString(), event.params.bidder.toHexString());
  if (nft) {
    let id = generateCombineKey([event.params._nft.toHexString(), event.params._tokenId.toString()]);
    const checkNFT = ERC721Token.load(id);
    ev.event = "Bid";
    ev.timestamp = event.block.timestamp;
    ev.address = event.params._nft.toHexString();
    ev.txHash = event.transaction.hash.toHexString();
    ev.to = event.params.bidder.toHexString();
    ev.from = null;
    ev.nftId = nft.id;
    ev.quoteToken = event.params._quoteToken.toHexString();
    ev.price = event.params._price;
    // extend
    ev.nftIdExtend = generateCombineKey([event.params._nft.toHexString(), event.params._tokenId.toString()]);
    ev.tokenId = event.params._tokenId.toString();
    ev.addressExtend = event.params._nft.toHexString();
    ev.flagExtend = false;
    if(checkNFT == null){
      ev.flagExtend = true;
    }
    updateBlockEntity(event, event.params._nft, event.params._tokenId, Address.fromString(ContractAddress.ZERO), event.params.bidder, 'Bid', event.params._price, BigInt.fromI32(1), event.params._quoteToken);
    ev.save();
  }
}

export function handleCancelBid(event: CancelBid): void {
  let ev = createEvent(event.params._nft, event.params._tokenId, event.params.bidder);
  const nft = fetchOrCreateERC721Tokens(event.params._nft.toHexString(), event.params._tokenId.toString(), event.transaction.hash.toHexString(), event.params.bidder.toHexString());
  if (nft) {
    let id = generateCombineKey([event.params._nft.toHexString(), event.params._tokenId.toString()]);
    const checkNFT = ERC721Token.load(id);
    ev.timestamp = event.block.timestamp;
    ev.txHash = event.transaction.hash.toHexString();
    ev.address = event.params._nft.toHexString();
    ev.event = "CancelBid";
    ev.to = event.params.bidder.toHexString();
    ev.nftId = nft.id;
    // extend
    ev.nftIdExtend = generateCombineKey([event.params._nft.toHexString(), event.params._tokenId.toString()]);
    ev.tokenId = event.params._tokenId.toString();
    ev.addressExtend = event.params._nft.toHexString();
    ev.flagExtend = false;
    if(checkNFT == null){
      ev.flagExtend = true;
    }
    updateBlockEntity(event, event.params._nft, event.params._tokenId, Address.fromString(ContractAddress.ZERO), event.params.bidder, 'CancelBid', BigInt.fromI32(0), BigInt.fromI32(1), Address.fromString(ev.quoteToken!));
    ev.save();
  }
}

export function handleGetFee(event: ProtocolFee): void {
  let marketFee = MarketFee.load(event.address.toHexString());
  if(marketFee){
    marketFee.totalFee = marketFee.totalFee.plus(event.params.protocolFee);
    marketFee.save()
  }else{
    let newMarketplaceFee = new MarketFee(event.address.toHexString());
    newMarketplaceFee.totalFee = BigInt.fromI32(0);
    newMarketplaceFee.type = ContractName.ERC_721
    newMarketplaceFee.save()
  }
}