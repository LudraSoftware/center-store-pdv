const db = require('./models');

async function testConnection() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    process.exit();
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

testConnection();
