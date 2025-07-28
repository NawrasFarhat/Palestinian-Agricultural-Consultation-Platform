'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Aligning pending_changes table with Sequelize model...');

    try {
      // Check if table exists
      const tableExists = await queryInterface.showAllTables()
        .then(tables => tables.includes('pending_changes'));

      if (!tableExists) {
        console.log('⚠️  pending_changes table does not exist, creating it with correct schema...');
        await queryInterface.createTable('pending_changes', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          disease_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'diseases',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          engineer_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          change_type: {
            type: Sequelize.ENUM('disease_add', 'disease_edit'),
            allowNull: false
          },
          disease_data: {
            type: Sequelize.JSON,
            allowNull: false,
            comment: 'Stores the disease data (name, symptoms, solution, questions)'
          },
          status: {
            type: Sequelize.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
            allowNull: false
          },
          submitted_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          reviewed_at: {
            type: Sequelize.DATE,
            allowNull: true
          },
          manager_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          notes: {
            type: Sequelize.TEXT,
            allowNull: true
          }
        });
        console.log('✅ Created pending_changes table with correct schema');
        return;
      }

      // Get current table description
      const tableDescription = await queryInterface.describeTable('pending_changes');
      console.log('📋 Current table structure:', Object.keys(tableDescription));

      // Step 1: Make disease_id nullable if it's not already
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

      // Step 2: Update change_type ENUM to support new values
      console.log('🔄 Updating change_type ENUM...');
      await queryInterface.changeColumn('pending_changes', 'change_type', {
        type: Sequelize.ENUM('disease_add', 'disease_edit'),
        allowNull: false
      });
      console.log('✅ Updated change_type ENUM');

      // Step 3: Add disease_data column if it doesn't exist
      if (!tableDescription.disease_data) {
        console.log('🔄 Adding disease_data column...');
        await queryInterface.addColumn('pending_changes', 'disease_data', {
          type: Sequelize.JSON,
          allowNull: false,
          comment: 'Stores the disease data (name, symptoms, solution, questions)'
        });
        console.log('✅ Added disease_data column');
      }

      // Step 4: Add submitted_at column if it doesn't exist
      if (!tableDescription.submitted_at) {
        console.log('🔄 Adding submitted_at column...');
        await queryInterface.addColumn('pending_changes', 'submitted_at', {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        });
        console.log('✅ Added submitted_at column');
      }

      // Step 5: Add reviewed_at column if it doesn't exist
      if (!tableDescription.reviewed_at) {
        console.log('🔄 Adding reviewed_at column...');
        await queryInterface.addColumn('pending_changes', 'reviewed_at', {
          type: Sequelize.DATE,
          allowNull: true
        });
        console.log('✅ Added reviewed_at column');
      }

      // Step 6: Rename reviewed_by to manager_id if it exists
      if (tableDescription.reviewed_by && !tableDescription.manager_id) {
        console.log('🔄 Renaming reviewed_by to manager_id...');
        await queryInterface.renameColumn('pending_changes', 'reviewed_by', 'manager_id');
        console.log('✅ Renamed reviewed_by to manager_id');
      }

      // Step 7: Rename review_notes to notes if it exists
      if (tableDescription.review_notes && !tableDescription.notes) {
        console.log('🔄 Renaming review_notes to notes...');
        await queryInterface.renameColumn('pending_changes', 'review_notes', 'notes');
        console.log('✅ Renamed review_notes to notes');
      }

      // Step 8: Remove old columns that are no longer needed
      const columnsToRemove = ['field_name', 'old_value', 'new_value', 'createdAt', 'updatedAt'];
      
      for (const columnName of columnsToRemove) {
        if (tableDescription[columnName]) {
          console.log(`🔄 Removing ${columnName} column...`);
          await queryInterface.removeColumn('pending_changes', columnName);
          console.log(`✅ Removed ${columnName} column`);
        }
      }

      // Step 9: Update indexes
      console.log('🔄 Updating indexes...');
      
      // Remove old indexes that reference removed columns
      try {
        await queryInterface.removeIndex('pending_changes', 'pending_changes_reviewed_by');
      } catch (error) {
        console.log('ℹ️  reviewed_by index already removed or doesn\'t exist');
      }

      // Add new indexes for the updated schema
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

      // Add indexes for the new schema
      await addIndexIfNotExists('pending_changes', ['disease_id'], 'pending_changes_disease_id');
      await addIndexIfNotExists('pending_changes', ['engineer_id'], 'pending_changes_engineer_id');
      await addIndexIfNotExists('pending_changes', ['status'], 'pending_changes_status');
      await addIndexIfNotExists('pending_changes', ['manager_id'], 'pending_changes_manager_id');
      await addIndexIfNotExists('pending_changes', ['change_type'], 'pending_changes_change_type');

      console.log('✅ Successfully aligned pending_changes table with Sequelize model!');
    } catch (error) {
      console.error('❌ Error aligning pending_changes table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Rolling back pending_changes table alignment...');
    
    try {
      // This is a complex rollback - we'll recreate the original structure
      // First, drop the current table
      await queryInterface.dropTable('pending_changes');
      
      // Recreate with original structure
      await queryInterface.createTable('pending_changes', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        disease_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'diseases',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        engineer_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        change_type: {
          type: Sequelize.ENUM('create', 'update', 'delete'),
          allowNull: false
        },
        field_name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        old_value: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        new_value: {
          type: Sequelize.TEXT,
          allowNull: true
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

      // Add original indexes
      await queryInterface.addIndex('pending_changes', ['disease_id'], {
        name: 'pending_changes_disease_id'
      });
      await queryInterface.addIndex('pending_changes', ['engineer_id'], {
        name: 'pending_changes_engineer_id'
      });
      await queryInterface.addIndex('pending_changes', ['status'], {
        name: 'pending_changes_status'
      });
      await queryInterface.addIndex('pending_changes', ['reviewed_by'], {
        name: 'pending_changes_reviewed_by'
      });
      
      console.log('✅ Successfully rolled back pending_changes table to original structure!');
    } catch (error) {
      console.error('❌ Error rolling back pending_changes table:', error);
      throw error;
    }
  }
}; 