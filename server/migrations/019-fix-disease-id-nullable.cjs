'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Fixing disease_id NOT NULL constraint in pending_changes table...');

    try {
      // Check if table exists
      const tableExists = await queryInterface.showAllTables()
        .then(tables => tables.includes('pending_changes'));

      if (!tableExists) {
        console.log('⚠️  pending_changes table does not exist, nothing to fix');
        return;
      }

      // Get current table description
      const tableDescription = await queryInterface.describeTable('pending_changes');
      
      if (!tableDescription.disease_id) {
        console.log('⚠️  disease_id column does not exist in pending_changes table');
        return;
      }

      // Check if disease_id is currently NOT NULL
      if (tableDescription.disease_id.allowNull === false) {
        console.log('🔄 Making disease_id nullable to support new disease submissions...');
        
        // For MySQL, we need to handle the foreign key constraint properly
        // First, drop the foreign key constraint if it exists
        try {
          const foreignKeys = await queryInterface.getForeignKeyReferencesForTable('pending_changes');
          const diseaseIdForeignKey = foreignKeys.find(fk => fk.columnName === 'disease_id');
          
          if (diseaseIdForeignKey) {
            console.log('🔄 Dropping foreign key constraint for disease_id...');
            await queryInterface.removeConstraint('pending_changes', diseaseIdForeignKey.constraintName);
            console.log('✅ Dropped foreign key constraint');
          }
        } catch (error) {
          console.log('ℹ️  No foreign key constraint found or already removed');
        }

        // Now modify the column to allow NULL
        await queryInterface.changeColumn('pending_changes', 'disease_id', {
          type: Sequelize.INTEGER,
          allowNull: true
        });
        console.log('✅ Made disease_id nullable');

        // Re-add the foreign key constraint with proper settings for nullable column
        console.log('🔄 Re-adding foreign key constraint for disease_id...');
        await queryInterface.addConstraint('pending_changes', {
          fields: ['disease_id'],
          type: 'foreign key',
          name: 'pending_changes_disease_id_fkey',
          references: {
            table: 'diseases',
            field: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
        console.log('✅ Re-added foreign key constraint');
      } else {
        console.log('ℹ️  disease_id is already nullable, no changes needed');
      }

      console.log('✅ Successfully fixed disease_id NOT NULL constraint!');
    } catch (error) {
      console.error('❌ Error fixing disease_id constraint:', error);
      throw error;
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

      // Get current table description
      const tableDescription = await queryInterface.describeTable('pending_changes');
      
      if (!tableDescription.disease_id) {
        console.log('⚠️  disease_id column does not exist');
        return;
      }

      // Check if disease_id is currently nullable
      if (tableDescription.disease_id.allowNull === true) {
        console.log('🔄 Making disease_id NOT NULL again...');
        
        // Drop the foreign key constraint first
        try {
          const foreignKeys = await queryInterface.getForeignKeyReferencesForTable('pending_changes');
          const diseaseIdForeignKey = foreignKeys.find(fk => fk.columnName === 'disease_id');
          
          if (diseaseIdForeignKey) {
            console.log('🔄 Dropping foreign key constraint for disease_id...');
            await queryInterface.removeConstraint('pending_changes', diseaseIdForeignKey.constraintName);
            console.log('✅ Dropped foreign key constraint');
          }
        } catch (error) {
          console.log('ℹ️  No foreign key constraint found or already removed');
        }

        // Modify the column to NOT NULL
        await queryInterface.changeColumn('pending_changes', 'disease_id', {
          type: Sequelize.INTEGER,
          allowNull: false
        });
        console.log('✅ Made disease_id NOT NULL');

        // Re-add the foreign key constraint
        console.log('🔄 Re-adding foreign key constraint for disease_id...');
        await queryInterface.addConstraint('pending_changes', {
          fields: ['disease_id'],
          type: 'foreign key',
          name: 'pending_changes_disease_id_fkey',
          references: {
            table: 'diseases',
            field: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
        console.log('✅ Re-added foreign key constraint');
      } else {
        console.log('ℹ️  disease_id is already NOT NULL, no changes needed');
      }

      console.log('✅ Successfully rolled back disease_id nullable change!');
    } catch (error) {
      console.error('❌ Error rolling back disease_id constraint:', error);
      throw error;
    }
  }
}; 