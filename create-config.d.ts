import type antfu from "@antfu/eslint-config";

type AntfuParams = Parameters<typeof antfu>;
type AntfuReturn = ReturnType<typeof antfu>;
type Options = AntfuParams[0];
type UserConfigs = AntfuParams[1][];
/**
 * @param options 针对antfu eslint config的特别配置
 * @param userConfigs 接下来的任意多个用户自定义eslint flat配置
 * @returns 给eslint使用的flat配置
 */
export default function createConfig(options?: Options | undefined, ...userConfigs: UserConfigs): AntfuReturn;
export {};
