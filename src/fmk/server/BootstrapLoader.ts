import { MicroframeworkSettings } from "microframework";

export type BootstrapLoader = (settings?: MicroframeworkSettings) => Promise<any>;
