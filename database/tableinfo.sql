  
  DROP TABLE IF EXISTS signatures;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS user_profiles CASCADE;
 

 CREATE TABLE signatures(
  id SERIAL PRIMARY KEY,
  -- get rid of first and last!
  signature TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );


  CREATE TABLE user_profiles(
  id SERIAL PRIMARY KEY,
  age INT,
  city VARCHAR(100),
  url VARCHAR(300),
  user_id INT REFERENCES users(id) NOT NULL UNIQUE );

