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

CREATE TABLE IF NOT EXISTS point_members (
  member_number TEXT PRIMARY KEY,
  representative_name TEXT NOT NULL,
  current_points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS point_transactions (
  id TEXT PRIMARY KEY,
  member_number TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  memo TEXT,
  balance_after INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_member
  ON point_transactions(member_number, created_at DESC);

INSERT OR IGNORE INTO point_members (
  member_number,
  representative_name,
  current_points,
  status,
  created_at,
  updated_at
) VALUES (
  'YK-001234',
  '山田 由美',
  1250,
  'active',
  '2026-06-12T00:30:55.733Z',
  '2026-06-12T00:30:55.733Z'
);

INSERT OR IGNORE INTO point_transactions (
  id,
  member_number,
  delta,
  reason,
  staff_name,
  memo,
  balance_after,
  created_at
) VALUES
  (
    'demo-point-yamada-001',
    'YK-001234',
    450,
    '学生服購入',
    '本店',
    '中学夏制服 上下セット',
    1250,
    '2026-06-08T05:20:00.000Z'
  ),
  (
    'demo-point-yamada-002',
    'YK-001234',
    -100,
    '補正サービス利用',
    '本店',
    '袖丈補正サービス',
    800,
    '2026-05-28T07:05:00.000Z'
  ),
  (
    'demo-point-yamada-003',
    'YK-001234',
    300,
    '紙カードから移行',
    '高橋店',
    '既存紙カードから移行',
    900,
    '2026-05-02T02:45:00.000Z'
  );
