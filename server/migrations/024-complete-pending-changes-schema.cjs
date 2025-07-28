'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Completing pending_changes table schema...');

    try {
      // Get current table description
      const tableDescription = await queryInterface.describeTable('pending_changes');
      console.log('📋 Current table structure:', Object.keys(tableDescription));

      const columnsToAdd = [];

      // Check and add disease_data column
      if (!tableDescription.disease_data) {
        console.log('🔄 Adding disease_data column...');
        columnsToAdd.push({
          name: 'disease_data',
          definition: {
            type: Sequelize.JSON,
            allowNull: false,
            comment: 'Stores the disease data (name, symptoms, solution, questions)'
          }
        });
      } else {
        console.log('ℹ️  disease_data column already exists');
      }

      // Check and add submitted_at column
      if (!tableDescription.submitted_at) {
        console.log('🔄 Adding submitted_at column...');
        columnsToAdd.push({
          name: 'submitted_at',
          definition: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: true
          }
        });
      } else {
        console.log('ℹ️  submitted_at column already exists');
      }

      // Check and add reviewed_at column
      if (!tableDescription.reviewed_at) {
        console.log('🔄 Adding reviewed_at column...');
        columnsToAdd.push({
          name: 'reviewed_at',
          definition: {
            type: Sequelize.DATE,
            allowNull: true
          }
        });
      } else {
        console.log('ℹ️  reviewed_at column already exists');
      }

      // Check and add manager_id column
      if (!tableDescription.manager_id) {
        console.log('🔄 Adding manager_id column...');
        columnsToAdd.push({
          name: 'manager_id',
          definition: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          }
        });
      } else {
        console.log('ℹ️  manager_id column already exists');
      }

      // Check and add review_notes column
      if (!tableDescription.review_notes) {
        console.log('🔄 Adding review_notes column...');
        columnsToAdd.push({
          name: 'review_notes',
          definition: {
            type: Sequelize.TEXT,
            allowNull: true
          }
        });
      } else {
        console.log('ℹ️  review_notes column already exists');
      }

      // Add all missing columns
      for (const column of columnsToAdd) {
        console.log(`🔄 Adding ${column.name} column...`);
        await queryInterface.addColumn('pending_changes', column.name, column.definition);
        console.log(`✅ Added ${column.name} column`);
      }

      // Update change_type ENUM if needed
      if (tableDescription.change_type) {
        console.log('🔄 Checking change_type ENUM values...');
        try {
          // Try to update the ENUM to include both values
          await queryInterface.changeColumn('pending_changes', 'change_type', {
            type: Sequelize.ENUM('disease_add', 'disease_edit'),
            allowNull: false
          });
          console.log('✅ Updated change_type ENUM');
        } catch (error) {
          console.log('ℹ️  change_type ENUM update skipped (may already be correct)');
        }
      }

      // Update status ENUM if needed
      if (tableDescription.status) {
        console.log('🔄 Checking status ENUM values...');
        try {
          await queryInterface.changeColumn('pending_changes', 'status', {
            type: Sequelize.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending'
          });
          console.log('✅ Updated status ENUM');
        } catch (error) {
          console.log('ℹ️  status ENUM update skipped (may already be correct)');
        }
      }

      // Make disease_id nullable if it's not already
      if (tableDescription.disease_id && tableDescription.disease_id.allowNull === false) {
        console.log('🔄 Making disease_id nullable...');
        await queryInterface.changeColumn('pending_changes', 'disease_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'diseases',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
        console.log('✅ Made disease_id nullable');
      }

      // Add indexes for better performance
      console.log('🔄 Adding/updating indexes...');
      
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
          console.log(`⚠️  Could not check index existence for ${tableName}.${columns.join(',')}. Skipping index creation.`);
        }
      };

      // Add indexes for the schema
      await addIndexIfNotExists('pending_changes', ['disease_id'], 'pending_changes_disease_id');
      await addIndexIfNotExists('pending_changes', ['engineer_id'], 'pending_changes_engineer_id');
      await addIndexIfNotExists('pending_changes', ['status'], 'pending_changes_status');
      await addIndexIfNotExists('pending_changes', ['manager_id'], 'pending_changes_manager_id');
      await addIndexIfNotExists('pending_changes', ['change_type'], 'pending_changes_change_type');

      if (columnsToAdd.length === 0) {
        console.log('✅ All required columns already exist in pending_changes table');
      } else {
        console.log(`✅ Successfully added ${columnsToAdd.length} missing columns to pending_changes table`);
      }

      console.log('✅ Completed pending_changes table schema update!');
    } catch (error) {
      console.error('❌ Error completing pending_changes table schema:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Rolling back pending_changes table schema completion...');

    try {
      const tableDescription = await queryInterface.describeTable('pending_changes');
      const columnsToRemove = ['disease_data', 'submitted_at', 'reviewed_at', 'manager_id', 'review_notes'];

      for (const columnName of columnsToRemove) {
        if (tableDescription[columnName]) {
          console.log(`🔄 Removing ${columnName} column...`);
          await queryInterface.removeColumn('pending_changes', columnName);
          console.log(`✅ Removed ${columnName} column`);
        }
      }

      // Remove indexes
      const indexesToRemove = [
        'pending_changes_disease_id',
        'pending_changes_engineer_id', 
        'pending_changes_status',
        'pending_changes_manager_id',
        'pending_changes_change_type'
      ];

      for (const indexName of indexesToRemove) {
        try {
          await queryInterface.removeIndex('pending_changes', indexName);
          console.log(`✅ Removed index ${indexName}`);
        } catch (error) {
          console.log(`ℹ️  Index ${indexName} already removed or doesn't exist`);
        }
      }

      console.log('✅ Successfully rolled back pending_changes table schema completion!');
    } catch (error) {
      console.error('❌ Error rolling back pending_changes table schema completion:', error);
      throw error;
    }
  }
}; 