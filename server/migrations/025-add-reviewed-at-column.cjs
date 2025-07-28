'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Adding reviewed_at column to pending_changes table...');

    try {
      // Check if the column already exists
      const tableDescription = await queryInterface.describeTable('pending_changes');
      
      if (tableDescription.reviewed_at) {
        console.log('ℹ️  reviewed_at column already exists, skipping...');
        return;
      }

      // Add the reviewed_at column
      await queryInterface.addColumn('pending_changes', 'reviewed_at', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when the change was reviewed by a manager'
      });

      console.log('✅ Successfully added reviewed_at column to pending_changes table');
    } catch (error) {
      console.error('❌ Error adding reviewed_at column:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Removing reviewed_at column from pending_changes table...');

    try {
      // Check if the column exists before trying to remove it
      const tableDescription = await queryInterface.describeTable('pending_changes');
      
      if (!tableDescription.reviewed_at) {
        console.log('ℹ️  reviewed_at column does not exist, skipping removal...');
        return;
      }

      // Remove the reviewed_at column
      await queryInterface.removeColumn('pending_changes', 'reviewed_at');

      console.log('✅ Successfully removed reviewed_at column from pending_changes table');
    } catch (error) {
      console.error('❌ Error removing reviewed_at column:', error);
      throw error;
    }
  }
}; 