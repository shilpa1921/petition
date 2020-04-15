  
  DROP TABLE IF EXISTS users;
 CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

DROP TABLE IF EXISTS signatures;

 CREATE TABLE signatures(
  id SERIAL PRIMARY KEY,
  -- get rid of first and last!
  signature TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

