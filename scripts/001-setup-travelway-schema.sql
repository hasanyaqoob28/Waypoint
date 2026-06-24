-- Travelway Database Schema
-- Creates USERS, TRIPS, and EVENTS tables for storing travel itineraries

-- Create USERS table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create TRIPS table
CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  raw_booking_text TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(user_id, created_at DESC);

-- Create EVENTS table (parsed bookings)
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  trip_id INT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'flight', 'hotel', 'activity', 'transit', etc.
  
  -- Flight details
  flight_number VARCHAR(20),
  airline VARCHAR(100),
  departure_airport VARCHAR(10),
  arrival_airport VARCHAR(10),
  departure_time TIMESTAMPTZ,
  arrival_time TIMESTAMPTZ,
  terminal VARCHAR(10),
  gate VARCHAR(10),
  seat_number VARCHAR(10),
  baggage_carousel VARCHAR(20),
  
  -- Hotel details
  hotel_name VARCHAR(255),
  hotel_address TEXT,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  confirmation_number VARCHAR(50),
  
  -- Activity details
  activity_name VARCHAR(255),
  activity_location VARCHAR(255),
  activity_time TIMESTAMPTZ,
  
  -- General
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_trip_id ON events(trip_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(trip_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_departure_time ON events(trip_id, departure_time);
CREATE INDEX IF NOT EXISTS idx_events_check_in_time ON events(trip_id, check_in_time);
