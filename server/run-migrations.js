import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize(
  process.env.DB_NAME || 'senior',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false
  }
);

// Migration files in order
const migrationFiles = [
  '001-create-users.cjs',
  '002-create-diseases.cjs',
  '003-create-questions.cjs',
  '004-create-answers.cjs',
  '005-create-consultations.cjs',
  '006-create-farmer-answers.cjs',
  '007-create-diagnosis-history.cjs',
  '008-create-diagnosis-answers.cjs',
  '009-create-feedback.cjs',
  '010-create-support-requests.cjs',
  '011-create-logs.cjs',
  '012-create-pending-changes.cjs',
  '013-create-role-change-requests.cjs',
  '014-seed-initial-data.cjs',
  '015-update-pending-changes.cjs',
  '016-add-phone-to-users.cjs'
];

async function runMigrations() {
  try {
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    console.log('📋 Running migrations...');
    
    for (const file of migrationFiles) {
      const migrationPath = path.join(__dirname, 'migrations', file);
      
      if (fs.existsSync(migrationPath)) {
        console.log(`🔄 Running migration: ${file}`);
        
        // Import and run migration
        const migration = await import(migrationPath);
        const migrationModule = migration.default || migration;
        await migrationModule.up(sequelize.getQueryInterface(), Sequelize);
        
        console.log(`✅ Completed: ${file}`);
      } else {
        console.log(`⚠️  Migration file not found: ${file}`);
      }
    }

    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export default runMigrations; 