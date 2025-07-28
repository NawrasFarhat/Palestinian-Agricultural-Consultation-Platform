'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('skip_rules'));

    if (!tableExists) {
      console.log('🔄 Creating skip_rules table...');
      await queryInterface.createTable('skip_rules', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        parent_question_text: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        trigger_answer: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        skip_child_text: {
          type: Sequelize.TEXT,
          allowNull: false
        }
      });
      console.log('✅ skip_rules table created successfully');
    } else {
      console.log('ℹ️  skip_rules table already exists, skipping creation');
    }

    const addIndexIfNotExists = async (tableName, columns, indexName = null) => {
      try {
        const indexes = await queryInterface.showIndex(tableName);
        const indexExists = indexes.some(index => 
          indexName ? index.name === indexName : 
          index.fields.some(field => columns.includes(field.attribute))
        );

        if (!indexExists) {
          await queryInterface.addIndex(tableName, columns, { name: indexName });
          console.log(`✅ Added index ${indexName || columns.join('_')} to ${tableName}`);
        } else {
          console.log(`ℹ️  Index ${indexName || columns.join('_')} already exists on ${tableName}`);
        }
      } catch (error) {
        console.error(`⚠️  Error checking index for ${tableName}:`, error);
      }
    };

    await addIndexIfNotExists('skip_rules', ['parent_question_text'], 'skip_rules_parent_question');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('skip_rules');
  }
};
