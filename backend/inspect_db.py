import sqlite3

conn = sqlite3.connect('meetings.db')
cursor = conn.cursor()

# Get all tables
cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = [row[0] for row in cursor.fetchall()]
print('Tables:', tables)

# Count records in each table
for table in tables:
    cursor.execute(f'SELECT COUNT(*) FROM {table}')
    count = cursor.fetchone()[0]
    print(f'{table}: {count} records')

# Sample meeting data
cursor.execute('SELECT id, title, date, duration FROM meetings LIMIT 3')
print('\nSample meetings:')
for row in cursor.fetchall():
    print(f'  ID: {row[0]}, Title: {row[1]}, Date: {row[2]}, Duration: {row[3]}')

# Sample transcript data
cursor.execute('SELECT id, meeting_id, speaker, start_time FROM transcript_segments LIMIT 3')
print('\nSample transcript segments:')
for row in cursor.fetchall():
    print(f'  ID: {row[0]}, Meeting ID: {row[1]}, Speaker: {row[2]}, Start: {row[3]}')

conn.close()
