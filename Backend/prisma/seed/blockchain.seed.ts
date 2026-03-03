/**
 * Blockchain Roadmap Seed Script
 *
 * Seeds the Blockchain development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/blockchain.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// Blockchain Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'blockchain', name: 'Blockchain', description: 'Complete Blockchain development roadmap', difficulty: Difficulty.BEGINNER, sortOrder: 0 },

  // ==== PREREQUISITES (Left side - Personal Recommendation) ====
  { slug: 'what-is-blockchain', name: 'What is Blockchain', description: 'Introduction to blockchain technology', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'decentralization', name: 'Decentralization', description: 'Decentralization principles and concepts', difficulty: Difficulty.BEGINNER, sortOrder: 2 },
  { slug: 'why-it-matters', name: 'Why it matters?', description: 'Why blockchain technology matters', difficulty: Difficulty.BEGINNER, sortOrder: 3 },
  { slug: 'mining-incentive-models', name: 'Mining and Incentive Models', description: 'Mining concepts and incentive mechanisms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },
  { slug: 'decentralization-vs-trust', name: 'Decentralization vs Trust', description: 'Comparing decentralization with trust models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'blockchain-forking', name: 'Blockchain Forking', description: 'Hard forks and soft forks in blockchain', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },
  { slug: 'cryptocurrencies', name: 'Cryptocurrencies', description: 'Cryptocurrency fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },
  { slug: 'cryptowallets', name: 'Cryptowallets', description: 'Cryptocurrency wallet types and security', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },

  // ==== STORAGE ====
  { slug: 'storage', name: 'Storage', description: 'Blockchain storage mechanisms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },

  // ==== BASIC BLOCKCHAIN KNOWLEDGE ====
  { slug: 'basic-blockchain-knowledge', name: 'Basic Blockchain Knowledge', description: 'Fundamental blockchain concepts', difficulty: Difficulty.BEGINNER, sortOrder: 10 },
  { slug: 'blockchain-structure', name: 'Blockchain Structure', description: 'Block structure and chain organization', difficulty: Difficulty.BEGINNER, sortOrder: 11 },
  { slug: 'basic-blockchain-operations', name: 'Basic Blockchain Operations', description: 'Basic operations on blockchain', difficulty: Difficulty.BEGINNER, sortOrder: 12 },
  { slug: 'applications-uses', name: 'Applications and Uses', description: 'Blockchain applications and use cases', difficulty: Difficulty.BEGINNER, sortOrder: 13 },

  // ==== GENERAL BLOCKCHAIN KNOWLEDGE ====
  { slug: 'general-blockchain-knowledge', name: 'General Blockchain Knowledge', description: 'Advanced blockchain concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },
  { slug: 'cryptography', name: 'Cryptography', description: 'Cryptographic principles in blockchain', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'consensus-protocols', name: 'Consensus Protocols', description: 'Consensus mechanisms and protocols', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'blockchain-interoperability', name: 'Blockchain Interoperability', description: 'Cross-chain communication and interoperability', difficulty: Difficulty.ADVANCED, sortOrder: 17 },

  // ==== BLOCKCHAINS ====
  { slug: 'blockchains', name: 'Blockchains', description: 'Different blockchain platforms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  
  // EVM-Based Blockchains
  { slug: 'evm-based', name: 'EVM-Based', description: 'Ethereum Virtual Machine based blockchains', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'ethereum', name: 'Ethereum', description: 'Ethereum blockchain platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'polygon', name: 'Polygon', description: 'Polygon Ethereum scaling solution', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'binance-smart-chain', name: 'Binance Smart Chain', description: 'BSC blockchain network', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'gnosis-chain', name: 'Gnosis Chain', description: 'Gnosis blockchain network', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'huobi-eco-chain', name: 'Huobi Eco Chain', description: 'Huobi blockchain network', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'avalanche', name: 'Avalanche', description: 'Avalanche blockchain platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'fantom', name: 'Fantom', description: 'Fantom blockchain network', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },

  // TVM-Based Blockchains
  { slug: 'tvm-based', name: 'TVM-Based', description: 'TVM based blockchains', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'venom', name: 'Venom', description: 'Venom blockchain', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'ton', name: 'TON', description: 'TON blockchain network', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },

  // Other Blockchains
  { slug: 'evercale', name: 'Evercale', description: 'Evercale blockchain', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'gosh', name: 'Gosh', description: 'Gosh decentralized platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'l2-blockchains', name: 'L2 Blockchains', description: 'Layer 2 scaling solutions', difficulty: Difficulty.ADVANCED, sortOrder: 32 },
  { slug: 'arbitrum', name: 'Arbitrum', description: 'Arbitrum Layer 2 solution', difficulty: Difficulty.ADVANCED, sortOrder: 33 },
  { slug: 'moonbeam-moonriver', name: 'Moonbeam / Moonriver', description: 'Moonbeam and Moonriver parachains', difficulty: Difficulty.ADVANCED, sortOrder: 34 },

  // ==== ORACLES ====
  { slug: 'oracles', name: 'Oracles', description: 'Blockchain oracles and external data', difficulty: Difficulty.ADVANCED, sortOrder: 35 },
  { slug: 'hybrid-smart-contracts', name: 'Hybrid Smart Contracts', description: 'Hybrid smart contract patterns', difficulty: Difficulty.ADVANCED, sortOrder: 36 },
  { slug: 'chainlink', name: 'Chainlink', description: 'Chainlink oracle network', difficulty: Difficulty.ADVANCED, sortOrder: 37 },
  { slug: 'oracle-networks', name: 'Oracle Networks', description: 'Other oracle network solutions', difficulty: Difficulty.ADVANCED, sortOrder: 38 },

  // ==== SMART CONTRACTS ====
  { slug: 'smart-contracts', name: 'Smart Contracts', description: 'Smart contract development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'programming-languages', name: 'Programming Languages', description: 'Smart contract programming languages', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'solidity', name: 'Solidity', description: 'Solidity smart contract language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'vyper', name: 'Vyper', description: 'Vyper smart contract language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'rust', name: 'Rust', description: 'Rust programming language for blockchain', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  { slug: 'brownie', name: 'Brownie', description: 'Brownie smart contract framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'foundry', name: 'Foundry', description: 'Foundry smart contract development kit', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'hardhat', name: 'Hardhat', description: 'Hardhat smart contract development environment', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'truffle', name: 'Truffle', description: 'Truffle smart contract framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },

  // ==== SMART CONTRACT FRAMEWORKS ====
  { slug: 'smart-contract-frameworks', name: 'Smart Contract Frameworks', description: 'Smart contract development frameworks', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },

  // ==== IDES ====
  { slug: 'ides', name: 'IDEs', description: 'Integrated development environments for blockchain', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },

  // ==== TESTING ====
  { slug: 'testing', name: 'Testing', description: 'Smart contract testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'unit-tests', name: 'Unit Tests', description: 'Unit testing smart contracts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },
  { slug: 'integration-tests', name: 'Integration Tests', description: 'Integration testing smart contracts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'code-coverage', name: 'Code Coverage', description: 'Code coverage analysis for smart contracts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },

  // ==== SECURITY ====
  { slug: 'security', name: 'Security', description: 'Smart contract security', difficulty: Difficulty.ADVANCED, sortOrder: 54 },
  { slug: 'tools', name: 'Tools', description: 'Security analysis tools', difficulty: Difficulty.ADVANCED, sortOrder: 55 },
  { slug: 'slither', name: 'Slither', description: 'Slither static analysis tool', difficulty: Difficulty.ADVANCED, sortOrder: 56 },
  { slug: 'manticore', name: 'Manticore', description: 'Manticore symbolic execution tool', difficulty: Difficulty.ADVANCED, sortOrder: 57 },
  { slug: 'mythx', name: 'MythX', description: 'MythX security analysis platform', difficulty: Difficulty.ADVANCED, sortOrder: 58 },
  { slug: 'echidna', name: 'Echidna', description: 'Echidna fuzzing tool', difficulty: Difficulty.ADVANCED, sortOrder: 59 },
  
  { slug: 'practices', name: 'Practices', description: 'Security best practices', difficulty: Difficulty.ADVANCED, sortOrder: 60 },
  { slug: 'fuzz-testing-static-analysis', name: 'Fuzz Testing & Static Analysis', description: 'Fuzz testing and static analysis techniques', difficulty: Difficulty.ADVANCED, sortOrder: 61 },
  { slug: 'common-threat-vectors', name: 'Common Threat Vectors', description: 'Common security threats and vectors', difficulty: Difficulty.ADVANCED, sortOrder: 62 },
  { slug: 'source-of-randomness-attacks', name: 'Source of Randomness Attacks', description: 'Randomness vulnerabilities in smart contracts', difficulty: Difficulty.ADVANCED, sortOrder: 63 },
  
  { slug: 'openzeppelin', name: 'OpenZeppelin', description: 'OpenZeppelin secure smart contract libraries', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },

  // ==== MANAGEMENT PLATFORMS ====
  { slug: 'management-platforms', name: 'Management Platforms', description: 'Blockchain management and operations platforms', difficulty: Difficulty.ADVANCED, sortOrder: 65 },

  // ==== DEPLOYMENT & MONITORING ====
  { slug: 'deployment', name: 'Deployment', description: 'Smart contract deployment', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },
  { slug: 'monitoring', name: 'Monitoring', description: 'Smart contract monitoring and observability', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },
  { slug: 'upgrades', name: 'Upgrades', description: 'Smart contract upgrades and migrations', difficulty: Difficulty.ADVANCED, sortOrder: 68 },

  // ==== TOKEN STANDARDS ====
  { slug: 'erc-tokens', name: 'ERC Tokens', description: 'ERC token standards', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },

  // ==== WALLET & STORAGE ====
  { slug: 'crypto-wallets', name: 'Crypto Wallets', description: 'Cryptocurrency wallet implementations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },
  { slug: 'crypto-faucets', name: 'Crypto Faucets', description: 'Cryptocurrency faucet applications', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'decentralized-storage', name: 'Decentralized Storage', description: 'Decentralized storage solutions', difficulty: Difficulty.ADVANCED, sortOrder: 72 },

  // ==== DAPPS - DECENTRALIZED APPLICATIONS ====
  { slug: 'dapps', name: 'dApps - Decentralized Applications', description: 'Decentralized application development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },

  // Supporting Languages
  { slug: 'supporting-languages', name: 'Supporting Languages', description: 'Programming languages for dApp development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'javascript', name: 'JavaScript', description: 'JavaScript for dApps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },
  { slug: 'go', name: 'Go', description: 'Go programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'python', name: 'Python', description: 'Python for blockchain development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },

  // Frontend Frameworks
  { slug: 'frontend-frameworks', name: 'Frontend Frameworks', description: 'Frontend frameworks for dApps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },
  { slug: 'react', name: 'React', description: 'React JavaScript library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'vue', name: 'Vue', description: 'Vue.js frontend framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'angular', name: 'Angular', description: 'Angular frontend framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 81 },

  // Client Libraries
  { slug: 'client-libraries', name: 'Client Libraries', description: 'Web3 client libraries for blockchain interaction', difficulty: Difficulty.INTERMEDIATE, sortOrder: 82 },
  { slug: 'ethersjs', name: 'ethers.js', description: 'ethers.js Ethereum library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 83 },
  { slug: 'web3js', name: 'web3.js', description: 'web3.js Ethereum library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 84 },
  { slug: 'moralis', name: 'Moralis', description: 'Moralis Web3 API platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 85 },

  // Client Nodes
  { slug: 'client-nodes', name: 'Client Nodes', description: 'Blockchain client node implementations', difficulty: Difficulty.ADVANCED, sortOrder: 86 },
  { slug: 'geth', name: 'Geth', description: 'Geth Ethereum client', difficulty: Difficulty.ADVANCED, sortOrder: 87 },
  { slug: 'besu', name: 'Besu', description: 'Besu Ethereum client', difficulty: Difficulty.ADVANCED, sortOrder: 88 },
  { slug: 'nethermind', name: 'Nethermind', description: 'Nethermind Ethereum client', difficulty: Difficulty.ADVANCED, sortOrder: 89 },
  { slug: 'substrate', name: 'Substrate', description: 'Substrate blockchain framework', difficulty: Difficulty.ADVANCED, sortOrder: 90 },

  // dApp Architecture
  { slug: 'architecture', name: 'Architecture', description: 'dApp architecture patterns', difficulty: Difficulty.ADVANCED, sortOrder: 91 },
  { slug: 'security-dapps', name: 'Security', description: 'dApp security considerations', difficulty: Difficulty.ADVANCED, sortOrder: 92 },

  // Applicability / Use Cases
  { slug: 'applicability', name: 'Applicability', description: 'dApp use cases and applications', difficulty: Difficulty.INTERMEDIATE, sortOrder: 93 },
  { slug: 'defi', name: 'DeFi', description: 'Decentralized Finance applications', difficulty: Difficulty.INTERMEDIATE, sortOrder: 94 },
  { slug: 'daos', name: 'DAOs', description: 'Decentralized Autonomous Organizations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 95 },
  { slug: 'nfts', name: 'NFTs', description: 'Non-Fungible Token applications', difficulty: Difficulty.INTERMEDIATE, sortOrder: 96 },
  { slug: 'payments', name: 'Payments', description: 'Payment applications on blockchain', difficulty: Difficulty.INTERMEDIATE, sortOrder: 97 },
  { slug: 'insurance', name: 'Insurance', description: 'Insurance on blockchain', difficulty: Difficulty.INTERMEDIATE, sortOrder: 98 },

  // Node as a Service
  { slug: 'node-as-a-service', name: 'Node as a Service', description: 'Managed node services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 99 },
  { slug: 'alchemy', name: 'Alchemy', description: 'Alchemy node service platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 100 },
  { slug: 'infura', name: 'Infura', description: 'Infura node service platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 101 },

  // ==== REPO HOSTING SERVICES ====
  { slug: 'repo-hosting-services', name: 'Repo Hosting Services', description: 'Repository hosting platforms', difficulty: Difficulty.BEGINNER, sortOrder: 102 },
  { slug: 'github', name: 'GitHub', description: 'GitHub repository hosting', difficulty: Difficulty.BEGINNER, sortOrder: 103 },
  { slug: 'gitlab', name: 'GitLab', description: 'GitLab repository hosting', difficulty: Difficulty.BEGINNER, sortOrder: 104 },
  { slug: 'bitbucket', name: 'Bitbucket', description: 'Bitbucket repository hosting', difficulty: Difficulty.BEGINNER, sortOrder: 105 },

  // ==== VERSION CONTROL SYSTEMS ====
  { slug: 'version-control-systems', name: 'Version Control Systems', description: 'Version control tools', difficulty: Difficulty.BEGINNER, sortOrder: 106 },
  { slug: 'git', name: 'Git', description: 'Git version control system', difficulty: Difficulty.BEGINNER, sortOrder: 107 },

  // ==== BUILDING FOR SCALE ====
  { slug: 'building-for-scale', name: 'Building for Scale', description: 'Scaling blockchain application solutions', difficulty: Difficulty.ADVANCED, sortOrder: 108 },
  { slug: 'state-payment-channels', name: 'State & Payment Channels', description: 'State and payment channel solutions', difficulty: Difficulty.ADVANCED, sortOrder: 109 },
  { slug: 'optimistic-rollups-fraud-proofs', name: 'Optimistic Rollups & Fraud Proofs', description: 'Optimistic rollup scaling solution', difficulty: Difficulty.ADVANCED, sortOrder: 110 },
  { slug: 'zk-rollups-zero-knowledge', name: 'Zk Rollups & Zero Knowledge Proof', description: 'Zero-knowledge rollup scaling', difficulty: Difficulty.ADVANCED, sortOrder: 111 },
  { slug: 'validium-plasma-sidechains', name: 'Validium, Plasma, Sidechains', description: 'Alternative scaling solutions', difficulty: Difficulty.ADVANCED, sortOrder: 112 },
  { slug: 'ethereum-2-0', name: 'Ethereum 2.0', description: 'Ethereum 2.0 and proof of stake', difficulty: Difficulty.ADVANCED, sortOrder: 113 },
  { slug: 'on-chain-scaling', name: 'On-Chain Scaling', description: 'On-chain scaling techniques', difficulty: Difficulty.ADVANCED, sortOrder: 114 },

  // ==== CONTINUE LEARNING ====
  { slug: 'continue-learning', name: 'Visit the following relevant roadmaps', description: 'Other related development paths', difficulty: Difficulty.BEGINNER, sortOrder: 115 },
  { slug: 'backend-continue', name: 'Backend', description: 'Backend development roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 116 },
  { slug: 'javascript-continue', name: 'JavaScript', description: 'JavaScript development roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 117 },
  { slug: 'python-continue', name: 'Python', description: 'Python development roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 118 },
  { slug: 'rust-continue', name: 'Rust', description: 'Rust programming roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 119 },
];

const ROADMAP_EDGES_DATA = [
  // Prerequisites
  { source: 'what-is-blockchain', target: 'blockchain', type: SkillEdgeType.PREREQUISITE },
  { source: 'decentralization', target: 'blockchain', type: SkillEdgeType.PREREQUISITE },
  { source: 'why-it-matters', target: 'blockchain', type: SkillEdgeType.PREREQUISITE },
  { source: 'mining-incentive-models', target: 'blockchain', type: SkillEdgeType.PREREQUISITE },
  { source: 'decentralization-vs-trust', target: 'blockchain', type: SkillEdgeType.PREREQUISITE },
  { source: 'blockchain-forking', target: 'blockchain', type: SkillEdgeType.PREREQUISITE },
  { source: 'cryptocurrencies', target: 'blockchain', type: SkillEdgeType.PREREQUISITE },
  { source: 'cryptowallets', target: 'blockchain', type: SkillEdgeType.PREREQUISITE },

  // Storage
  { source: 'storage', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },

  // Basic Blockchain Knowledge
  { source: 'basic-blockchain-knowledge', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'blockchain-structure', target: 'basic-blockchain-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'basic-blockchain-operations', target: 'basic-blockchain-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'applications-uses', target: 'basic-blockchain-knowledge', type: SkillEdgeType.SUBSKILL_OF },

  // General Blockchain Knowledge
  { source: 'general-blockchain-knowledge', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cryptography', target: 'general-blockchain-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'consensus-protocols', target: 'general-blockchain-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'blockchain-interoperability', target: 'general-blockchain-knowledge', type: SkillEdgeType.SUBSKILL_OF },

  // Blockchains
  { source: 'blockchains', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },
  
  // EVM-Based
  { source: 'evm-based', target: 'blockchains', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ethereum', target: 'evm-based', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'polygon', target: 'evm-based', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'binance-smart-chain', target: 'evm-based', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gnosis-chain', target: 'evm-based', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'huobi-eco-chain', target: 'evm-based', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'avalanche', target: 'evm-based', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fantom', target: 'evm-based', type: SkillEdgeType.SUBSKILL_OF },

  // TVM-Based
  { source: 'tvm-based', target: 'blockchains', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'venom', target: 'tvm-based', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ton', target: 'tvm-based', type: SkillEdgeType.SUBSKILL_OF },

  // Other Blockchains
  { source: 'evercale', target: 'blockchains', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gosh', target: 'blockchains', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'l2-blockchains', target: 'blockchains', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'arbitrum', target: 'l2-blockchains', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'moonbeam-moonriver', target: 'l2-blockchains', type: SkillEdgeType.SUBSKILL_OF },

  // Oracles
  { source: 'oracles', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hybrid-smart-contracts', target: 'oracles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'chainlink', target: 'oracles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'oracle-networks', target: 'oracles', type: SkillEdgeType.SUBSKILL_OF },

  // Smart Contracts
  { source: 'smart-contracts', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'programming-languages', target: 'smart-contracts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'solidity', target: 'programming-languages', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vyper', target: 'programming-languages', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rust', target: 'programming-languages', type: SkillEdgeType.SUBSKILL_OF },
  
  { source: 'brownie', target: 'smart-contracts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'foundry', target: 'smart-contracts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hardhat', target: 'smart-contracts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'truffle', target: 'smart-contracts', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'smart-contract-frameworks', target: 'smart-contracts', type: SkillEdgeType.SUBSKILL_OF },

  // IDEs
  { source: 'ides', target: 'smart-contracts', type: SkillEdgeType.SUBSKILL_OF },

  // Testing
  { source: 'testing', target: 'smart-contracts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'unit-tests', target: 'testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'integration-tests', target: 'testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'code-coverage', target: 'testing', type: SkillEdgeType.SUBSKILL_OF },

  // Security
  { source: 'security', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },
  
  { source: 'tools', target: 'security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'slither', target: 'tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'manticore', target: 'tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mythx', target: 'tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'echidna', target: 'tools', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'practices', target: 'security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fuzz-testing-static-analysis', target: 'practices', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'common-threat-vectors', target: 'practices', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'source-of-randomness-attacks', target: 'practices', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'openzeppelin', target: 'security', type: SkillEdgeType.RELATED },

  // Management Platforms
  { source: 'management-platforms', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },

  // Deployment & Monitoring
  { source: 'deployment', target: 'smart-contracts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'monitoring', target: 'smart-contracts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'upgrades', target: 'smart-contracts', type: SkillEdgeType.SUBSKILL_OF },

  // Token Standards
  { source: 'erc-tokens', target: 'smart-contracts', type: SkillEdgeType.SUBSKILL_OF },

  // Wallet & Storage
  { source: 'crypto-wallets', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'crypto-faucets', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'decentralized-storage', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },

  // dApps
  { source: 'dapps', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },

  // Supporting Languages
  { source: 'supporting-languages', target: 'dapps', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'javascript', target: 'supporting-languages', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'go', target: 'supporting-languages', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python', target: 'supporting-languages', type: SkillEdgeType.SUBSKILL_OF },

  // Frontend Frameworks
  { source: 'frontend-frameworks', target: 'dapps', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'react', target: 'frontend-frameworks', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vue', target: 'frontend-frameworks', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'angular', target: 'frontend-frameworks', type: SkillEdgeType.SUBSKILL_OF },

  // Client Libraries
  { source: 'client-libraries', target: 'dapps', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ethersjs', target: 'client-libraries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'web3js', target: 'client-libraries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'moralis', target: 'client-libraries', type: SkillEdgeType.SUBSKILL_OF },

  // Client Nodes
  { source: 'client-nodes', target: 'dapps', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'geth', target: 'client-nodes', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'besu', target: 'client-nodes', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nethermind', target: 'client-nodes', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'substrate', target: 'client-nodes', type: SkillEdgeType.SUBSKILL_OF },

  // dApp Architecture
  { source: 'architecture', target: 'dapps', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'security-dapps', target: 'dapps', type: SkillEdgeType.SUBSKILL_OF },

  // Applicability
  { source: 'applicability', target: 'dapps', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'defi', target: 'applicability', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'daos', target: 'applicability', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nfts', target: 'applicability', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'payments', target: 'applicability', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'insurance', target: 'applicability', type: SkillEdgeType.SUBSKILL_OF },

  // Node as a Service
  { source: 'node-as-a-service', target: 'dapps', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'alchemy', target: 'node-as-a-service', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'infura', target: 'node-as-a-service', type: SkillEdgeType.SUBSKILL_OF },

  // Repo Hosting Services
  { source: 'repo-hosting-services', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'github', target: 'repo-hosting-services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gitlab', target: 'repo-hosting-services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bitbucket', target: 'repo-hosting-services', type: SkillEdgeType.SUBSKILL_OF },

  // Version Control Systems
  { source: 'version-control-systems', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'git', target: 'version-control-systems', type: SkillEdgeType.SUBSKILL_OF },

  // Building for Scale
  { source: 'building-for-scale', target: 'blockchain', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'state-payment-channels', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'optimistic-rollups-fraud-proofs', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'zk-rollups-zero-knowledge', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'validium-plasma-sidechains', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ethereum-2-0', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'on-chain-scaling', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },

  // Continue Learning
  { source: 'continue-learning', target: 'blockchain', type: SkillEdgeType.RELATED },
  { source: 'backend-continue', target: 'continue-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'javascript-continue', target: 'continue-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python-continue', target: 'continue-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rust-continue', target: 'continue-learning', type: SkillEdgeType.SUBSKILL_OF },

  // Cross-domain dependencies
  { source: 'basic-blockchain-knowledge', target: 'what-is-blockchain', type: SkillEdgeType.BUILDS_ON },
  { source: 'general-blockchain-knowledge', target: 'basic-blockchain-knowledge', type: SkillEdgeType.BUILDS_ON },
  { source: 'smart-contracts', target: 'general-blockchain-knowledge', type: SkillEdgeType.BUILDS_ON },
  { source: 'dapps', target: 'smart-contracts', type: SkillEdgeType.BUILDS_ON },
];

async function main() {
  console.log('Starting Blockchain roadmap seed...');
  
  // Upsert the 'Backend' category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'backend' },
    update: {},
    create: {
      name: 'Backend',
      slug: 'backend',
      description: 'Backend and blockchain development learning paths',
      icon: '🔗',
      color: '#627EEA',
      sortOrder: 3,
    },
  });
  console.log('✓ Category created/updated');

  // Build nodes with categoryId
  const ROADMAP_NODES = ROADMAP_NODES_DATA.map(node => ({
    ...node,
    categoryId: category.id,
    normalizedName: node.name.toLowerCase(),
  }));

  // Insert all nodes (skills)
  console.log(`Inserting ${ROADMAP_NODES.length} skills...`);
  for (const node of ROADMAP_NODES) {
    await prisma.skill.upsert({
      where: { slug: node.slug },
      update: {
        name: node.name,
        description: node.description,
        categoryId: node.categoryId,
        difficulty: node.difficulty,
        normalizedName: node.normalizedName,
        sortOrder: node.sortOrder,
      },
      create: {
        slug: node.slug,
        name: node.name,
        description: node.description,
        categoryId: node.categoryId,
        difficulty: node.difficulty,
        normalizedName: node.normalizedName,
        sortOrder: node.sortOrder,
        isCanonical: true,
        isPublished: true,
      },
    });
  }
  console.log(`✓ ${ROADMAP_NODES.length} skills inserted`);

  // Get the root skill
  const rootSkill = await prisma.skill.findUnique({ where: { slug: 'blockchain' } });

  // Create or update the Blockchain Roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'blockchain' },
    update: {
      name: 'Blockchain',
      description: 'Complete Blockchain development roadmap covering blockchain fundamentals, smart contracts, security, dApps, testing, and scaling solutions',
      icon: '🔗',
      color: '#627EEA',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Blockchain',
      slug: 'blockchain',
      description: 'Complete Blockchain development roadmap covering blockchain fundamentals, smart contracts, security, dApps, testing, and scaling solutions',
      icon: '🔗',
      color: '#627EEA',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
  });
  console.log('✓ Roadmap created/updated');

  // Link all skills to this roadmap
  const allSkillSlugs = ROADMAP_NODES.map(n => n.slug);
  await prisma.skill.updateMany({
    where: { slug: { in: allSkillSlugs } },
    data: { roadmapId: roadmap.id },
  });
  console.log('✓ Skills linked to roadmap');

  // Delete old edges for clean re-seed
  const allSkills = await prisma.skill.findMany({
    where: { slug: { in: allSkillSlugs } },
    select: { id: true, slug: true },
  });
  const slugToId = new Map(allSkills.map(s => [s.slug, s.id]));
  const skillIds = allSkills.map(s => s.id);
  
  await prisma.skillEdge.deleteMany({
    where: {
      OR: [
        { sourceId: { in: skillIds } },
        { targetId: { in: skillIds } },
      ],
    },
  });
  console.log('✓ Old edges cleaned');

  // Insert edges
  console.log(`Inserting ${ROADMAP_EDGES_DATA.length} edges...`);
  for (const edge of ROADMAP_EDGES_DATA) {
    const sourceId = slugToId.get(edge.source);
    const targetId = slugToId.get(edge.target);
    
    if (sourceId && targetId) {
      await prisma.skillEdge.create({
        data: {
          sourceId,
          targetId,
          edgeType: edge.type,
          strength: 1.0,
          isStrict: false,
        },
      });
    } else {
      console.warn(`⚠ Skipped edge: ${edge.source} -> ${edge.target} (not found)`);
    }
  }
  console.log(`✓ ${ROADMAP_EDGES_DATA.length} edges inserted`);

  console.log('\n✓ Blockchain roadmap seeded successfully!');
  console.log(`  - ${ROADMAP_NODES.length} skills`);
  console.log(`  - ${ROADMAP_EDGES_DATA.length} edges`);
}

main()
  .catch((e) => {
    console.error('Error seeding roadmap:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
