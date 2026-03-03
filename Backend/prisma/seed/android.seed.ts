/**
 * Android Roadmap Seed Script
 *
 * Seeds the Android development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/android.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// Android Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'android', name: 'Android', description: 'Complete Android development roadmap', difficulty: Difficulty.BEGINNER, sortOrder: 0 },

  // Related Roadmaps
  { slug: 'related-roadmaps-android', name: 'Related Roadmaps', description: 'Other platform roadmaps', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'react-native-roadmap', name: 'React Native Roadmap', description: 'React Native development path', difficulty: Difficulty.INTERMEDIATE, sortOrder: 2 },
  { slug: 'flutter-roadmap', name: 'Flutter Roadmap', description: 'Flutter development path', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },
  { slug: 'ios-roadmap', name: 'iOS Roadmap', description: 'iOS development path', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },

  // Prerequisites & Basics
  { slug: 'development-ide', name: 'Development IDE', description: 'Android Studio and IDEs', difficulty: Difficulty.BEGINNER, sortOrder: 5 },
  { slug: 'basics-kotlin', name: 'Basics of Kotlin', description: 'Kotlin programming language fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 6 },
  { slug: 'basics-oop', name: 'Basics of OOP', description: 'Object-oriented programming concepts', difficulty: Difficulty.BEGINNER, sortOrder: 7 },
  { slug: 'dsa', name: 'Data Structures and Algorithms', description: 'DSA fundamentals for Android', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'gradle', name: 'What is and how to use Gradle?', description: 'Gradle build system', difficulty: Difficulty.BEGINNER, sortOrder: 9 },
  { slug: 'hello-world-app', name: 'Create a Basic Hello World App', description: 'First Android application', difficulty: Difficulty.BEGINNER, sortOrder: 10 },

  // Language Selection
  { slug: 'pick-language', name: 'Pick a Language', description: 'Choose your Android programming language', difficulty: Difficulty.BEGINNER, sortOrder: 11 },
  { slug: 'kotlin-lang', name: 'Kotlin', description: 'Kotlin programming language', difficulty: Difficulty.BEGINNER, sortOrder: 12 },
  { slug: 'java-lang', name: 'Java', description: 'Java programming language', difficulty: Difficulty.BEGINNER, sortOrder: 13 },

  // Version Control
  { slug: 'git', name: 'Git', description: 'Version control system', difficulty: Difficulty.BEGINNER, sortOrder: 14 },

  // The Fundamentals
  { slug: 'fundamentals', name: 'The Fundamentals', description: 'Core Android development concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },

  // Services
  { slug: 'services', name: 'Services', description: 'Android Services component', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'content-provider', name: 'Content Provider', description: 'Content Provider for data sharing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'broadcast-receiver', name: 'Broadcast Receiver', description: 'Broadcast receivers for events', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },

  // Intent
  { slug: 'intent', name: 'Intent', description: 'Android Intents', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'implicit-intents', name: 'Implicit Intents', description: 'Implicit intent handling', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'explicit-intents', name: 'Explicit Intents', description: 'Explicit intent handling', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'intent-filters', name: 'Intent Filters', description: 'Intent filters configuration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },

  // Activity
  { slug: 'activity', name: 'Activity', description: 'Android Activity component', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'activity-lifecycle', name: 'Activity LifeCycle', description: 'Activity lifecycle methods', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'state-changes', name: 'State Changes', description: 'Handling state changes', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'tasks-backstack', name: 'Tasks & Backstack', description: 'Task and back stack management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },

  // App Components
  { slug: 'app-components', name: 'App Components', description: 'Android app components', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'jetpack-compose', name: 'Jetpack Compose', description: 'Modern Android UI toolkit', difficulty: Difficulty.ADVANCED, sortOrder: 28 },

  // Interface & Navigation
  { slug: 'interface-navigation', name: 'Interface & Navigation', description: 'UI and navigation components', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },

  // Layouts
  { slug: 'layouts', name: 'Layouts', description: 'Android layout types', difficulty: Difficulty.BEGINNER, sortOrder: 30 },
  { slug: 'frame-layout', name: 'Frame', description: 'FrameLayout', difficulty: Difficulty.BEGINNER, sortOrder: 31 },
  { slug: 'linear-layout', name: 'Linear', description: 'LinearLayout', difficulty: Difficulty.BEGINNER, sortOrder: 32 },
  { slug: 'relative-layout', name: 'Relative', description: 'RelativeLayout', difficulty: Difficulty.BEGINNER, sortOrder: 33 },
  { slug: 'constraint-layout', name: 'Constraint', description: 'ConstraintLayout', difficulty: Difficulty.BEGINNER, sortOrder: 34 },

  // Elements
  { slug: 'elements', name: 'Elements', description: 'UI elements and components', difficulty: Difficulty.BEGINNER, sortOrder: 35 },
  { slug: 'textview', name: 'TextVIew', description: 'TextView widget', difficulty: Difficulty.BEGINNER, sortOrder: 36 },
  { slug: 'buttons', name: 'Buttons', description: 'Button components', difficulty: Difficulty.BEGINNER, sortOrder: 37 },
  { slug: 'imageview', name: 'ImageView', description: 'ImageView widget', difficulty: Difficulty.BEGINNER, sortOrder: 38 },
  { slug: 'edittext', name: 'EditText', description: 'EditText widget', difficulty: Difficulty.BEGINNER, sortOrder: 39 },

  // Navigation Components
  { slug: 'dialogs', name: 'Dialogs', description: 'Dialog components', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'toast', name: 'Toast', description: 'Toast notifications', difficulty: Difficulty.BEGINNER, sortOrder: 41 },
  { slug: 'fragments', name: 'Fragments', description: 'Fragment components', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'bottom-sheet', name: 'Bottom Sheet', description: 'Bottom sheet dialog', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  { slug: 'recyclerview', name: 'RecycleView', description: 'RecyclerView for lists', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'drawer', name: 'Drawer', description: 'Navigation drawer', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'listview', name: 'ListView', description: 'ListView component', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'tabs', name: 'Tabs', description: 'Tab navigation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'animations', name: 'Animations', description: 'UI animations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },

  // App Shortcuts and Navigation Components
  { slug: 'app-shortcuts', name: 'App Shortcuts', description: 'App shortcuts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'navigation-components', name: 'Navigation Components', description: 'Navigation component library', difficulty: Difficulty.ADVANCED, sortOrder: 50 },

  // Design & Architecture
  { slug: 'design-architecture', name: 'Design & Architecture', description: 'Architectural patterns and design', difficulty: Difficulty.ADVANCED, sortOrder: 51 },

  // Architectural Patterns
  { slug: 'architectural-patterns', name: 'Architectural Patterns', description: 'Design architecture patterns', difficulty: Difficulty.ADVANCED, sortOrder: 52 },
  { slug: 'mvvm', name: 'MVVM', description: 'Model-View-ViewModel pattern', difficulty: Difficulty.ADVANCED, sortOrder: 53 },
  { slug: 'mvi', name: 'MVI', description: 'Model-View-Intent pattern', difficulty: Difficulty.ADVANCED, sortOrder: 54 },
  { slug: 'mvp', name: 'MVP', description: 'Model-View-Presenter pattern', difficulty: Difficulty.ADVANCED, sortOrder: 55 },
  { slug: 'mvc', name: 'MVC', description: 'Model-View-Controller pattern', difficulty: Difficulty.ADVANCED, sortOrder: 56 },

  // Design Patterns
  { slug: 'design-patterns', name: 'Design Patterns', description: 'Software design patterns', difficulty: Difficulty.ADVANCED, sortOrder: 57 },
  { slug: 'repository-pattern', name: 'Repository Pattern', description: 'Repository pattern for data access', difficulty: Difficulty.ADVANCED, sortOrder: 58 },
  { slug: 'observer-pattern', name: 'Observer Pattern', description: 'Observer pattern implementation', difficulty: Difficulty.ADVANCED, sortOrder: 59 },
  { slug: 'builder-pattern', name: 'Builder Pattern', description: 'Builder pattern for object construction', difficulty: Difficulty.ADVANCED, sortOrder: 60 },
  { slug: 'factory-pattern', name: 'Factory Pattern', description: 'Factory pattern implementation', difficulty: Difficulty.ADVANCED, sortOrder: 61 },

  // Reactive
  { slug: 'reactive', name: 'Reactive', description: 'Reactive programming patterns', difficulty: Difficulty.ADVANCED, sortOrder: 62 },
  { slug: 'flow', name: 'Flow', description: 'Kotlin Flow for reactive programming', difficulty: Difficulty.ADVANCED, sortOrder: 63 },
  { slug: 'rxkotlin', name: 'RxKotlin', description: 'RxKotlin reactive extensions', difficulty: Difficulty.ADVANCED, sortOrder: 64 },
  { slug: 'rxjava', name: 'RxJava', description: 'RxJava reactive extensions', difficulty: Difficulty.ADVANCED, sortOrder: 65 },
  { slug: 'livedata', name: 'LiveData', description: 'Android Architecture Component LiveData', difficulty: Difficulty.ADVANCED, sortOrder: 66 },

  // Storage
  { slug: 'storage', name: 'Storage', description: 'Data storage mechanisms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },
  { slug: 'shared-preferences', name: 'Shared Preferences', description: 'SharedPreferences for key-value storage', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },
  { slug: 'datastore', name: 'DataStore', description: 'DataStore for data persistence', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },
  { slug: 'room-database', name: 'Room Database', description: 'Room for local database', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },
  { slug: 'file-system', name: 'File System', description: 'File system storage', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },

  // Network
  { slug: 'network', name: 'Network', description: 'Network operations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'retrofit', name: 'Retro', description: 'Retrofit HTTP client', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },
  { slug: 'okhttp', name: 'OkHttp', description: 'OkHttp networking library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'apollo-android', name: 'Apollo-Android', description: 'Apollo GraphQL client for Android', difficulty: Difficulty.ADVANCED, sortOrder: 75 },

  // Asynchronism
  { slug: 'asyncronism', name: 'Asyncronism', description: 'Asynchronous programming', difficulty: Difficulty.ADVANCED, sortOrder: 76 },
  { slug: 'coroutines', name: 'Coroutines', description: 'Kotlin coroutines', difficulty: Difficulty.ADVANCED, sortOrder: 77 },
  { slug: 'threads', name: 'Threads', description: 'Threading in Android', difficulty: Difficulty.ADVANCED, sortOrder: 78 },
  { slug: 'workmanager', name: 'WorkManager', description: 'WorkManager for background tasks', difficulty: Difficulty.ADVANCED, sortOrder: 79 },

  // Linting
  { slug: 'linting', name: 'Linting', description: 'Code analysis and linting tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'klint', name: 'Klint', description: 'Kotlin linter', difficulty: Difficulty.INTERMEDIATE, sortOrder: 81 },
  { slug: 'detekt', name: 'Detekt', description: 'Detekt static analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 82 },

  // Debugging & Tools
  { slug: 'debugging', name: 'Debugging', description: 'Debugging and profiling tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 83 },
  { slug: 'timber', name: 'Timber', description: 'Timber logging library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 84 },
  { slug: 'leak-canary', name: 'Leak Canary', description: 'Memory leak detection', difficulty: Difficulty.INTERMEDIATE, sortOrder: 85 },
  { slug: 'chucker', name: 'Chucker', description: 'Network request inspector', difficulty: Difficulty.INTERMEDIATE, sortOrder: 86 },
  { slug: 'jetpack-benchmark', name: 'Jetpack Benchmark', description: 'Performance benchmarking', difficulty: Difficulty.INTERMEDIATE, sortOrder: 87 },

  // Testing
  { slug: 'testing', name: 'Testing', description: 'Testing frameworks and practices', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },
  { slug: 'espresso', name: 'Espresso', description: 'Espresso UI testing framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 89 },
  { slug: 'junit', name: 'JUnit', description: 'JUnit unit testing framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 90 },

  // Common Services
  { slug: 'common-services', name: 'Common Services', description: 'Google services and common libraries', difficulty: Difficulty.INTERMEDIATE, sortOrder: 91 },
  { slug: 'google-admob', name: 'Google Admob', description: 'Google AdMob for monetization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 92 },
  { slug: 'google-play-services', name: 'Google Play Services', description: 'Google Play Services APIs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 93 },
  { slug: 'google-maps', name: 'Google Maps', description: 'Google Maps integration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 94 },

  // Distribution
  { slug: 'distribution', name: 'Distribution', description: 'App distribution and release', difficulty: Difficulty.INTERMEDIATE, sortOrder: 95 },
  { slug: 'signed-apk', name: 'Signed APK', description: 'Creating signed APK', difficulty: Difficulty.INTERMEDIATE, sortOrder: 96 },
  { slug: 'firebase-distribution', name: 'Firebase Distribution', description: 'Firebase App Distribution', difficulty: Difficulty.INTERMEDIATE, sortOrder: 97 },
  { slug: 'google-playstore', name: 'Google Playstore', description: 'Google Play Store distribution', difficulty: Difficulty.INTERMEDIATE, sortOrder: 98 },

  // Continue Learning
  { slug: 'continue-learning-android', name: 'Visit the following relevant roadmaps', description: 'Related platform tutorials', difficulty: Difficulty.BEGINNER, sortOrder: 99 },
  { slug: 'ios-continue', name: 'iOS', description: 'iOS development roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 100 },
  { slug: 'react-native-continue', name: 'React Native', description: 'React Native development roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 101 },
  { slug: 'flutter-continue', name: 'Flutter', description: 'Flutter development roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 102 },
];

const ROADMAP_EDGES_DATA = [
  // Related Roadmaps
  { source: 'related-roadmaps-android', target: 'android', type: SkillEdgeType.RELATED },
  { source: 'react-native-roadmap', target: 'related-roadmaps-android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'flutter-roadmap', target: 'related-roadmaps-android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ios-roadmap', target: 'related-roadmaps-android', type: SkillEdgeType.SUBSKILL_OF },

  // Prerequisites
  { source: 'development-ide', target: 'android', type: SkillEdgeType.PREREQUISITE },
  { source: 'basics-kotlin', target: 'android', type: SkillEdgeType.PREREQUISITE },
  { source: 'basics-oop', target: 'android', type: SkillEdgeType.PREREQUISITE },
  { source: 'dsa', target: 'android', type: SkillEdgeType.PREREQUISITE },
  { source: 'gradle', target: 'android', type: SkillEdgeType.PREREQUISITE },
  { source: 'hello-world-app', target: 'android', type: SkillEdgeType.PREREQUISITE },

  // Language Selection
  { source: 'pick-language', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kotlin-lang', target: 'pick-language', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'java-lang', target: 'pick-language', type: SkillEdgeType.SUBSKILL_OF },

  // Version Control
  { source: 'git', target: 'android', type: SkillEdgeType.SUBSKILL_OF },

  // The Fundamentals
  { source: 'fundamentals', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'services', target: 'fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'content-provider', target: 'services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'broadcast-receiver', target: 'services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'intent', target: 'fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'implicit-intents', target: 'intent', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'explicit-intents', target: 'intent', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'intent-filters', target: 'intent', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'activity', target: 'fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'activity-lifecycle', target: 'activity', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'state-changes', target: 'activity', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tasks-backstack', target: 'activity', type: SkillEdgeType.SUBSKILL_OF },

  // App Components
  { source: 'app-components', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'jetpack-compose', target: 'app-components', type: SkillEdgeType.SUBSKILL_OF },

  // Interface & Navigation
  { source: 'interface-navigation', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'layouts', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'frame-layout', target: 'layouts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'linear-layout', target: 'layouts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'relative-layout', target: 'layouts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'constraint-layout', target: 'layouts', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'elements', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'textview', target: 'elements', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'buttons', target: 'elements', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'imageview', target: 'elements', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'edittext', target: 'elements', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'dialogs', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'toast', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fragments', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bottom-sheet', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'recyclerview', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'drawer', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'listview', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tabs', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'animations', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'app-shortcuts', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'navigation-components', target: 'interface-navigation', type: SkillEdgeType.SUBSKILL_OF },

  // Design & Architecture
  { source: 'design-architecture', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'architectural-patterns', target: 'design-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mvvm', target: 'architectural-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mvi', target: 'architectural-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mvp', target: 'architectural-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mvc', target: 'architectural-patterns', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'design-patterns', target: 'design-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'repository-pattern', target: 'design-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'observer-pattern', target: 'design-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'builder-pattern', target: 'design-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'factory-pattern', target: 'design-patterns', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'reactive', target: 'design-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'flow', target: 'reactive', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rxkotlin', target: 'reactive', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rxjava', target: 'reactive', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'livedata', target: 'reactive', type: SkillEdgeType.SUBSKILL_OF },

  // Storage
  { source: 'storage', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'shared-preferences', target: 'storage', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'datastore', target: 'storage', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'room-database', target: 'storage', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'file-system', target: 'storage', type: SkillEdgeType.SUBSKILL_OF },

  // Network
  { source: 'network', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'retrofit', target: 'network', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'okhttp', target: 'network', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'apollo-android', target: 'network', type: SkillEdgeType.SUBSKILL_OF },

  // Asynchronism
  { source: 'asyncronism', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'coroutines', target: 'asyncronism', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'threads', target: 'asyncronism', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'workmanager', target: 'asyncronism', type: SkillEdgeType.SUBSKILL_OF },

  // Linting
  { source: 'linting', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'klint', target: 'linting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'detekt', target: 'linting', type: SkillEdgeType.SUBSKILL_OF },

  // Debugging
  { source: 'debugging', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'timber', target: 'debugging', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'leak-canary', target: 'debugging', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'chucker', target: 'debugging', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'jetpack-benchmark', target: 'debugging', type: SkillEdgeType.SUBSKILL_OF },

  // Testing
  { source: 'testing', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'espresso', target: 'testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'junit', target: 'testing', type: SkillEdgeType.SUBSKILL_OF },

  // Common Services
  { source: 'common-services', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'google-admob', target: 'common-services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'google-play-services', target: 'common-services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'google-maps', target: 'common-services', type: SkillEdgeType.SUBSKILL_OF },

  // Distribution
  { source: 'distribution', target: 'android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'signed-apk', target: 'distribution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'firebase-distribution', target: 'distribution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'google-playstore', target: 'distribution', type: SkillEdgeType.SUBSKILL_OF },

  // Continue Learning
  { source: 'continue-learning-android', target: 'android', type: SkillEdgeType.RELATED },
  { source: 'ios-continue', target: 'continue-learning-android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'react-native-continue', target: 'continue-learning-android', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'flutter-continue', target: 'continue-learning-android', type: SkillEdgeType.SUBSKILL_OF },

  // Cross-dependencies
  { source: 'fundamentals', target: 'pick-language', type: SkillEdgeType.BUILDS_ON },
  { source: 'app-components', target: 'fundamentals', type: SkillEdgeType.BUILDS_ON },
  { source: 'design-architecture', target: 'app-components', type: SkillEdgeType.BUILDS_ON },
];

async function main() {
  console.log('Starting Android roadmap seed...');
  
  // Upsert the 'Mobile Development' category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'mobile-development' },
    update: {},
    create: {
      name: 'Mobile Development',
      slug: 'mobile-development',
      description: 'Mobile application development learning paths',
      icon: '📱',
      color: '#3DDC84',
      sortOrder: 6,
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
  const rootSkill = await prisma.skill.findUnique({ where: { slug: 'android' } });

  // Create or update the Android Roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'android' },
    update: {
      name: 'Android',
      description: 'Complete Android development roadmap covering language selection, fundamentals, components, UI, architecture, storage, networking, asynchronous programming, testing, and distribution',
      icon: '📱',
      color: '#3DDC84',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Android',
      slug: 'android',
      description: 'Complete Android development roadmap covering language selection, fundamentals, components, UI, architecture, storage, networking, asynchronous programming, testing, and distribution',
      icon: '📱',
      color: '#3DDC84',
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

  console.log('\n✓ Android roadmap seeded successfully!');
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
