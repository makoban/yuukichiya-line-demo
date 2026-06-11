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

CREATE TABLE IF NOT EXISTS measurement_records (
  id TEXT PRIMARY KEY,
  line_user_id TEXT NOT NULL,
  member_number TEXT NOT NULL,
  member_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  member_avatar_url TEXT,
  item_name TEXT NOT NULL,
  item_kind TEXT NOT NULL,
  amount_yen INTEGER NOT NULL,
  purchased_at TEXT NOT NULL,
  measured_at TEXT NOT NULL,
  measurements_json TEXT NOT NULL,
  store TEXT,
  staff_name TEXT,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_measurement_records_line_user
  ON measurement_records(line_user_id, purchased_at DESC);

CREATE INDEX IF NOT EXISTS idx_measurement_records_member
  ON measurement_records(member_number, member_id, purchased_at DESC);
