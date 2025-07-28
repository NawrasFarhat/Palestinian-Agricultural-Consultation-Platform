'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Adding disease_data column to pending_changes table...');

    try {
      // Check if the column already exists
      const tableDescription = await queryInterface.describeTable('pending_changes');
      
      if (tableDescription.disease_data) {
        console.log('ℹ️  disease_data column already exists, skipping...');
        return;
      }

      // Add the disease_data column
      await queryInterface.addColumn('pending_changes', 'disease_data', {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Stores the disease data (name, symptoms, solution, questions)'
      });

      console.log('✅ Successfully added disease_data column to pending_changes table');
    } catch (error) {
      console.error('❌ Error adding disease_data column:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Removing disease_data column from pending_changes table...');

    try {
      // Check if the column exists before trying to remove it
      const tableDescription = await queryInterface.describeTable('pending_changes');
      
      if (!tableDescription.disease_data) {
        console.log('ℹ️  disease_data column does not exist, skipping removal...');
        return;
      }

      // Remove the disease_data column
      await queryInterface.removeColumn('pending_changes', 'disease_data');

      console.log('✅ Successfully removed disease_data column from pending_changes table');
    } catch (error) {
      console.error('❌ Error removing disease_data column:', error);
      throw error;
    }
  }
}; 