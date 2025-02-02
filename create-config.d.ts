import type antfu from "@antfu/eslint-config";

type AntfuParams = Parameters<typeof antfu>;
type AntfuReturn = ReturnType<typeof antfu>;
type Options = AntfuParams[0];
type UserConfigs = AntfuParams[1][];
/**
 * @param options antfu eslint config options
 * @param userConfigs eslint flat config options
 * @returns generated eslint flat config
 */
export default function createConfig(options?: Options | undefined, ...userConfigs: UserConfigs): AntfuReturn;
export {};
