import CollectionConfigInterface from "../lib/CollectionConfigInterface";
import * as Networks from "../lib/Networks";
import contractPayment from "./contractPayment.json";
// import * as Marketpalce from "../lib/Marketplaces";

const CollectionConfig: CollectionConfigInterface = {
    testnet: Networks.polygonTestnet,
    mainnet: Networks.polygonMainnet,
    contractName: "SengketaContract",
    contractAddress: "0x44b74c7dC45849011589f8C13df5135761cf57Ff",
    implementationContract: "0x7192F435373157491a3E67AAA7A1C6779c911FEe",
    tokenContract: "0x121A3638977f7870f25F664C004a8c84969A925d",
    admin: "0xB10436d45264bd7c929B55B2F04bea53081abeFb",
    pantera: "0xB940062cf4afb9068623F23d974E02268015186a",
    majelis: "0x95f786d6A46d51b19Ef888Ccb7a3712B43516E5a"
    // marketplaceIdentifier: "market-place-identifier",
    // marketplaceConfig: Marketpalce.openSea
};

export default CollectionConfig;