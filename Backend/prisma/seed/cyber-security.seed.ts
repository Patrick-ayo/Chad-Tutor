/**
 * Cyber Security Roadmap Seed Script
 *
 * Seeds the Cyber Security development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/cyber-security.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// Cyber Security Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'cyber-security', name: 'Cyber Security', description: 'Complete Cyber Security roadmap', difficulty: Difficulty.BEGINNER, sortOrder: 0 },

  // ==== CTFS & PRACTICE ====
  { slug: 'ctfs-practice', name: 'CTFs (Capture the Flag)', description: 'Practice platforms for security challenges', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'hackthebox', name: 'HackTheBox', description: 'HackTheBox CTF platform', difficulty: Difficulty.BEGINNER, sortOrder: 2 },
  { slug: 'syntactic', name: 'Syntactic', description: 'Syntactic practice platform', difficulty: Difficulty.BEGINNER, sortOrder: 3 },
  { slug: 'karma', name: 'Karma', description: 'Karma practice platform', difficulty: Difficulty.BEGINNER, sortOrder: 4 },
  { slug: 'picoctf', name: 'picoCTF', description: 'picoCTF competition platform', difficulty: Difficulty.BEGINNER, sortOrder: 5 },
  { slug: 'emc-hosting-hack-challenge', name: 'EMIC Hosting Hack Challenge', description: 'EMIC hosting hacking challenges', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },

  // ==== CERTIFICATIONS ====
  { slug: 'certifications', name: 'Certifications', description: 'Industry security certifications', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },
  { slug: 'comptia-security-plus', name: 'CompTIA Security+', description: 'CompTIA Security+ certification', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'comptia-network-plus', name: 'CompTIA Network+', description: 'CompTIA Network+ certification', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },
  { slug: 'comptia-a-plus', name: 'CompTIA A+', description: 'CompTIA A+ certification', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'ceh', name: 'C|EH', description: 'Certified Ethical Hacker certification', difficulty: Difficulty.ADVANCED, sortOrder: 11 },
  { slug: 'oscp', name: 'OSCP', description: 'Offensive Security Certified Professional', difficulty: Difficulty.ADVANCED, sortOrder: 12 },

  // ==== FOUNDATIONAL KNOWLEDGE ====
  { slug: 'cybersecurity-it-skills', name: 'Cybersecurity IT Skills', description: 'Foundational IT security skills', difficulty: Difficulty.BEGINNER, sortOrder: 13 },

  { slug: 'regional-networks', name: 'Regional/Networks', description: 'Network fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 14 },
  { slug: 'comptia-a-plus-net', name: 'CompTIA A+ / Network+', description: 'CompTIA certifications for networking', difficulty: Difficulty.BEGINNER, sortOrder: 15 },
  { slug: 'ccna', name: 'CCNA', description: 'Cisco Certified Network Associate', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },

  // ==== COMPUTER HARDWARE ====
  { slug: 'computer-hardware-components', name: 'Computer Hardware Components', description: 'Understanding computer hardware', difficulty: Difficulty.BEGINNER, sortOrder: 17 },
  { slug: 'nfc', name: 'NFC', description: 'Near Field Communication', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'bluetooth', name: 'Bluetooth', description: 'Bluetooth wireless technology', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'hid-office-tools', name: 'HID Office Tools', description: 'Human Interface Device tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'cloud', name: 'Cloud', description: 'Cloud computing basics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'google-suite', name: 'Google Suite', description: 'Google Cloud services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },

  // ==== OS INDEPENDENT ====
  { slug: 'os-independent-troubleshooting', name: 'OS Independent Troubleshooting', description: 'OS-agnostic troubleshooting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },

  { slug: 'understand-basics-physical', name: 'Understand Basics of Physical Components', description: 'Physical hardware basics', difficulty: Difficulty.BEGINNER, sortOrder: 24 },
  { slug: 'learn-following-each', name: 'Learn following for each', description: 'Component-specific learning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'utilization-configuration', name: 'Utilization and Configuration', description: 'Hardware configuration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'offensive-network-and-osi', name: 'Offensive Network and OSI', description: 'OSI model and network offense', difficulty: Difficulty.ADVANCED, sortOrder: 27 },
  { slug: 'understand-permeation', name: 'Understand Permeation', description: 'Penetration testing concepts', difficulty: Difficulty.ADVANCED, sortOrder: 28 },

  // ==== NETWORK FUNDAMENTALS ====
  { slug: 'networking-knowledge', name: 'Networking Knowledge', description: 'Network and security protocols', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },

  { slug: 'basics-of-routing', name: 'Basics of Routing', description: 'IP routing fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'public-vs-private-ip', name: 'Public vs Private IP Addresses', description: 'IP address types', difficulty: Difficulty.BEGINNER, sortOrder: 31 },

  { slug: 'basics-of-switching', name: 'Basics of Switching', description: 'Network switching concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },

  { slug: 'basics-of-computer-networking', name: 'Basics of Computer Networking', description: 'Fundamental networking concepts', difficulty: Difficulty.BEGINNER, sortOrder: 33 },

  // ==== NETWORK TOPOLOGIES ====
  { slug: 'network-topologies', name: 'Network Topologies', description: 'Different network topology types', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },

  { slug: 'tcp-ip', name: 'TCP/IP', description: 'TCP/IP protocol suite', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },
  { slug: 'dns', name: 'DNS', description: 'Domain Name System', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'arp', name: 'ARP', description: 'Address Resolution Protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'igmp', name: 'IGMP', description: 'Internet Group Management Protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },

  { slug: 'icmp', name: 'ICMP', description: 'Internet Control Message Protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'udp', name: 'UDP', description: 'User Datagram Protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'ipv4', name: 'IPv4', description: 'Internet Protocol version 4', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'ipv6', name: 'IPv6', description: 'Internet Protocol version 6', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },

  { slug: 'sctp', name: 'SCTP', description: 'Stream Control Transmission Protocol', difficulty: Difficulty.ADVANCED, sortOrder: 43 },

  // ==== DATA LAYER ====
  { slug: 'data-link-layer', name: 'Data Link Layer', description: 'OSI Layer 2 - Data Link', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },

  // ==== ROUTING ====
  { slug: 'router-basics', name: 'Router Basics', description: 'Router configuration and basics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'router', name: 'Router', description: 'Router devices', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'routing', name: 'Routing', description: 'Routing protocols and concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'rip', name: 'RIP', description: 'Routing Information Protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'ospf', name: 'OSPF', description: 'Open Shortest Path First', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'bgp', name: 'BGP', description: 'Border Gateway Protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'eigrp', name: 'EIGRP', description: 'Enhanced Interior Gateway Routing Protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },

  // ==== SWITCHING ====
  { slug: 'switching', name: 'Switching', description: 'Network switch concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'lan', name: 'LAN', description: 'Local Area Network', difficulty: Difficulty.BEGINNER, sortOrder: 53 },
  { slug: 'vlan', name: 'VLAN', description: 'Virtual Local Area Network', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'stp', name: 'STP', description: 'Spanning Tree Protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },
  { slug: 'rstp', name: 'RSTP', description: 'Rapid Spanning Tree Protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },

  // ==== PACKET SNIFFERS ====
  { slug: 'packet-sniffers', name: 'Packet Sniffers', description: 'Network packet analysis and sniffing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'wireshark', name: 'Wireshark', description: 'Wireshark packet analyzer', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },
  { slug: 'tcpdump', name: 'TCPDUMP', description: 'TCPDUMP packet capture tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },

  // ==== PROTOCOL ANALYZERS ====
  { slug: 'protocol-analyzers', name: 'Protocol Analyzers', description: 'Tools for analyzing protocols', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },

  // ==== TRAFFIC SNIFFING TOOLS ====
  { slug: 'traffic-sniffing-tools', name: 'Traffic Sniffing Tools', description: 'Tools for sniffing network traffic', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },

  // ==== FIREWALLS ====
  { slug: 'firewalls', name: 'Firewalls', description: 'Firewall technologies and concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'firewall-basics', name: 'Firewall Basics & Rules', description: 'Basic firewall concepts and rules', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'certificates', name: 'Certificates', description: 'Digital certificates', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  { slug: 'local-auth', name: 'Local Auth', description: 'Local authentication', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'authentication-methodologies', name: 'Authentication Methodologies', description: 'Authentication methods and approaches', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },

  // ==== COMMON HACKING TOOLS ====
  { slug: 'understanding-common-hacking-tools', name: 'Understanding Common Hacking Tools', description: 'Tools used in hacking attempts', difficulty: Difficulty.ADVANCED, sortOrder: 67 },

  // ==== ENCRYPTION ====
  { slug: 'encryption', name: 'Encryption', description: 'Encryption concepts and algorithms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },

  // ==== CRYPTOGRAPHY ====
  { slug: 'basics-of-cryptography', name: 'Basics of Cryptography', description: 'Cryptography fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },
  { slug: 'cryptographic-algorithms', name: 'Cryptographic Algorithms', description: 'Different cryptographic algorithms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },
  { slug: 'aes', name: 'AES', description: 'Advanced Encryption Standard', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'des', name: 'DES', description: 'Data Encryption Standard', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: '3des', name: '3DES', description: 'Triple Data Encryption Standard', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },
  { slug: 'rsa', name: 'RSA', description: 'RSA encryption algorithm', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'md5', name: 'MD5', description: 'MD5 hash algorithm', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },
  { slug: 'sha', name: 'SHA', description: 'Secure Hash Algorithm', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'sha256', name: 'SHA256', description: 'SHA-256 hash algorithm', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },
  { slug: 'diffie-hellman', name: 'Diffie-Hellman Exchange', description: 'Diffie-Hellman key exchange', difficulty: Difficulty.ADVANCED, sortOrder: 78 },

  // ==== HASHING ====
  { slug: 'hashing', name: 'Hashing', description: 'Hash functions and concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'salting', name: 'Salting', description: 'Password salting techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'key-stretching', name: 'Key Stretching', description: 'Key stretching methods', difficulty: Difficulty.ADVANCED, sortOrder: 81 },

  // ==== SYMMETRIC & ASYMMETRIC ====
  { slug: 'symmetric-asymmetric', name: 'Symmetric & Asymmetric', description: 'Symmetric and asymmetric encryption', difficulty: Difficulty.INTERMEDIATE, sortOrder: 82 },

  // ==== THREATS & ATTACKS ====
  { slug: 'threats', name: 'Threats', description: 'Security threats and vulnerabilities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 83 },
  { slug: 'rogue-access-point', name: 'Rogue Access Point', description: 'Rogue access point security', difficulty: Difficulty.ADVANCED, sortOrder: 84 },
  { slug: 'man-in-middle', name: 'Man in the Middle', description: 'MITM attacks and mitigation', difficulty: Difficulty.ADVANCED, sortOrder: 85 },
  { slug: 'deauthentication', name: 'Deauthentication', description: 'Deauthentication attacks', difficulty: Difficulty.ADVANCED, sortOrder: 86 },
  { slug: 'shoulder-surfing', name: 'Shoulder Surfing', description: 'Shoulder surfing attacks', difficulty: Difficulty.BEGINNER, sortOrder: 87 },
  { slug: 'tailgating', name: 'Tailgating', description: 'Tailgating and piggybacking', difficulty: Difficulty.BEGINNER, sortOrder: 88 },
  { slug: 'social-engineering', name: 'Social Engineering', description: 'Social engineering techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 89 },
  { slug: 'brute-force', name: 'Brute Force', description: 'Brute force attacks', difficulty: Difficulty.ADVANCED, sortOrder: 90 },
  { slug: 'buffer-overflow', name: 'Buffer Overflow', description: 'Buffer overflow vulnerabilities', difficulty: Difficulty.ADVANCED, sortOrder: 91 },

  // ==== CONCEPTS ====
  { slug: 'cyber-kill-chain', name: 'Cyber Kill Chain', description: 'Cyber attack kill chain model', difficulty: Difficulty.ADVANCED, sortOrder: 92 },
  { slug: 'understand-definition-risk', name: 'Understand the Definition of Risk', description: 'Risk definition and assessment', difficulty: Difficulty.INTERMEDIATE, sortOrder: 93 },

  // ==== PROGRAMMING ====
  { slug: 'programming-skills', name: 'Programming Skills', description: 'Programming for security', difficulty: Difficulty.INTERMEDIATE, sortOrder: 94 },
  { slug: 'python', name: 'Python', description: 'Python programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 95 },
  { slug: 'javascript', name: 'JavaScript', description: 'JavaScript programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 96 },
  { slug: 'c-plus-plus', name: 'C++', description: 'C++ programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 97 },
  { slug: 'bash', name: 'Bash', description: 'Bash shell scripting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 98 },
  { slug: 'powershell', name: 'PowerShell', description: 'PowerShell scripting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 99 },

  // ==== CLOUD SKILLS ====
  { slug: 'cloud-skills-knowledge', name: 'Cloud Skills and Knowledge', description: 'Cloud computing security', difficulty: Difficulty.INTERMEDIATE, sortOrder: 100 },
  { slug: 'understand-concepts-cloud', name: 'Understand Cloud Security Concepts', description: 'Cloud security concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 101 },
  { slug: 'understand-cloud-vs-premises', name: 'Cloud vs On-Premises', description: 'Cloud vs on-premises comparison', difficulty: Difficulty.INTERMEDIATE, sortOrder: 102 },
  { slug: 'infrastructure-as-code', name: 'Infrastructure as Code', description: 'Infrastructure as Code (IaC)', difficulty: Difficulty.INTERMEDIATE, sortOrder: 103 },
  { slug: 'serverless', name: 'Serverless', description: 'Serverless computing concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 104 },

  // ==== CONTINUE LEARNING ====
  { slug: 'continue-learning', name: 'Keep Learning', description: 'Continuous learning resources', difficulty: Difficulty.BEGINNER, sortOrder: 105 },
  { slug: 'python-keep', name: 'Python', description: 'Python development path', difficulty: Difficulty.INTERMEDIATE, sortOrder: 106 },
];

// Continue with edges and remaining nodes based on careful image analysis...
const ROADMAP_EDGES_DATA = [
  // CTFs & Practice
  { source: 'ctfs-practice', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hackthebox', target: 'ctfs-practice', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'syntactic', target: 'ctfs-practice', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'karma', target: 'ctfs-practice', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'picoctf', target: 'ctfs-practice', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'emc-hosting-hack-challenge', target: 'ctfs-practice', type: SkillEdgeType.SUBSKILL_OF },

  // Certifications
  { source: 'certifications', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'comptia-security-plus', target: 'certifications', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'comptia-network-plus', target: 'certifications', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'comptia-a-plus', target: 'certifications', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ceh', target: 'certifications', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'oscp', target: 'certifications', type: SkillEdgeType.SUBSKILL_OF },

  // Cybersecurity IT Skills  
  { source: 'cybersecurity-it-skills', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },

  // Regional Networks
  { source: 'regional-networks', target: 'cybersecurity-it-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'comptia-a-plus-net', target: 'regional-networks', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ccna', target: 'regional-networks', type: SkillEdgeType.SUBSKILL_OF },

  // Computer Hardware Components
  { source: 'computer-hardware-components', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nfc', target: 'computer-hardware-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bluetooth', target: 'computer-hardware-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hid-office-tools', target: 'computer-hardware-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cloud', target: 'computer-hardware-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'google-suite', target: 'cloud', type: SkillEdgeType.SUBSKILL_OF },

  // OS Independent
  { source: 'os-independent-troubleshooting', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'understand-basics-physical', target: 'os-independent-troubleshooting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'learn-following-each', target: 'understand-basics-physical', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'utilization-configuration', target: 'learn-following-each', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'offensive-network-and-osi', target: 'learn-following-each', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'understand-permeation', target: 'learn-following-each', type: SkillEdgeType.SUBSKILL_OF },

  // Networking
  { source: 'networking-knowledge', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'basics-of-routing', target: 'networking-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'public-vs-private-ip', target: 'basics-of-routing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'basics-of-switching', target: 'networking-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'basics-of-computer-networking', target: 'networking-knowledge', type: SkillEdgeType.SUBSKILL_OF },

  // Network Topologies
  { source: 'network-topologies', target: 'networking-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tcp-ip', target: 'network-topologies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dns', target: 'network-topologies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'arp', target: 'network-topologies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'igmp', target: 'network-topologies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'icmp', target: 'network-topologies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'udp', target: 'network-topologies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ipv4', target: 'network-topologies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ipv6', target: 'network-topologies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sctp', target: 'network-topologies', type: SkillEdgeType.SUBSKILL_OF },

  // Data Link Layer
  { source: 'data-link-layer', target: 'networking-knowledge', type: SkillEdgeType.SUBSKILL_OF },

  // Router Basics
  { source: 'router-basics', target: 'networking-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'router', target: 'router-basics', type: SkillEdgeType.SUBSKILL_OF },

  // Routing
  { source: 'routing', target: 'networking-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rip', target: 'routing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ospf', target: 'routing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bgp', target: 'routing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'eigrp', target: 'routing', type: SkillEdgeType.SUBSKILL_OF },

  // Switching
  { source: 'switching', target: 'networking-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'lan', target: 'switching', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vlan', target: 'switching', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'stp', target: 'switching', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rstp', target: 'switching', type: SkillEdgeType.SUBSKILL_OF },

  // Packet Sniffers
  { source: 'packet-sniffers', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'wireshark', target: 'packet-sniffers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tcpdump', target: 'packet-sniffers', type: SkillEdgeType.SUBSKILL_OF },

  // Protocol Analyzers
  { source: 'protocol-analyzers', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },

  // Traffic Sniffing Tools
  { source: 'traffic-sniffing-tools', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },

  // Firewalls
  { source: 'firewalls', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'firewall-basics', target: 'firewalls', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'certificates', target: 'firewalls', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'local-auth', target: 'firewalls', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'authentication-methodologies', target: 'firewalls', type: SkillEdgeType.SUBSKILL_OF },

  // Common Hacking Tools
  { source: 'understanding-common-hacking-tools', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'basics-reverse-engineering', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'understand-common-threats', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },

  // Encryption
  { source: 'encryption', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'basics-and-concepts-threat-hunting', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },

  // Cryptography
  { source: 'basics-of-cryptography', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cryptographic-algorithms', target: 'basics-of-cryptography', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aes', target: 'cryptographic-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'des', target: 'cryptographic-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: '3des', target: 'cryptographic-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rsa', target: 'cryptographic-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'md5', target: 'cryptographic-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sha', target: 'cryptographic-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sha256', target: 'cryptographic-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'diffie-hellman', target: 'cryptographic-algorithms', type: SkillEdgeType.SUBSKILL_OF },

  // Diffusion
  { source: 'diffusion', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },

  // HTTP/HTTPS
  { source: 'http-https', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },

  // Types and Attacks
  { source: 'types-and-attacks', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },

  // Hashing
  { source: 'hashing', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'salting', target: 'hashing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'key-stretching', target: 'hashing', type: SkillEdgeType.SUBSKILL_OF },

  // Homomorphic
  { source: 'homomorphic', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },

  // Symmetric & Asymmetric
  { source: 'symmetric-asymmetric', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },

  // Concepts
  { source: 'understand-definition-risk', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'understand-iso-iec', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },

  // Cyber Kill Chain
  { source: 'cyber-kill-chain', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },

  // Threats
  { source: 'threats', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },

  // Attack Types
  { source: 'attack-types-difference', target: 'threats', type: SkillEdgeType.SUBSKILL_OF },

  // Understanding Reverse
  { source: 'understanding-reverse-engineering-process', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },

  // Programming
  { source: 'programming-skills', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python', target: 'programming-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'javascript', target: 'programming-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'c-plus-plus', target: 'programming-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bash', target: 'programming-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'powershell', target: 'programming-skills', type: SkillEdgeType.SUBSKILL_OF },

  // Cloud Skills
  { source: 'cloud-skills-knowledge', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'understand-concepts-cloud', target: 'cloud-skills-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'understand-cloud-premisses', target: 'cloud-skills-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'understand-concept-infrastructure-cloud', target: 'cloud-skills-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'understand-concept-serverless', target: 'cloud-skills-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'understand-basics-general-law-deploying-cloud', target: 'cloud-skills-knowledge', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning', target: 'cyber-security', type: SkillEdgeType.RELATED },
  { source: 'python-keep', target: 'keep-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'common-cloud-storage', target: 'keep-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aioauth', target: 'keep-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'audiosrf', target: 'keep-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'c-sharp', target: 'keep-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'java-security', target: 'keep-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'r-lang', target: 'keep-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'go-lang', target: 'keep-learning', type: SkillEdgeType.SUBSKILL_OF },

  // Additional Concepts
  { source: 'pentesting-testing-phases', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'false-negative-false-positive', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'true-negative-true-positive', target: 'cyber-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'understand-importance-false-positive', target: 'false-negative-false-positive', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rogueaccesspointfake', target: 'threats', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'man-in-middle', target: 'threats', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'deauthentication', target: 'threats', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'shoulder-surfing', target: 'threats', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tailgating', target: 'threats', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'social-engineering', target: 'threats', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'brute-force', target: 'threats', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'buffer-overflow', target: 'threats', type: SkillEdgeType.SUBSKILL_OF },
];

async function main() {
  console.log('Starting Cyber Security roadmap seed...');
  
  // Upsert the 'Security' category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'security' },
    update: {},
    create: {
      name: 'Security',
      slug: 'security',
      description: 'Cybersecurity and information security learning paths',
      icon: '🔒',
      color: '#FF6B6B',
      sortOrder: 7,
    },
  });
  console.log('✓ Category created/updated');

  // Build nodes with categoryId
  const ROADMAP_NODES = ROADMAP_NODES_DATA.map(node => ({
    ...node,
    categoryId: category.id,
    normalizedName: node.name.toLowerCase(),
    resources: buildNodeResources(node.name, node.slug),
  }));

  // Insert all nodes (skills)
  console.log(`Inserting ${ROADMAP_NODES.length} skills...`);
  for (const node of ROADMAP_NODES) {
    await prisma.skill.upsert({
      where: { slug: node.slug },
      update: {
        name: node.name,
        description: node.description,
        resources: (node as any).resources,
        categoryId: node.categoryId,
        difficulty: node.difficulty,
        normalizedName: node.normalizedName,
        sortOrder: node.sortOrder,
      },
      create: {
        slug: node.slug,
        name: node.name,
        description: node.description,
        resources: (node as any).resources,
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
  const rootSkill = await prisma.skill.findUnique({ where: { slug: 'cyber-security' } });

  // Create or update the Cyber Security Roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'cyber-security' },
    update: {
      name: 'Cyber Security',
      description: 'Complete Cyber Security roadmap covering fundamentals, networking, cryptography, threats, programming, cloud security, and advanced security concepts',
      icon: '🔒',
      color: '#FF6B6B',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Cyber Security',
      slug: 'cyber-security',
      description: 'Complete Cyber Security roadmap covering fundamentals, networking, cryptography, threats, programming, cloud security, and advanced security concepts',
      icon: '🔒',
      color: '#FF6B6B',
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

  console.log('\n✓ Cyber Security roadmap seeded successfully!');
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
