/**
 * iOS Developer Roadmap Seed Script
 *
 * Seeds the iOS Developer development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/ios-developer.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// iOS Developer Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'ios-developer', name: 'iOS Developer', description: 'Complete iOS Developer roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== CORE OS ====
  { slug: 'core-os', name: 'Core OS', description: 'iOS Core OS fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 1 },
  { slug: 'core-services', name: 'Core Services', description: 'Core Services framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 2 },
  { slug: 'core-touch', name: 'Core Touch', description: 'Touch handling in iOS', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },

  // ==== PICK A LANGUAGE ====
  { slug: 'pick-a-language', name: 'Pick a Language', description: 'Choose a programming language', difficulty: Difficulty.BEGINNER, sortOrder: 4 },
  { slug: 'objective-c', name: 'Objective-C', description: 'Objective-C programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'swift', name: 'Swift', description: 'Swift programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },

  // ==== THE FUNDAMENTALS ====
  { slug: 'the-fundamentals', name: 'The Fundamentals', description: 'iOS fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },

  // ==== CORE PROGRAMMING CONSTRUCTS ====
  { slug: 'core-programming-constructs', name: 'Core Programming Constructs', description: 'Core Swift/iOS concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'declarative-syntax', name: 'Declarative Syntax', description: 'Declarative programming syntax', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },
  { slug: 'state-management', name: 'State Management', description: 'Managing application state', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'view-management', name: 'View Management', description: 'Managing views and UI elements', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'error-handling', name: 'Error Handling', description: 'Error handling in iOS', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'concurrency-dispatch-queue', name: 'Concurrency (DispatchQueue)', description: 'Concurrent programming with GCD', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },

  // ==== iOS BASICS ====
  { slug: 'ios-basics', name: 'iOS Basics', description: 'Basic iOS development concepts', difficulty: Difficulty.BEGINNER, sortOrder: 14 },
  { slug: 'views', name: 'Views', description: 'UIView and view hierarchy', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'view-controllers', name: 'View Controllers', description: 'UIViewController lifecycle and management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'user-interactions', name: 'User Interactions', description: 'Handling user interactions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },

  // ==== APP COMPONENTS ====
  { slug: 'app-components', name: 'App Components', description: 'Key iOS application components', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'structure-interviews', name: 'Structure Interviews', description: 'App structure patterns', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'various-editors', name: 'Various', description: 'Different editors in Xcode', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'editors', name: 'Editors', description: 'Text and code editors', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'attribute-inspector', name: 'Attribute Inspector', description: 'Using Attribute Inspector in IB', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'size-inspector', name: 'Size Inspector', description: 'Using Size Inspector in IB', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },

  // ==== NAVIGATING ====
  { slug: 'navigating', name: 'Navigating', description: 'Navigation between screens', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'navigation-controller', name: 'Navigation Controller', description: 'UINavigationController', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'tab-bar-controller', name: 'Tab Bar Controller', description: 'UITabBarController', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'segues', name: 'Segues', description: 'Navigation using segues', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'constraints', name: 'Constraints', description: 'Auto Layout constraints', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },

  // ==== DEBUGGER ====
  { slug: 'debugger', name: 'Debugger', description: 'Debugging iOS applications', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'breakpoints', name: 'Breakpoints', description: 'Setting and using breakpoints', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'stepping', name: 'Stepping', description: 'Step through code', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'profiling-documents', name: 'Profiling Documents', description: 'Code profiling and analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },

  // ==== INTERFACE BUILDER ====
  { slug: 'interface-builder', name: 'Interface Builder', description: 'Building UI with Interface Builder', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'storyboard', name: 'Storyboard', description: 'Creating storyboards', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'xib-files', name: 'XIB Files', description: 'Creating XIB files', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },
  { slug: 'outlets-actions', name: 'Outlets & Actions', description: 'Creating outlets and actions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },

  // ==== LINGO ====
  { slug: 'lingo', name: 'Lingo', description: 'iOS terminology and concepts', difficulty: Difficulty.BEGINNER, sortOrder: 37 },
  { slug: 'aspect-ratio', name: 'Aspect Ratio', description: 'Device aspect ratios', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },
  { slug: 'view-semantics', name: 'View Semantics', description: 'Semantics of view hierarchy', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'casting-annotations', name: 'Casting Annotations', description: 'Type casting in iOS', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },

  // ==== CORE ANIMATION ====
  { slug: 'core-animation', name: 'Core Animation', description: 'Animations using Core Animation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'declarative-animations', name: 'Declarative', description: 'Declarative animation syntax', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'constraints-animation', name: 'Constraints', description: 'Animating constraints', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  { slug: 'view-animations', name: 'View Animations', description: 'UIView animations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'animated-transitions', name: 'Animated Transitions', description: 'Creating transition animations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },

  // ==== DESIGN ARCHITECTURE ====
  { slug: 'design-architecture', name: 'Design Architecture', description: 'Architecture patterns for iOS', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'mvc-pattern', name: 'MVC', description: 'Model-View-Controller pattern', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'mvvm-pattern', name: 'MVVM', description: 'Model-View-ViewModel pattern', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'mvp-pattern', name: 'MVP', description: 'Model-View-Presenter pattern', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'viper-pattern', name: 'VIPER', description: 'VIPER architecture pattern', difficulty: Difficulty.ADVANCED, sortOrder: 50 },
  { slug: 'clean-architecture', name: 'Clean Architecture', description: 'Clean architecture principles', difficulty: Difficulty.ADVANCED, sortOrder: 51 },

  // ==== DEBUGGING ====
  { slug: 'debugging', name: 'Debugging', description: 'Debugging techniques and tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'console-output', name: 'Console Output', description: 'Debugging with print statements', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  { slug: 'lldb', name: 'LLDB', description: 'LLDB debugger usage', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'instruments-profiler', name: 'Instruments Profiler', description: 'Using Instruments for profiling', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },
  { slug: 'memory-profiling', name: 'Memory Profiling', description: 'Profiling memory usage', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'cpu-profiling', name: 'CPU Profiling', description: 'Profiling CPU usage', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'crash-logs', name: 'Crash Logs', description: 'Analyzing crash logs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },

  // ==== STORAGE ====
  { slug: 'storage', name: 'Storage', description: 'Data storage in iOS', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },
  { slug: 'userdefaults', name: 'UserDefaults', description: 'Using UserDefaults for preferences', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'file-system', name: 'File System', description: 'Working with file system', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'plist', name: 'Plist', description: 'Property list files', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'sqlite', name: 'SQLite', description: 'SQLite database', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'core-data', name: 'Core Data', description: 'iOS Core Data framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  { slug: 'realm', name: 'Realm', description: 'Realm mobile database', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },

  // ==== CONCURRENCY AND MULTITHREADING ====
  { slug: 'concurrency-multithreading', name: 'Concurrency and Multithreading', description: 'Concurrent programming in iOS', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },
  { slug: 'grand-central-dispatch', name: 'Grand Central Dispatch', description: 'GCD for concurrency', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },
  { slug: 'operation-queue', name: 'Operation Queue', description: 'Using Operation Queue', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },
  { slug: 'async-await', name: 'Async/Await', description: 'Modern async/await syntax', difficulty: Difficulty.ADVANCED, sortOrder: 69 },
  { slug: 'pthread', name: 'Pthread', description: 'POSIX pthreads', difficulty: Difficulty.ADVANCED, sortOrder: 70 },

  // ==== FRAMEWORKS & LIBRARY ====
  { slug: 'frameworks-library', name: 'Frameworks & Library', description: 'Using frameworks and libraries', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'cocoapods', name: 'CocoaPods', description: 'Dependency manager CocoaPods', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'package-manager', name: 'Swift Package Manager', description: 'Swift Package Manager', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },
  { slug: 'carthage', name: 'Carthage', description: 'Carthage dependency manager', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'rx-framework', name: 'RxFramework', description: 'RxSwift reactive framework', difficulty: Difficulty.ADVANCED, sortOrder: 75 },

  // ==== NETWORKING ====
  { slug: 'networking', name: 'Networking', description: 'Network communication in iOS', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'url-session', name: 'URL Session', description: 'URLSession for network requests', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },
  { slug: 'rest-api', name: 'REST API', description: 'Working with REST APIs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },
  { slug: 'json-parsing', name: 'JSON Parsing', description: 'Parsing JSON data', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'rest-client', name: 'REST Client', description: 'REST client tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'http-https', name: 'HTTP/HTTPS', description: 'HTTP and HTTPS protocols', difficulty: Difficulty.INTERMEDIATE, sortOrder: 81 },
  { slug: 'security-certificates', name: 'Security & Certificates', description: 'SSL/TLS and certificates', difficulty: Difficulty.ADVANCED, sortOrder: 82 },

  // ==== ACCESSIBILITY ====
  { slug: 'accessibility', name: 'Accessibility', description: 'Building accessible iOS apps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 83 },
  { slug: 'voiceover', name: 'VoiceOver', description: 'VoiceOver accessibility feature', difficulty: Difficulty.INTERMEDIATE, sortOrder: 84 },
  { slug: 'dynamic-type', name: 'Dynamic Type', description: 'Dynamic text sizing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 85 },
  { slug: 'accessibility-inspector', name: 'Accessibility Inspector', description: 'Using Accessibility Inspector', difficulty: Difficulty.INTERMEDIATE, sortOrder: 86 },
  { slug: 'accessibility-api', name: 'Accessibility API', description: 'iOS Accessibility APIs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 87 },
  { slug: 'wcag-standards', name: 'WCAG Standards', description: 'Web Content Accessibility Guidelines', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },

  // ==== TESTING ====
  { slug: 'testing', name: 'Testing', description: 'Testing iOS applications', difficulty: Difficulty.INTERMEDIATE, sortOrder: 89 },
  { slug: 'unit-testing', name: 'Unit Testing', description: 'Unit tests with XCTest', difficulty: Difficulty.INTERMEDIATE, sortOrder: 90 },
  { slug: 'ui-testing', name: 'UI Testing', description: 'UI testing automation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 91 },
  { slug: 'xctest', name: 'XCTest', description: 'Apple XCTest framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 92 },
  { slug: 'test-coverage', name: 'Test Coverage', description: 'Measuring test coverage', difficulty: Difficulty.INTERMEDIATE, sortOrder: 93 },
  { slug: 'mocking', name: 'Mocking', description: 'Mocking in unit tests', difficulty: Difficulty.INTERMEDIATE, sortOrder: 94 },

  // ==== APP DISTRIBUTION ====
  { slug: 'app-distribution', name: 'App Distribution', description: 'Distributing iOS apps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 95 },
  { slug: 'app-archive', name: 'App Archive', description: 'Creating app archives', difficulty: Difficulty.INTERMEDIATE, sortOrder: 96 },
  { slug: 'provisioning-profiles', name: 'Provisioning Profiles', description: 'Managing provisioning profiles', difficulty: Difficulty.INTERMEDIATE, sortOrder: 97 },
  { slug: 'code-signing', name: 'Code Signing', description: 'Code signing certificates', difficulty: Difficulty.INTERMEDIATE, sortOrder: 98 },
  { slug: 'app-store-connect', name: 'App Store Connect', description: 'Using App Store Connect', difficulty: Difficulty.INTERMEDIATE, sortOrder: 99 },
  { slug: 'app-store-guidelines', name: 'App Store Guidelines', description: 'App Store review guidelines', difficulty: Difficulty.INTERMEDIATE, sortOrder: 100 },
  { slug: 'beta-testing', name: 'Beta Testing', description: 'TestFlight beta testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 101 },

  // ==== CONTINUOUS LEARNING ====
  { slug: 'keep-learning-ios', name: 'Continuous Learning', description: 'Continue learning iOS development', difficulty: Difficulty.BEGINNER, sortOrder: 102 },
];

const ROADMAP_EDGES_DATA = [
  // Core platforms
  { source: 'core-os', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'core-services', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'core-touch', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },

  // Pick a language
  { source: 'pick-a-language', target: 'ios-developer', type: SkillEdgeType.PREREQUISITE },
  { source: 'objective-c', target: 'pick-a-language', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'swift', target: 'pick-a-language', type: SkillEdgeType.SUBSKILL_OF },

  // The Fundamentals
  { source: 'the-fundamentals', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },

  // Core Programming Constructs
  { source: 'core-programming-constructs', target: 'the-fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'declarative-syntax', target: 'core-programming-constructs', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'state-management', target: 'core-programming-constructs', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'view-management', target: 'core-programming-constructs', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'error-handling', target: 'core-programming-constructs', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'concurrency-dispatch-queue', target: 'core-programming-constructs', type: SkillEdgeType.SUBSKILL_OF },

  // iOS Basics
  { source: 'ios-basics', target: 'the-fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'views', target: 'ios-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'view-controllers', target: 'ios-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'user-interactions', target: 'ios-basics', type: SkillEdgeType.SUBSKILL_OF },

  // App Components
  { source: 'app-components', target: 'ios-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'structure-interviews', target: 'app-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'various-editors', target: 'app-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'editors', target: 'various-editors', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'attribute-inspector', target: 'various-editors', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'size-inspector', target: 'various-editors', type: SkillEdgeType.SUBSKILL_OF },

  // Navigating
  { source: 'navigating', target: 'ios-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'navigation-controller', target: 'navigating', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tab-bar-controller', target: 'navigating', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'segues', target: 'navigating', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'constraints', target: 'navigating', type: SkillEdgeType.SUBSKILL_OF },

  // Debugger
  { source: 'debugger', target: 'the-fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'breakpoints', target: 'debugger', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'stepping', target: 'debugger', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'profiling-documents', target: 'debugger', type: SkillEdgeType.SUBSKILL_OF },

  // Interface Builder
  { source: 'interface-builder', target: 'ios-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'storyboard', target: 'interface-builder', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'xib-files', target: 'interface-builder', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'outlets-actions', target: 'interface-builder', type: SkillEdgeType.SUBSKILL_OF },

  // Lingo
  { source: 'lingo', target: 'ios-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aspect-ratio', target: 'lingo', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'view-semantics', target: 'lingo', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'casting-annotations', target: 'lingo', type: SkillEdgeType.SUBSKILL_OF },

  // Core Animation
  { source: 'core-animation', target: 'ios-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'declarative-animations', target: 'core-animation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'constraints-animation', target: 'core-animation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'view-animations', target: 'core-animation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'animated-transitions', target: 'core-animation', type: SkillEdgeType.SUBSKILL_OF },

  // Design Architecture
  { source: 'design-architecture', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mvc-pattern', target: 'design-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mvvm-pattern', target: 'design-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mvp-pattern', target: 'design-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'viper-pattern', target: 'design-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'clean-architecture', target: 'design-architecture', type: SkillEdgeType.SUBSKILL_OF },

  // Debugging
  { source: 'debugging', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'console-output', target: 'debugging', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'lldb', target: 'debugging', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'instruments-profiler', target: 'debugging', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'memory-profiling', target: 'instruments-profiler', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cpu-profiling', target: 'instruments-profiler', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'crash-logs', target: 'debugging', type: SkillEdgeType.SUBSKILL_OF },

  // Storage
  { source: 'storage', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'userdefaults', target: 'storage', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'file-system', target: 'storage', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'plist', target: 'storage', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sqlite', target: 'storage', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'core-data', target: 'storage', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'realm', target: 'storage', type: SkillEdgeType.SUBSKILL_OF },

  // Concurrency and Multithreading
  { source: 'concurrency-multithreading', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'grand-central-dispatch', target: 'concurrency-multithreading', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'operation-queue', target: 'concurrency-multithreading', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'async-await', target: 'concurrency-multithreading', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pthread', target: 'concurrency-multithreading', type: SkillEdgeType.SUBSKILL_OF },

  // Frameworks & Library
  { source: 'frameworks-library', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cocoapods', target: 'frameworks-library', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'package-manager', target: 'frameworks-library', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'carthage', target: 'frameworks-library', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rx-framework', target: 'frameworks-library', type: SkillEdgeType.SUBSKILL_OF },

  // Networking
  { source: 'networking', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'url-session', target: 'networking', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rest-api', target: 'networking', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'json-parsing', target: 'rest-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rest-client', target: 'networking', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'http-https', target: 'networking', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'security-certificates', target: 'networking', type: SkillEdgeType.SUBSKILL_OF },

  // Accessibility
  { source: 'accessibility', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'voiceover', target: 'accessibility', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dynamic-type', target: 'accessibility', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'accessibility-inspector', target: 'accessibility', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'accessibility-api', target: 'accessibility', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'wcag-standards', target: 'accessibility', type: SkillEdgeType.SUBSKILL_OF },

  // Testing
  { source: 'testing', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'unit-testing', target: 'testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ui-testing', target: 'testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'xctest', target: 'testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'test-coverage', target: 'testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mocking', target: 'unit-testing', type: SkillEdgeType.SUBSKILL_OF },

  // App Distribution
  { source: 'app-distribution', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'app-archive', target: 'app-distribution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'provisioning-profiles', target: 'app-distribution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'code-signing', target: 'app-distribution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'app-store-connect', target: 'app-distribution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'app-store-guidelines', target: 'app-distribution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'beta-testing', target: 'app-distribution', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning-ios', target: 'ios-developer', type: SkillEdgeType.SUBSKILL_OF },
];

interface RoadmapNode {
  slug: string;
  name: string;
  description: string;
  difficulty: any;
  sortOrder: number;
}

const ROADMAP_NODES: RoadmapNode[] = ROADMAP_NODES_DATA.map((node) => ({
  ...node,
  resources: buildNodeResources(node.name, node.slug),
})) as RoadmapNode[];

async function main() {
  console.log('Starting iOS Developer roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'ios-developer' },
    update: { name: 'iOS Developer', description: 'iOS Developer specialization' },
    create: {
      name: 'iOS Developer',
      slug: 'ios-developer',
      description: 'iOS Developer specialization',
    },
  });
  console.log('✓ Category created/updated');

  // Insert all skills
  console.log(`Inserting ${ROADMAP_NODES.length} skills...`);
  for (const node of ROADMAP_NODES) {
    await prisma.skill.upsert({
      where: { slug: node.slug },
      update: {
        name: node.name,
        description: node.description,
        resources: (node as any).resources,
        difficulty: node.difficulty,
        categoryId: category.id,
      },
      create: {
        slug: node.slug,
        name: node.name,
        normalizedName: node.name.toLowerCase().replace(/\s+/g, '-'),
        description: node.description,
        resources: (node as any).resources,
        difficulty: node.difficulty,
        categoryId: category.id,
      },
    });
  }
  console.log(`✓ ${ROADMAP_NODES.length} skills inserted`);

  // Create or update roadmap
  const rootSkill = await prisma.skill.findUnique({
    where: { slug: 'ios-developer' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'ios-developer' },
    update: {
      name: 'iOS Developer',
      description: 'Comprehensive iOS Developer roadmap covering Swift/Objective-C, UI development, Navigation, Debugging, Architecture patterns, Networking, Storage, Testing, and App Distribution for iOS platforms',
      icon: '🍎',
      color: '#555555',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'iOS Developer',
      slug: 'ios-developer',
      description: 'Comprehensive iOS Developer roadmap covering Swift/Objective-C, UI development, Navigation, Debugging, Architecture patterns, Networking, Storage, Testing, and App Distribution for iOS platforms',
      icon: '🍎',
      color: '#555555',
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
    }
  }
  console.log(`✓ ${ROADMAP_EDGES_DATA.length} edges inserted`);

  console.log('\n✓ iOS Developer roadmap seeded successfully!');
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
