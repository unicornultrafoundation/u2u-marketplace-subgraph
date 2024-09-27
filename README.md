## Description
The NFT Marketplace Subgraph is a specialized indexing system built on decentralized infrastructure to efficiently capture and manage events occurring within a smart contract powering an NFT marketplace. This subgraph monitors and extracts essential data from events such as NFT creation, transfers, sales, and auctions, organizing it into a structured format for easy querying and analysis.

## Installation/Development

Please follow the official [documentation](https://thegraph.com/docs/en/quick-start/).

## Running the app
```bash
# mapping value in config `u2uTestnet.json` and teamplate.yaml to generate file subgraph.yaml
$ yarn prepare:testnet

# mapping value in config `u2u.json` and teamplate.yaml to generate file subgraph.yaml
$ yarn prepare:mainnet

# to generate from schema.graphql to folder generated
$ yarn codegen

# to compile code in mapping to tracking event smart contract, compile schema if it change 
$ yarn build 

# to create a node in your local (just running it in first time)
$ yarn create-local

# to deploy code compiled, schema change to your node local 
$ yarn deploy-local

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Entities

**Deal** - represents the `Buy` event
- **type** - deal initiation method (`Order` or `Bid`)
- **seller** - seller's address
- **buyer** - buyer's address
- **sellTokenId** - token to sell id
- **sellToken** - token to sell address
- **buyToken** - token to buy address
- **sellAmount** - amount of `sellToken`
- **buyAmount** - amount of `buyToken`
- **price** - price in a `buyToken` currency
- **fee** - fee in a `buyToken` currency
- **txHash** - transaction hash
- **blockNumber** - number of the block
- **blockTime** - timestamp of the block
- **contract** - `ContractType`

**Account** - represents for each User (Wallet)
- **id** - index of the user
- **asERC1155** - `ERC1155Contract`
- **ERC1155balances** - `ERC1155balances`
- **ERC1155transferFromEvent** - `ERC1155transferFromEvent`
- **ERC1155transferToEvent** - `ERC1155transferToEvent`
- **events** - `Event`
- **asERC721** - `ERC721Contract`
- **ERC721tokens** - `ERC721tokens`
- **ERC721transferFromEvent** - `ERC721transferFromEvent`
- **ERC721transferToEvent** - `ERC721transferToEvent`
- **OwnedTokens** - `OwnedTokens`
- **OnSaleStatus1155** - `OnSaleStatus1155`
- **onSaleCount** - number of nft on sales
- **holdingCount** - number of nft owner by user

**ERC721Contract** - represents for collection nft type ERC721
- **id** - index of collection
- **asAccount** - `Account`
- **supportsMetadata** - check true false supports Metadata
- **name** - name of collection
- **symbol** - a shorthand representation of a particular cryptocurrency asset
- **tokens** - `ERC721Token`
- **transfers** - `ERC721Transfer`
- **txCreation** - creation hash of this collection
- **count** - number of nft created in this collection
- **holderCount** - number of owner of this collection
- **createAt** - time this collection create
- **volume** - the amount of data stored
 
**ERC721Token** - represents for nft type ERC721
- **id** - index of nft
- **tokenId** - token id of nft
- **contract** - `ERC721Contract`
- **identifier** - token id of nft
- **owner** - `Account`
- **approval** - `Account`
- **uri** - it's a string of characters that provides a standardized way to identify and access a resource
- **transfers** - `ERC721Transfer`
- **creators** - `ERC721Creator`
- **txCreation** - creation hash of this NFT
- **createAt** - the time this nft was created

**ERC721Transfer** - represents for each transfer each nft
- **id** - index of transfer
- **emitter** - `Account`
- **transaction** - `Transaction`
- **timestamp** - the time this trasnfer was created
- **contract** - `ERC721Contract`
- **token** - `ERC721Token`
- **from** - `Account`
- **to** - `Account`


**ERC1155Contract** - represents for collection nft type ERC1155
- **id** - index of collection
- **asAccount** - `Account`
- **name** - name of collection
- **symbol** - a shorthand representation of a particular cryptocurrency asset
- **tokens** - `ERC1155Token`
- **balances** - `ERC1155Balance`
- **transfers** - `ERC1155Transfer`
- **txCreation** - creation hash of this collection
- **count** - number of nft created in this collection
- **holderCount** - number of owner of this collection
- **createAt** - time this collection create
- **volume** - the amount of data stored

**ERC1155Creator** - represents for creator of collection type ERC1155
- **id** - combination of collectionId and creatorId
- **collection** - `ERC1155Token`
- **creator** - `Creator`
- **share** - the creator's share in the collection

**ERC721Creator** - represents for creator of collection type ERC721
- **id** - combination of collectionId and creatorId
- **collection** - `ERC721Token`
- **creator** - `Creator`
- **share** - the creator's share in the collection

**Creator** - represents for creator
- **id** - index of creator
- **token1155** `ERC1155Creator`
- **token721** `ERC721Creator`

**ERC1155Token** - represents for nft type ERC1155
- **id** - index of nft
- **tokenId** - token id of nft
- **contract** - `ERC1155Contract`
- **uri** - it's a string of characters that provides a standardized way to identify and access a resource
- **totalSupply** - `ERC1155Balance`
- **balances** - `ERC1155Balance`
- **transfers** - `ERC1155Transfer`
- **creators** - `ERC1155Creator`
- **txCreation** - creation hash of this NFT
- **createAt** - the time this nft was created

**ERC1155Balance** - represents for value of nft 
- **id** - index of balance
- **contract** - `ERC1155Contract`
- **token** - `ERC1155Token`
- **account** - `Account`
- **value** - the number of nft
- **valueExact** - the number exactly of nft
- **transferFromEvent** - `ERC1155Transfer`
- **transferToEvent** - `ERC1155Transfer`

**ERC1155Transfer** - represents for each transfer each nft
- **id** - index of transfer
- **emitter** - `Account`
- **transaction** - `Transaction`
- **timestamp** - the time this trasnfer was created
- **contract** - `ERC1155Contract`
- **token** - `ERC1155Token`
- **from** - `Account`
- **fromBalance** - `ERC1155Balance`
- **to** - `Account`
- **toBalance** - `ERC1155Balance`
- **value** - the number of nft transferred
- **valueExact** - the number exactly of nft transferred 

**Event** - represents for each event
- **id** - index of event
- **transaction** - `Transaction`
- **emitter** - `Account`
- **timestamp** - the time event was created

**Transaction** - represents for each transaction
- **id** - index of transaction
- **timestamp** - the time transaction was created
- **blockNumber** - block number for this transaction

**MarketEvent721** - represents interaction events for ERC721
- **id** - index of the events
- **txHash** - a unique identifier generated by a cryptographic hash
- **event** - `SellStatus`
- **address** - address of the ERC721 contract
- **nftId** - token ID in ERC721
- **from** - address of the sender
- **to** - address of the receiver
- **timestamp** - timestamp of event
- **price** - price
- **netPrice** - net price
- **quoteToken** - a nominator for the price when you are buying or selling

**MarketEvent1155** - represents interaction events for ERC1155
- **id** - index of the events
- **txHash** - a unique identifier generated by a cryptographic hash
- **event** - `SellStatus`
- **operation** - `Operation`
- **address** - address of the ERC1155 contract
- **nftId** - token ID in ERC1155
- **from** - address of the sender
- **to** - address of the receiver
- **timestamp** - timestamp of event
- **price** - price per unit
- **netPrice** - net price per unit
- **quoteToken** - a nominator for the price when you are buying or selling
- **quantity** - Number of tokens involved in the transaction
- **operationId** - For ERC1155 only

**Block** - represents the ethereum block
- **id** - index of the block
- **blockNumber** - number of the block
- **blockTime** - timestamp of the block
- **tokenId** - token id of nft
- **event** - `EventType`
- **address** - address of contract
- **to** - address of account
- **from** - address of account
- **quantity** - number of token
- **price** - price of token
- **quoteToken** - a nominator for the price when you are buying or selling

**RoyaltiesRegistry** - represents the royalties of nft
- **id** - index of the royalties
- **tokenId** - token id of nft
- **account** - address of account
- **value** - royalties of nft
- **collectionId** -


**Counter** - counter for each `ContractType`
- **count** -  number of events under the specified `contract`
- **firstBlock** - `Block` of the first event
- **lastBlock** - `Block` of the last event
- **contract** - `ContractType`

**OwnedTokenCount**, **AccountCollectionOwnership**, **OnSaleStatus1155** => These 3 contracts serve as middlestate for other function

## Enumerations

**Operation** - enumerates operation
- **Ask**
- **Offer**

**SellStatus** - enumerates sell status
- **AskNew**
- **AskCancel**
- **Trade**
- **AcceptBid**
- **Bid**
- **CancelBid**

**EventType** - enumerates event type
- **Mint**
- **Transfer**
- **Trade**
- **AcceptBid**
- **AskNew**
- **AskCancel**
- **Bid**
- **CancelBid**

**DealType** - enumerates deal initiation methods
- **Order**
- **Bid**


## Suggestions

You are welcome to [report bugs found](https://github.com/unicornultrafoundation/u2u-marketplace-subgraph/issues)!

## License

Protocol subgraph is available under [MIT License](LICENSE.md).