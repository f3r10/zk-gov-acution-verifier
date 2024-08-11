'use client';

import { http, createStorage, cookieStorage, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'

const projectId = 'c0853b85d4dedf6071cf77bc81b246e6';

const supportedChains: Chain[] = [sepolia];

export const config = createConfig({
   appName: 'WalletConnection',
   projectId,
   chains: supportedChains as any,
   ssr: true,
   storage: createStorage({
    storage: cookieStorage,
   }),
  transports: supportedChains.reduce((obj, chain) => ({ ...obj, [chain.id]: http() }), {})
 });
