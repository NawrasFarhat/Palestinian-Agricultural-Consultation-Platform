'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('users'));
    
    if (!tableExists) {
      await queryInterface.createTable('users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        username: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
          validate: {
            len: [3, 50]
          }
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: true,
          validate: {
            isEmail: true
          }
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        role: {
          type: Sequelize.ENUM('farmer', 'engineer', 'manager', 'it'),
          allowNull: false,
          defaultValue: 'farmer'
        },
        phone: {
          type: Sequelize.STRING(20),
          allowNull: false,
          unique: true,
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
        }
      } catch (error) {
        // If showIndex fails, try to add the index anyway
        console.log(`Warning: Could not check index existence for ${tableName}.${columns.join(',')}. Adding index...`);
        await queryInterface.addIndex(tableName, columns, {
          name: indexName
        });
      }
    };

    // Add indexes for better performance (only if they don't exist)
    await addIndexIfNotExists('users', ['username'], 'users_username');
    await addIndexIfNotExists('users', ['role'], 'users_role');
    await addIndexIfNotExists('users', ['email'], 'users_email');
    // Phone index will be added by migration 016-add-phone-to-users.js
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
}; 