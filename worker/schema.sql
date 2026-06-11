CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  store TEXT NOT NULL,
  hour INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  child_name TEXT NOT NULL,
  guardian_name TEXT NOT NULL,
  member_number TEXT NOT NULL,
  note TEXT,
  line_user_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(date, store, hour)
);

CREATE INDEX IF NOT EXISTS idx_reservations_date_store
  ON reservations(date, store);

CREATE INDEX IF NOT EXISTS idx_reservations_line_user
  ON reservations(line_user_id, date, hour);
