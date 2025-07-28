'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Updating pending_changes table structure...');

    try {
      // Check if the table exists
      const tableExists = await queryInterface.showAllTables()
        .then(tables => tables.includes('pending_changes'));

      if (!tableExists) {
        console.log('ℹ️  pending_changes table does not exist, skipping update');
        return;
      }

      // Get current table description
      const tableDescription = await queryInterface.describeTable('pending_changes');
      
      // Check if we need to add the change_type column
      if (!tableDescription.change_type) {
        console.log('✅ Adding change_type column to pending_changes table...');
        await queryInterface.addColumn('pending_changes', 'change_type', {
          type: Sequelize.ENUM('create', 'update', 'delete'),
          allowNull: false,
          defaultValue: 'update'
        });
      } else {
        console.log('ℹ️  change_type column already exists');
      }

      // Check if we need to add the field_name column
      if (!tableDescription.field_name) {
        console.log('✅ Adding field_name column to pending_changes table...');
        await queryInterface.addColumn('pending_changes', 'field_name', {
          type: Sequelize.STRING(100),
          allowNull: false,
          defaultValue: 'general'
        });
      } else {
        console.log('ℹ️  field_name column already exists');
      }

      // Check if we need to add the old_value column
      if (!tableDescription.old_value) {
        console.log('✅ Adding old_value column to pending_changes table...');
        await queryInterface.addColumn('pending_changes', 'old_value', {
          type: Sequelize.TEXT,
          allowNull: true
        });
      } else {
        console.log('ℹ️  old_value column already exists');
      }

      // Check if we need to add the new_value column
      if (!tableDescription.new_value) {
        console.log('✅ Adding new_value column to pending_changes table...');
        await queryInterface.addColumn('pending_changes', 'new_value', {
          type: Sequelize.TEXT,
          allowNull: true
        });
      } else {
        console.log('ℹ️  new_value column already exists');
      }

      console.log('✅ pending_changes table structure updated successfully!');
    } catch (error) {
      console.error('❌ Error updating pending_changes table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Rolling back pending_changes table structure...');
    
    try {
      // Remove the columns we added
      await queryInterface.removeColumn('pending_changes', 'new_value');
      await queryInterface.removeColumn('pending_changes', 'old_value');
      await queryInterface.removeColumn('pending_changes', 'field_name');
      await queryInterface.removeColumn('pending_changes', 'change_type');
      
      console.log('✅ pending_changes table structure rolled back successfully!');
    } catch (error) {
      console.error('❌ Error rolling back pending_changes table:', error);
      throw error;
    }
  }
}; 