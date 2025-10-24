CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('client', 'cleaner')),
  picture_url VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cleaner_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  tagline VARCHAR(255),
  hourly_rate NUMERIC(10, 2),
  rating NUMERIC(3, 2) DEFAULT 0,
  reviews_count INT DEFAULT 0,
  bio TEXT,
  services TEXT[],
  specialized_tasks JSONB,
  image_gallery_urls TEXT[],
  location GEOGRAPHY(Point),
  availability JSONB,
  badge VARCHAR(50)
);
