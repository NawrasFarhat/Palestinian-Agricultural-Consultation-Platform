'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('general_questions'));

    if (!tableExists) {
      console.log('🔄 Creating general_questions table...');
      await queryInterface.createTable('general_questions', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        question_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        question_text: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        possible_answers: {
          type: Sequelize.TEXT,
          allowNull: true
        }
      });
      console.log('✅ general_questions table created successfully');
    } else {
      console.log('ℹ️  general_questions table already exists, skipping creation');
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

    await addIndexIfNotExists('general_questions', ['question_id'], 'general_questions_question_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('general_questions');
  }
};
