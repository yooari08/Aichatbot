import sqlite3
from pathlib import Path

db = Path(__file__).resolve().parents[1] / 'dev.db'
conn = sqlite3.connect(db)
tables = sorted(r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'"))
rev = list(conn.execute('SELECT * FROM alembic_version'))
print('tables:', tables)
print('alembic_version:', rev)
for table in ('documents', 'index_jobs'):
    if table in tables:
        cols = [r[1] for r in conn.execute(f'PRAGMA table_info({table})')]
        print(f'{table} columns:', cols)
        ddl = conn.execute(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name=?",
            (table,),
        ).fetchone()
        if ddl:
            print(f'{table} ddl:', ddl[0])
