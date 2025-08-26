// src/config/appkit.js
import { createAppKit } from "@reown/appkit/react";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet, polygon, arbitrum, optimism } from "@reown/appkit/networks";
import { defineChain } from '@reown/appkit/networks';

// 1. Get projectId from Reown Dashboard
const projectId = process.env.REACT_APP_REOWN_PROJECT_ID || "92cb38a15cfb30ee3043cf276483c6f9";

const opnNetwork = defineChain({
  id: 984,
  caipNetworkId: 'eip155:123456789',
  chainNamespace: 'eip155',
  name: 'OPN Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'OPN',
    symbol: 'OPN',
  },
  rpcUrls: {
    default: {
      http: ['https://val1.iopn.pectra.zeeve.net/'],
      webSocket: ['https://val1.iopn.pectra.zeeve.net/'],
    },
  },
  blockExplorers: {
    default: { name: 'OPN Explorer', url: 'https://testnet.iopn.tech/' },
  },
  contracts: {
    // Add the contracts here
  }
})


// 2. Create metadata
const metadata = {
  name: "OPN Fractionalization",
  description: "Luxury Asset Fractionalization Platform",
  url: window.location.origin, // dynamically set based on deployment
  icons: ["/logo.png"], // Add your logo to public folder
};

// 3. Create the AppKit instance
export const appKit = createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata: metadata,
  networks: [opnNetwork],
  projectId,
  features: {
    analytics: true,
    email: true, // Enable email wallet creation
    socials: ['google', 'apple', 'discord', 'github'], // Social logins
  },
  themeMode: 'dark', // Match our dark theme
  themeVariables: {
    '--wck-font-family': 'Inter, sans-serif',
    '--wck-accent': '#ffffff',
    '--wck-bg-1': '#000000',
    '--wck-bg-2': '#0a0a0a',
    '--wck-bg-3': '#141414',
    '--wck-fg-1': '#ffffff',
    '--wck-fg-2': '#a3a3a3',
    '--wck-fg-3': '#737373',
    '--wck-border-1': '#262626',
    '--wck-success': '#22c55e',
    '--wck-warning': '#fbbf24',
    '--wck-error': '#ef4444',
    '--wck-border-radius': '2px',
  },
  
 
});