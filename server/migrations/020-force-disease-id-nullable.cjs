'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Force fixing disease_id NOT NULL constraint using raw SQL...');

    try {
      // Check if table exists
      const tableExists = await queryInterface.showAllTables()
        .then(tables => tables.includes('pending_changes'));

      if (!tableExists) {
        console.log('⚠️  pending_changes table does not exist, nothing to fix');
        return;
      }

      // Use raw SQL to directly modify the column - this is the most reliable approach
      console.log('🔄 Executing ALTER TABLE to make disease_id nullable...');
      
      await queryInterface.sequelize.query(
        'ALTER TABLE pending_changes MODIFY disease_id INT NULL',
        { type: Sequelize.QueryTypes.RAW }
      );
      
      console.log('✅ Successfully made disease_id nullable using raw SQL!');
      
      // Verify the change
      const tableDescription = await queryInterface.describeTable('pending_changes');
      if (tableDescription.disease_id && tableDescription.disease_id.allowNull === true) {
        console.log('✅ Verification: disease_id is now nullable');
      } else {
        console.log('⚠️  Warning: disease_id may still be NOT NULL - please check manually');
      }
      
    } catch (error) {
      console.error('❌ Error fixing disease_id constraint with raw SQL:', error);
      
      // If raw SQL fails, try the Sequelize approach as fallback
      console.log('🔄 Trying Sequelize changeColumn as fallback...');
      try {
        await queryInterface.changeColumn('pending_changes', 'disease_id', {
          type: Sequelize.INTEGER,
          allowNull: true
        });
        console.log('✅ Successfully made disease_id nullable using Sequelize fallback!');
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Rolling back disease_id nullable change...');
    
    try {
      // Check if table exists
      const tableExists = await queryInterface.showAllTables()
        .then(tables => tables.includes('pending_changes'));

      if (!tableExists) {
        console.log('⚠️  pending_changes table does not exist, nothing to rollback');
        return;
      }

      // Use raw SQL to make it NOT NULL again
      console.log('🔄 Executing ALTER TABLE to make disease_id NOT NULL again...');
      
      await queryInterface.sequelize.query(
        'ALTER TABLE pending_changes MODIFY disease_id INT NOT NULL',
        { type: Sequelize.QueryTypes.RAW }
      );
      
      console.log('✅ Successfully made disease_id NOT NULL again!');
      
    } catch (error) {
      console.error('❌ Error rolling back disease_id constraint:', error);
      
      // Try Sequelize fallback
      console.log('🔄 Trying Sequelize changeColumn as fallback...');
      try {
        await queryInterface.changeColumn('pending_changes', 'disease_id', {
          type: Sequelize.INTEGER,
          allowNull: false
        });
        console.log('✅ Successfully made disease_id NOT NULL using Sequelize fallback!');
      } catch (fallbackError) {
        console.error('❌ Fallback rollback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }
}; 