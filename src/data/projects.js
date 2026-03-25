export const PROJECTS = [
  {
    id: "database-backup-system",
    slug: "database-backup-system",
    title: "Database Backup System",
    difficulty: "beginner",
    tags: ["PostgreSQL", "Bash", "CLI"],
    description:
      "Build an automated backup and point-in-time recovery system using pg_dump and pg_restore.",
    startedCount: 1240,
    roadmapTag: "backup-and-recovery",
    requirements: [
      "Perform a full database backup using pg_dump",
      "Restore a database from backup using pg_restore",
      "Automate backup with a cron job script",
      "Implement Point-in-Time Recovery (PITR)",
      "Handle schema-only and table-only backup separately",
      "Add logging for each backup and restore operation",
      "Write a README explaining how to run the scripts",
    ],
    hints: [
      "Use pg_dump -F c for custom compressed format",
      "Use pg_restore --clean to drop and recreate objects",
      "WAL archiving is the key to enabling PITR",
      "Test restoring into a separate test database first",
    ],
    resources: [
      {
        title: "pg_dump Official Docs",
        url: "https://www.postgresql.org/docs/current/app-pgdump.html",
      },
      {
        title: "pg_restore Official Docs",
        url: "https://www.postgresql.org/docs/current/app-pgrestore.html",
      },
      {
        title: "PITR Guide",
        url: "https://www.postgresql.org/docs/current/continuous-archiving.html",
      },
    ],
  },
  {
    id: "ddl-migration-tool",
    slug: "ddl-migration-tool",
    title: "DDL Migration Tool",
    difficulty: "intermediate",
    tags: ["PostgreSQL", "SQL", "Migrations"],
    description:
      "Create a lightweight migration runner that applies ordered DDL scripts safely.",
    startedCount: 915,
    roadmapTag: "ddl-migration-tool",
    requirements: [
      "Design a migrations table to track applied scripts",
      "Run pending .sql files in deterministic order",
      "Prevent duplicate migrations in concurrent runs",
      "Support rollback scripts for failed deployments",
      "Print clear success and failure logs to terminal",
      "Document migration naming conventions and workflow",
      "Add a dry-run mode to preview pending changes",
    ],
    hints: [
      "Use advisory locks to avoid concurrent migration runs",
      "Store checksum per migration for drift detection",
      "Run all migration statements in a single transaction when possible",
      "Use statement_timeout to avoid long blocking operations",
    ],
    resources: [
      {
        title: "PostgreSQL DDL Commands",
        url: "https://www.postgresql.org/docs/current/ddl.html",
      },
      {
        title: "Advisory Locks",
        url: "https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS",
      },
    ],
  },
  {
    id: "schema-manager",
    slug: "schema-manager",
    title: "Schema Manager",
    difficulty: "intermediate",
    tags: ["PostgreSQL", "Schema", "Automation"],
    description:
      "Build a schema inspection and synchronization tool for multi-environment workflows.",
    startedCount: 802,
    roadmapTag: "schema-manager",
    requirements: [
      "Read schema metadata from information_schema",
      "Compare two database schemas and detect drift",
      "Generate SQL patches for missing tables and columns",
      "Handle enum and constraint diffs safely",
      "Add ignore rules for selected tables",
      "Output a report in markdown format",
      "Provide a command line interface for all operations",
    ],
    hints: [
      "information_schema is good for portability",
      "pg_catalog gives deeper PostgreSQL-specific metadata",
      "Always compare normalized SQL definitions",
      "Separate detect and apply steps to reduce risk",
    ],
    resources: [
      {
        title: "information_schema Reference",
        url: "https://www.postgresql.org/docs/current/information-schema.html",
      },
      {
        title: "System Catalogs",
        url: "https://www.postgresql.org/docs/current/catalogs.html",
      },
    ],
  },
  {
    id: "table-architect",
    slug: "table-architect",
    title: "Table Architect",
    difficulty: "beginner",
    tags: ["PostgreSQL", "Data Modeling", "SQL"],
    description:
      "Design normalized tables with constraints, foreign keys, and lifecycle-friendly defaults.",
    startedCount: 1485,
    roadmapTag: "table-architect",
    requirements: [
      "Design 3NF schema for a sample domain",
      "Create primary keys and foreign key relationships",
      "Add check constraints for critical business rules",
      "Use generated columns or defaults where useful",
      "Create seed data for local testing",
      "Write diagrams or table relation documentation",
      "Validate referential integrity with test queries",
    ],
    hints: [
      "Prefer explicit constraint names for maintainability",
      "Use timestamptz for time-sensitive systems",
      "Avoid overusing nullable columns in core tables",
      "Use composite indexes for frequent filter pairs",
    ],
    resources: [
      {
        title: "Table Expressions",
        url: "https://www.postgresql.org/docs/current/queries-table-expressions.html",
      },
      {
        title: "CREATE TABLE",
        url: "https://www.postgresql.org/docs/current/sql-createtable.html",
      },
    ],
  },
  {
    id: "query-optimizer-lab",
    slug: "query-optimizer-lab",
    title: "Query Optimizer Lab",
    difficulty: "advanced",
    tags: ["PostgreSQL", "Performance", "SQL"],
    description:
      "Profile and tune slow SQL queries using EXPLAIN ANALYZE and execution statistics.",
    startedCount: 690,
    roadmapTag: "query-optimizer",
    requirements: [
      "Capture baseline query latency metrics",
      "Use EXPLAIN ANALYZE to inspect execution plans",
      "Refactor queries to reduce sequential scans",
      "Tune joins, filters, and sort operations",
      "Compare performance before and after optimization",
      "Automate benchmark runs with repeatable scripts",
      "Summarize findings in an optimization report",
    ],
    hints: [
      "Buffer and timing sections are key in EXPLAIN ANALYZE",
      "Use pg_stat_statements for identifying high-cost queries",
      "Set work_mem carefully before heavy sorts",
      "Index-only scans can drastically reduce IO",
    ],
    resources: [
      {
        title: "Using EXPLAIN",
        url: "https://www.postgresql.org/docs/current/using-explain.html",
      },
      {
        title: "pg_stat_statements",
        url: "https://www.postgresql.org/docs/current/pgstatstatements.html",
      },
    ],
  },
  {
    id: "index-designer",
    slug: "index-designer",
    title: "Index Designer",
    difficulty: "intermediate",
    tags: ["PostgreSQL", "Indexing", "Performance"],
    description:
      "Build an index recommendation helper based on observed query patterns.",
    startedCount: 973,
    roadmapTag: "index-designer",
    requirements: [
      "Parse query patterns from log or sample workload",
      "Recommend B-tree, GIN, or partial indexes",
      "Estimate write overhead impact of each index",
      "Generate SQL migration scripts for chosen indexes",
      "Detect duplicate or unused indexes",
      "Run before/after benchmark scenarios",
      "Create an index decision matrix in README",
    ],
    hints: [
      "Use pg_indexes and pg_stat_user_indexes for existing index insight",
      "Partial indexes are strong when predicates are stable",
      "GIN indexes shine for array and JSONB use cases",
      "Avoid index bloat by reviewing fillfactor and churn",
    ],
    resources: [
      {
        title: "PostgreSQL Indexes",
        url: "https://www.postgresql.org/docs/current/indexes.html",
      },
      {
        title: "JSONB Indexing",
        url: "https://www.postgresql.org/docs/current/datatype-json.html#JSON-INDEXING",
      },
    ],
  },
  {
    id: "query-console-cli",
    slug: "query-console-cli",
    title: "Query Console CLI",
    difficulty: "beginner",
    tags: ["CLI", "PostgreSQL", "Developer Tools"],
    description:
      "Ship a polished command-line SQL console with saved snippets and query history.",
    startedCount: 1182,
    roadmapTag: "query-console",
    requirements: [
      "Connect to PostgreSQL with DSN configuration",
      "Execute ad hoc SQL statements with formatted output",
      "Persist command history between sessions",
      "Add named query snippets support",
      "Implement transaction mode controls",
      "Handle SQL errors with clear feedback",
      "Add help command and usage examples",
    ],
    hints: [
      "Use readline-style input for history and editing",
      "Color output improves readability for CLI UX",
      "Use LIMIT defaults to avoid huge accidental result sets",
      "Implement timeout flags for long-running queries",
    ],
    resources: [
      {
        title: "psql Reference",
        url: "https://www.postgresql.org/docs/current/app-psql.html",
      },
      {
        title: "Transaction Isolation",
        url: "https://www.postgresql.org/docs/current/transaction-iso.html",
      },
    ],
  },
  {
    id: "schema-diff-viewer",
    slug: "schema-diff-viewer",
    title: "Schema Diff Viewer",
    difficulty: "intermediate",
    tags: ["PostgreSQL", "Schema", "Visualization"],
    description:
      "Build a side-by-side schema diff tool that highlights destructive changes.",
    startedCount: 544,
    roadmapTag: "schema-diff",
    requirements: [
      "Load schemas from two PostgreSQL instances",
      "Diff tables, columns, constraints, and indexes",
      "Highlight destructive changes with warning labels",
      "Support export to JSON and markdown",
      "Filter diff by schema or object type",
      "Show execution-safe ordering for change scripts",
      "Document edge cases and unsupported objects",
    ],
    hints: [
      "Treat rename detection separately from add and drop",
      "Object dependency order matters for generated scripts",
      "Use consistent object signatures for comparison",
      "Track collation and default value differences explicitly",
    ],
    resources: [
      {
        title: "ALTER TABLE",
        url: "https://www.postgresql.org/docs/current/sql-altertable.html",
      },
      {
        title: "Dependency Tracking",
        url: "https://www.postgresql.org/docs/current/ddl-depend.html",
      },
    ],
  },
  {
    id: "replication-health-monitor",
    slug: "replication-health-monitor",
    title: "Replication Health Monitor",
    difficulty: "advanced",
    tags: ["PostgreSQL", "Replication", "Monitoring"],
    description:
      "Track replication lag and failover readiness with alerting-friendly metrics.",
    startedCount: 427,
    roadmapTag: "replication",
    requirements: [
      "Collect primary and replica WAL metrics",
      "Display replication lag in seconds and bytes",
      "Raise alerts when lag crosses thresholds",
      "Add failover readiness checklist",
      "Support multiple replica targets",
      "Persist health snapshots for trend analysis",
      "Write operations guide for incident response",
    ],
    hints: [
      "pg_stat_replication provides real-time replication state",
      "Track write, flush, and replay lag separately",
      "Alert fatigue is reduced with cooldown windows",
      "Replication slots can prevent WAL loss",
    ],
    resources: [
      {
        title: "Monitoring Replication",
        url: "https://www.postgresql.org/docs/current/monitoring-stats.html",
      },
      {
        title: "Streaming Replication",
        url: "https://www.postgresql.org/docs/current/warm-standby.html",
      },
    ],
  },
  {
    id: "vacuum-autotune-dashboard",
    slug: "vacuum-autotune-dashboard",
    title: "VACUUM Autotune Dashboard",
    difficulty: "advanced",
    tags: ["PostgreSQL", "Maintenance", "Performance"],
    description:
      "Analyze table bloat and recommend VACUUM and autovacuum tuning actions.",
    startedCount: 361,
    roadmapTag: "vacuum-and-bloat",
    requirements: [
      "Compute table bloat indicators",
      "Track dead tuples and autovacuum frequency",
      "Recommend autovacuum threshold settings",
      "Show candidate tables for manual VACUUM",
      "Track bloat trend over time",
      "Export recommendations to markdown",
      "Add safeguards for production usage",
    ],
    hints: [
      "Use pg_stat_user_tables for dead tuple metrics",
      "Autovacuum scale factors need per-table tuning",
      "VACUUM FULL is expensive and should be used sparingly",
      "Correlate bloat with write-heavy workloads",
    ],
    resources: [
      {
        title: "Routine Vacuuming",
        url: "https://www.postgresql.org/docs/current/routine-vacuuming.html",
      },
      {
        title: "Storage Internals",
        url: "https://www.postgresql.org/docs/current/storage.html",
      },
    ],
  },
  {
    id: "permissions-auditor",
    slug: "permissions-auditor",
    title: "Permissions Auditor",
    difficulty: "intermediate",
    tags: ["PostgreSQL", "Security", "SQL"],
    description:
      "Audit roles and grants, then generate least-privilege remediation scripts.",
    startedCount: 758,
    roadmapTag: "permissions",
    requirements: [
      "Enumerate all roles and inherited memberships",
      "Scan table and schema grants per role",
      "Detect over-privileged service accounts",
      "Generate revoke and grant remediation SQL",
      "Support allowlist exceptions",
      "Output human-readable audit report",
      "Include an onboarding doc for secure role design",
    ],
    hints: [
      "Catalog views in information_schema help inspect grants",
      "Default privileges can silently overexpose objects",
      "Separate readonly and readwrite roles",
      "Always validate remediation in staging first",
    ],
    resources: [
      {
        title: "GRANT Command",
        url: "https://www.postgresql.org/docs/current/sql-grant.html",
      },
      {
        title: "Role Attributes",
        url: "https://www.postgresql.org/docs/current/role-attributes.html",
      },
    ],
  },
  {
    id: "jsonb-event-store",
    slug: "jsonb-event-store",
    title: "JSONB Event Store",
    difficulty: "intermediate",
    tags: ["PostgreSQL", "JSONB", "Backend"],
    description:
      "Implement an append-only event store using JSONB payloads and replay APIs.",
    startedCount: 1063,
    roadmapTag: "jsonb-patterns",
    requirements: [
      "Design append-only event table with JSONB payload",
      "Create indexes for event type and aggregate id",
      "Build replay query for aggregate reconstruction",
      "Implement optimistic concurrency control",
      "Add snapshot support for long streams",
      "Validate payload schema before insert",
      "Document event versioning strategy",
    ],
    hints: [
      "GIN indexes help JSONB containment queries",
      "Sequence numbers are important for replay order",
      "Snapshots reduce replay latency for old aggregates",
      "Store metadata separately from payload for filtering",
    ],
    resources: [
      {
        title: "JSON Types",
        url: "https://www.postgresql.org/docs/current/datatype-json.html",
      },
      {
        title: "Concurrency Control",
        url: "https://www.postgresql.org/docs/current/mvcc.html",
      },
    ],
  },
  {
    id: "data-quality-validator",
    slug: "data-quality-validator",
    title: "Data Quality Validator",
    difficulty: "beginner",
    tags: ["PostgreSQL", "Validation", "ETL"],
    description:
      "Create a rule-based validator that flags bad records before analytics ingestion.",
    startedCount: 835,
    roadmapTag: "data-quality",
    requirements: [
      "Define validation rules in a config file",
      "Run checks for nulls, ranges, and duplicate keys",
      "Store failed rows in a quarantine table",
      "Generate daily validation summary report",
      "Support per-table validation profiles",
      "Add CLI command for manual runs",
      "Write a guide for adding new rules",
    ],
    hints: [
      "Use CHECK constraints where invariants are strict",
      "Window functions can detect duplicate anomalies",
      "Keep quarantine schema separate from production tables",
      "Emit machine-readable reports for automation",
    ],
    resources: [
      {
        title: "Window Functions",
        url: "https://www.postgresql.org/docs/current/tutorial-window.html",
      },
      {
        title: "CHECK Constraints",
        url: "https://www.postgresql.org/docs/current/ddl-constraints.html",
      },
    ],
  },
];
