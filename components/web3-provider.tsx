"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type React from "react"

// Define types for our context
type Web3ContextType = {
  account: string | null
  chainId: number | null
  chainName: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnecting: boolean
  isConnected: boolean
}

// Create context with default values
const Web3Context = createContext<Web3ContextType>({
  account: null,
  chainId: null,
  chainName: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnecting: false,
  isConnected: false,
})

// Hook to use the Web3 context
export const useWeb3 = () => useContext(Web3Context)

// Chain names mapping
const chainNames: Record<number, string> = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  137: "Polygon Mainnet",
  80001: "Mumbai Testnet",
  42161: "Arbitrum One",
  10: "Optimism",
  56: "BNB Smart Chain",
  43114: "Avalanche C-Chain",
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [chainName, setChainName] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== "undefined" && window.ethereum !== undefined
  }

  // Handle account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("Accounts changed:", accounts)
      if (accounts.length === 0) {
        // User disconnected
        setAccount(null)
        setIsConnected(false)
      } else {
        setAccount(accounts[0])
        setIsConnected(true)
      }
    }

    const handleChainChanged = (chainIdHex: string) => {
      console.log("Chain changed:", chainIdHex)
      const newChainId = Number.parseInt(chainIdHex, 16)
      setChainId(newChainId)
      setChainName(chainNames[newChainId] || `Chain ID: ${newChainId}`)
    }

    // Subscribe to events
    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    // Check if already connected
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        console.log("Initial accounts:", accounts)
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)

          // Get current chain
          return window.ethereum.request({ method: "eth_chainId" })
        }
      })
      .then((chainIdHex: string) => {
        if (chainIdHex) {
          console.log("Initial chainId:", chainIdHex)
          const chainId = Number.parseInt(chainIdHex, 16)
          setChainId(chainId)
          setChainName(chainNames[chainId] || `Chain ID: ${chainId}`)
        }
      })
      .catch((error) => {
        console.error("Error checking initial connection:", error)
      })

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  // Connect wallet function
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      window.open("https://metamask.io/download/", "_blank")
      return
    }

    setIsConnecting(true)
    try {
      console.log("Requesting accounts...")
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      console.log("Accounts received:", accounts)

      setAccount(accounts[0])
      setIsConnected(true)

      // Get current chain
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      })
      console.log("Chain ID received:", chainIdHex)

      const chainId = Number.parseInt(chainIdHex, 16)
      setChainId(chainId)
      setChainName(chainNames[chainId] || `Chain ID: ${chainId}`)
    } catch (error) {
      console.error("Error connecting wallet:", error)
      alert("Failed to connect wallet. Please make sure MetaMask is unlocked and try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet function (note: this doesn't actually disconnect MetaMask,
  // it just clears the local state)
  const disconnectWallet = () => {
    setAccount(null)
    setIsConnected(false)
  }

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        chainName,
        connectWallet,
        disconnectWallet,
        isConnecting,
        isConnected,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

// Add this to the global Window interface
declare global {
  interface Window {
    ethereum?: any
  }
}

