'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('support_requests'));
    
    if (!tableExists) {
      console.log('🔄 Creating support_requests table...');
      await queryInterface.createTable('support_requests', {
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
        subject: {
          type: Sequelize.STRING(200),
          allowNull: false
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        priority: {
          type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
          allowNull: false,
          defaultValue: 'medium'
        },
        status: {
          type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'closed'),
          allowNull: false,
          defaultValue: 'open'
        },
        assigned_to: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
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
      console.log('✅ Support_requests table created successfully');
    } else {
      console.log('ℹ️  Support_requests table already exists, skipping creation');
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
    await addIndexIfNotExists('support_requests', ['user_id'], 'support_requests_user_id');
    await addIndexIfNotExists('support_requests', ['assigned_to'], 'support_requests_assigned_to');
    await addIndexIfNotExists('support_requests', ['status'], 'support_requests_status');
    await addIndexIfNotExists('support_requests', ['priority'], 'support_requests_priority');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('support_requests');
  }
}; 