CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id UUID NOT NULL,
  client_id UUID NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_location GEOGRAPHY(Point),
  client_address VARCHAR(255),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  service_description TEXT,
  duration_hours INT NOT NULL,
  cost_details JSONB,
  specialized_tasks JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
