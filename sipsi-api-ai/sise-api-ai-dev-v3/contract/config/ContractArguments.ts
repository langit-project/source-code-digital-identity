// import { utils } from "ethers";
import CollectionConfig from "./CollectionConfig";

const ContractArguments = [
    CollectionConfig.admin,
    CollectionConfig.pantera,
    CollectionConfig.majelis
] as const;

export default ContractArguments;