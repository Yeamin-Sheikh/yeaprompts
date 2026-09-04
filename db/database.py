import os
import sqlite3

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT_DIR, 'data', 'database.sqlite')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_categories():
    with get_connection() as conn:
        rows = conn.execute("SELECT id, name, slug, prompt_count FROM categories ORDER BY prompt_count DESC").fetchall()
        return [dict(r) for r in rows]

def get_stats():
    with get_connection() as conn:
        total = conn.execute("SELECT COUNT(*) FROM prompts").fetchone()[0]
        free = conn.execute("SELECT COUNT(*) FROM prompts WHERE is_free = 1").fetchone()[0]
        chars = conn.execute("SELECT SUM(char_count) FROM prompts").fetchone()[0]
        cats = conn.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
        media = conn.execute("SELECT COUNT(*) FROM media").fetchone()[0]
        return {
            "total_prompts": total,
            "free_prompts": free,
            "premium_prompts": total - free,
            "total_chars": chars,
            "total_categories": cats,
            "total_media": media
        }

def get_prompts(page=1, limit=15, category=None, is_free=None, search='', sort='newest'):
    with get_connection() as conn:
        where = []
        params = []
        if category and category != 'all':
            where.append("(category_name = ? OR category_id = ?)")
            params.extend([category, int(category) if category.isdigit() else -1])
        if is_free is not None:
            where.append("is_free = ?")
            params.append(1 if is_free else 0)
        if search:
            s = search.strip()
            if s.isdigit():
                where.append("(id = ? OR title LIKE ?)")
                params.extend([int(s), f"%{s}%"])
            else:
                where.append("(title LIKE ? OR prompt_text LIKE ?)")
                params.extend([f"%{s}%", f"%{s}%"])

        where_str = ("WHERE " + " AND ".join(where)) if where else ""
        order_by = "id DESC"
        if sort == "oldest": order_by = "id ASC"
        elif sort == "alpha_asc": order_by = "title ASC"
        elif sort == "alpha_desc": order_by = "title DESC"

        count = conn.execute(f"SELECT COUNT(*) FROM prompts {where_str}", params).fetchone()[0]
        offset = (page - 1) * limit
        rows = conn.execute(
            f"SELECT id, title, slug, category_name, badge, is_free, updated_date, char_count, word_count, thumbnail_path, html_file FROM prompts {where_str} ORDER BY {order_by} LIMIT ? OFFSET ?",
            params + [limit, offset]
        ).fetchall()
        return {
            "page": page,
            "limit": limit,
            "total_pages": (count + limit - 1) // limit,
            "total_items": count,
            "items": [dict(r) for r in rows]
        }

def get_prompt_by_id(pid):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM prompts WHERE id = ?", (pid,)).fetchone()
        if not row:
            return None
        prompt = dict(row)
        media_rows = conn.execute("SELECT * FROM media WHERE prompt_id = ?", (pid,)).fetchall()
        prompt['media'] = [dict(m) for m in media_rows]
        return prompt
