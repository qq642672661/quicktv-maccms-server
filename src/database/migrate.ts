import fs from 'fs';
import path from 'path';
import db from '../config/database';
import logger from '../utils/logger';

interface Migration {
  id: number;
  name: string;
  executed_at: Date;
}

class MigrationManager {
  private migrationsDir: string;

  constructor() {
    this.migrationsDir = path.join(__dirname, 'migrations');
  }

  async init(): Promise<void> {
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('Migrations table initialized');
  }

  async getExecutedMigrations(): Promise<string[]> {
    const result = await db.query<Migration>(
      'SELECT name FROM migrations ORDER BY id'
    );
    return result.rows.map(row => row.name);
  }

  async getPendingMigrations(): Promise<string[]> {
    const executed = await this.getExecutedMigrations();
    const allMigrations = fs
      .readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    return allMigrations.filter(migration => !executed.includes(migration));
  }

  async up(): Promise<void> {
    await this.init();
    const pending = await this.getPendingMigrations();

    if (pending.length === 0) {
      logger.info('No pending migrations');
      return;
    }

    logger.info(`Found ${pending.length} pending migrations`);

    for (const migration of pending) {
      logger.info(`Executing migration: ${migration}`);
      const sql = fs.readFileSync(
        path.join(this.migrationsDir, migration),
        'utf-8'
      );

      await db.transaction(async (client) => {
        await client.query(sql);
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration]
        );
      });

      logger.info(`Migration ${migration} executed successfully`);
    }

    logger.info('All migrations executed successfully');
  }

  async down(): Promise<void> {
    const executed = await this.getExecutedMigrations();

    if (executed.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }

    const lastMigration = executed[executed.length - 1];
    logger.info(`Rolling back migration: ${lastMigration}`);

    const downFile = lastMigration.replace('.sql', '.down.sql');
    const downPath = path.join(this.migrationsDir, downFile);

    if (!fs.existsSync(downPath)) {
      throw new Error(`Rollback file not found: ${downFile}`);
    }

    const sql = fs.readFileSync(downPath, 'utf-8');

    await db.transaction(async (client) => {
      await client.query(sql);
      await client.query(
        'DELETE FROM migrations WHERE name = $1',
        [lastMigration]
      );
    });

    logger.info(`Migration ${lastMigration} rolled back successfully`);
  }

  async create(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const filename = `${timestamp}_${name}.sql`;
    const filepath = path.join(this.migrationsDir, filename);
    const downFilepath = path.join(this.migrationsDir, `${timestamp}_${name}.down.sql`);

    const upTemplate = `-- Migration: ${name}
-- Created at: ${new Date().toISOString()}

-- Add your migration SQL here

`;

    const downTemplate = `-- Rollback: ${name}
-- Created at: ${new Date().toISOString()}

-- Add your rollback SQL here

`;

    fs.writeFileSync(filepath, upTemplate);
    fs.writeFileSync(downFilepath, downTemplate);

    logger.info(`Migration files created: ${filename}`);
  }
}

const manager = new MigrationManager();

const command = process.argv[2];

(async () => {
  try {
    switch (command) {
      case 'up':
        await manager.up();
        break;
      case 'down':
        await manager.down();
        break;
      case 'create':
        const name = process.argv[3];
        if (!name) {
          throw new Error('Migration name is required');
        }
        await manager.create(name);
        break;
      default:
        logger.error('Invalid command. Use: up, down, or create <name>');
        process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    logger.error('Migration error:', error);
    process.exit(1);
  }
})();
