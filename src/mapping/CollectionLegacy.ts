
import { Create721RaribleUserProxy as Create721Legacy, CreateERC721RaribleUser } from "../../generated/ERC721FactoryLegacy/ERC721LegacyFactory";
import { Account, ERC721Contract, ERC721Token } from "../../generated/schema";
import { NFTLegacy } from "../../generated/templates";
import { fetchOrCreateAccount, generateCombineKey, updateBlockEntity, updateContractCount } from "../utils";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
// import {  ERC721Proxy as erc721Contract} from '../../generated/templates/ERC721Proxy/ERC721Proxy'
import { NFTLegacy as erc721Contract } from "../../generated/templates/NFTLegacy/NFTLegacy";
import {ERC721LegacyFactory as factoryContract } from "../../generated/ERC721FactoryLegacy/ERC721LegacyFactory"
import { ContractAddress } from "../enum";

export function handle721UserProxyLegacy(event: Create721Legacy): void {
    let newToken = new ERC721Contract(event.params.proxy.toHexString());
    newToken.asAccount = fetchOrCreateAccount(event.transaction.from).id;
    newToken.txCreation = event.transaction.hash.toHexString();
    newToken.count = BigInt.fromI32(0);
    newToken.holderCount = BigInt.fromI32(0);
    newToken.transactionCount = BigInt.fromI32(0);
    newToken.volume = BigInt.fromI32(0);
    newToken.createAt = event.block.timestamp;
    NFTLegacy.create(event.params.proxy);
    newToken.save();
    const contractFactory = factoryContract.bind(event.address)
    let limit = contractFactory.maxTokenIds(event.params.proxy);
    const contract = factoryContract.bind(event.params.proxy)
    let owner = Address.fromString(ContractAddress.ZERO);
    for (let i = 1; i <= limit.toI32(); i++) {
        const ownerResult = contract.try_ownerOf(BigInt.fromI32(i));
        if (ownerResult.reverted) {
            log.warning("revert reason:", []);
        }
        else {
            owner = ownerResult.value;
        }
        let tokenId = generateCombineKey([event.params.proxy.toHexString(), i.toString()]);
        let token = ERC721Token.load(tokenId);
        if (token == null) {
            token = new ERC721Token(tokenId);
            token.tokenId = i.toString();
            token.contract = event.params.proxy.toHexString();
            token.identifier = BigInt.fromI32(i);
            token.owner = fetchOrCreateAccount(owner).id
            token.txCreation = event.transaction.hash.toHexString()
            token.createAt = event.block.timestamp;
            updateBlockEntity(event, event.params.proxy, BigInt.fromI32(i), Address.fromString(ContractAddress.ZERO), owner, 'Mint', BigInt.fromI32(0), BigInt.fromI32(1), Address.fromString(ContractAddress.ZERO));
            updateContractCount(event.params.proxy.toHexString(), BigInt.fromI32(1), 'ERC721');    
            // Set the approval to the zero address when the token is minted
            let zeroAccount = fetchOrCreateAccount(Address.fromString(ContractAddress.ZERO));
            token.approval = zeroAccount.id;
            token.uri = ""; // Set the URI based on your logic
            token.save();
          }
    }
}

// export function handle721UserRaribleLegacy(event: CreateERC721RaribleUser): void {
//     let collection = ERC721Contract.load(event.address.toHexString());
//     if (collection !== null) {
//         collection.name = event.params.name;
//         collection.symbol = event.params.symbol;
//         collection.count = BigInt.fromI32(0);
//         collection.holderCount = BigInt.fromI32(0);
//         collection.save();
//     }
//     else {
//         let newCollection = new ERC721Contract(event.address.toHexString());
//         newCollection.name = event.params.name;
//         newCollection.symbol = event.params.symbol;
//         newCollection.txCreation = event.transaction.hash.toHexString();
//         newCollection.asAccount = fetchOrCreateAccount(event.transaction.from).id;;
//         newCollection.count = BigInt.fromI32(0);
//         newCollection.holderCount = BigInt.fromI32(0);
//         newCollection.save()
//     }
// }

