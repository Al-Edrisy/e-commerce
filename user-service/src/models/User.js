const pool = require('../config/database');

class User {
  /**
   * Create a new user
   */
  static async create(userData) {
    const { firebaseUid, email, firstName, lastName, phoneNumber } = userData;
    const query = `
      INSERT INTO users (firebase_uid, email, first_name, last_name, phone_number)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [firebaseUid, email, firstName, lastName, phoneNumber];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Find user by Firebase UID
   */
  static async findByFirebaseUid(firebaseUid) {
    const query = 'SELECT * FROM users WHERE firebase_uid = $1';
    const result = await pool.query(query, [firebaseUid]);
    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  /**
   * Update user
   */
  static async update(id, userData) {
    const { firstName, lastName, phoneNumber } = userData;
    const query = `
      UPDATE users 
      SET first_name = $1, last_name = $2, phone_number = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const values = [firstName, lastName, phoneNumber, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete user
   */
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = User;

