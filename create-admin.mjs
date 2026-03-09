import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dataconsult',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function createAdmin() {
  const connection = await pool.getConnection();
  
  try {
    const email = 'zaguinha1@dataconsult.com';
    const password = 'zagareidelas';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Gerar um openId único
    const openId = 'admin-zaguinha1-' + Date.now();
    
    const query = `
      INSERT INTO users (openId, email, name, password, loginMethod, role, accessMinutes, createdAt, updatedAt, lastSignedIn)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
      ON DUPLICATE KEY UPDATE
      password = VALUES(password),
      role = 'admin',
      updatedAt = NOW()
    `;
    
    const [result] = await connection.execute(query, [
      openId,
      email,
      'Zaguinha Admin',
      hashedPassword,
      'email',
      'admin',
      999999, // 999999 minutos de acesso
    ]);
    
    console.log('✅ Admin criado com sucesso!');
    console.log('Email: zaguinha1@dataconsult.com');
    console.log('Senha: zagareidelas');
    console.log('Acesso: /admin');
    
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
  } finally {
    await connection.release();
    await pool.end();
  }
}

createAdmin();
