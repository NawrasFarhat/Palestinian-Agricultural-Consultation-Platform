'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('questions'));
    
    if (!tableExists) {
      console.log('🔄 Creating questions table...');
      await queryInterface.createTable('questions', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        text: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        disease_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'diseases',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        source: {
          type: Sequelize.ENUM('manual', 'ai'),
          allowNull: false,
          defaultValue: 'manual'
        },
        input_type: {
          type: Sequelize.ENUM('choice', 'text', 'number'),
          allowNull: false,
          defaultValue: 'choice'
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
      console.log('✅ Questions table created successfully');
    } else {
      console.log('ℹ️  Questions table already exists, skipping creation');
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
    await addIndexIfNotExists('questions', ['disease_id'], 'questions_disease_id');
    await addIndexIfNotExists('questions', ['source'], 'questions_source');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('questions');
  }
}; 