'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('diagnosis_history'));
    
    if (!tableExists) {
      console.log('🔄 Creating diagnosis_history table...');
      await queryInterface.createTable('diagnosis_history', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        disease_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'diseases',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        result: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        confidence: {
          type: Sequelize.FLOAT,
          allowNull: true,
          validate: {
            min: 0,
            max: 1
          }
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('✅ Diagnosis_history table created successfully');
    } else {
      console.log('ℹ️  Diagnosis_history table already exists, skipping creation');
    }

    // Helper function to safely add index if it doesn't exist
    const addIndexIfNotExists = async (tableName, columns, indexName = null) => {
      try {
        const indexes = await queryInterface.showIndex(tableName);
        const indexExists = indexes.some(index => 
          indexName ? index.name === indexName : 
          index.fields.some(field => columns.includes(field.attribute))
        );
        
        if (!indexExists) {
          await queryInterface.addIndex(tableName, columns, {
            name: indexName
          });
          console.log(`✅ Added index ${indexName || columns.join('_')} to ${tableName}`);
        } else {
          console.log(`ℹ️  Index ${indexName || columns.join('_')} already exists on ${tableName}`);
        }
      } catch (error) {
        console.log(`⚠️  Could not check index existence for ${tableName}.${columns.join(',')}. Adding index...`);
        try {
          await queryInterface.addIndex(tableName, columns, {
            name: indexName
          });
          console.log(`✅ Added index ${indexName || columns.join('_')} to ${tableName}`);
        } catch (addError) {
          console.log(`ℹ️  Index ${indexName || columns.join('_')} may already exist on ${tableName}`);
        }
      }
    };

    // Add indexes for better performance (only if they don't exist)
    await addIndexIfNotExists('diagnosis_history', ['user_id'], 'diagnosis_history_user_id');
    await addIndexIfNotExists('diagnosis_history', ['disease_id'], 'diagnosis_history_disease_id');
    await addIndexIfNotExists('diagnosis_history', ['createdAt'], 'diagnosis_history_created_at');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('diagnosis_history');
  }
}; 