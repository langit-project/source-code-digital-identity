import NetworkConfigInterface from "./NetworkConfigInterface";
//import MarketplaceConfigInterface from "./MarketplaceConfigInterface";

export default interface CollectionConfigInterface {
    testnet: NetworkConfigInterface;
    mainnet: NetworkConfigInterface;
    contractName: string;
    contractAddress: string|null;
    implementationContract: string|null;
    tokenContract: string|null;
    admin: string|null;
    pantera: string|null;
    majelis: string|string;
    //marketplaceIdentifier: string;
    //marketplaceConfig: MarketplaceConfigInterface;
};