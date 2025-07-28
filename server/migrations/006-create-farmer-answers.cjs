'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('farmer_answers'));
    
    if (!tableExists) {
      console.log('🔄 Creating farmer_answers table...');
      await queryInterface.createTable('farmer_answers', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        question_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'questions',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        farmer_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        answer: {
          type: Sequelize.TEXT,
          allowNull: false
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
      console.log('✅ Farmer_answers table created successfully');
    } else {
      console.log('ℹ️  Farmer_answers table already exists, skipping creation');
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
    await addIndexIfNotExists('farmer_answers', ['question_id'], 'farmer_answers_question_id');
    await addIndexIfNotExists('farmer_answers', ['farmer_id'], 'farmer_answers_farmer_id');
    await addIndexIfNotExists('farmer_answers', ['createdAt'], 'farmer_answers_created_at');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('farmer_answers');
  }
}; 