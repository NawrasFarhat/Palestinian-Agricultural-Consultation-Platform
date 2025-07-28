'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('role_change_requests'));
    
    if (!tableExists) {
      console.log('🔄 Creating role_change_requests table...');
      await queryInterface.createTable('role_change_requests', {
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
        current_role: {
          type: Sequelize.ENUM('farmer', 'engineer', 'manager', 'it'),
          allowNull: false
        },
        requested_role: {
          type: Sequelize.ENUM('farmer', 'engineer', 'manager', 'it'),
          allowNull: false
        },
        reason: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending'
        },
        reviewed_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        review_notes: {
          type: Sequelize.TEXT,
          allowNull: true
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
      console.log('✅ Role_change_requests table created successfully');
    } else {
      console.log('ℹ️  Role_change_requests table already exists, skipping creation');
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
    await addIndexIfNotExists('role_change_requests', ['user_id'], 'role_change_requests_user_id');
    await addIndexIfNotExists('role_change_requests', ['status'], 'role_change_requests_status');
    await addIndexIfNotExists('role_change_requests', ['reviewed_by'], 'role_change_requests_reviewed_by');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('role_change_requests');
  }
}; 