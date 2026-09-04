import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = path.join(process.cwd(), 'data', 'database.sqlite');
let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
  }
  return dbInstance;
}

export function getCategories() {
  const db = getDb();
  return db.prepare('SELECT id, name, slug, prompt_count FROM categories ORDER BY prompt_count DESC').all();
}

export function getStats() {
  const db = getDb();
  const totalPrompts = db.prepare('SELECT COUNT(*) as count FROM prompts').get().count;
  const freePrompts = db.prepare('SELECT COUNT(*) as count FROM prompts WHERE is_free = 1').get().count;
  const premiumPrompts = totalPrompts - freePrompts;
  const totalChars = db.prepare('SELECT SUM(char_count) as total FROM prompts').get().total;
  const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  const totalMedia = db.prepare('SELECT COUNT(*) as count FROM media').get().count;

  return {
    totalPrompts,
    freePrompts,
    premiumPrompts,
    totalChars,
    totalCategories,
    totalMedia
  };
}

export function getPrompts({ page = 1, limit = 15, category = null, isFree = null, search = '', sort = 'newest' } = {}) {
  const db = getDb();
  let whereClauses = [];
  let params = [];

  if (category && category !== 'all') {
    whereClauses.push('(category_name = ? OR category_id = ?)');
    params.push(category, isNaN(category) ? -1 : Number(category));
  }

  if (isFree !== null && isFree !== undefined) {
    whereClauses.push('is_free = ?');
    params.push(isFree ? 1 : 0);
  }

  if (search && search.trim() !== '') {
    const q = search.trim();
    if (!isNaN(q)) {
      whereClauses.push('(id = ? OR title LIKE ? OR prompt_text LIKE ?)');
      params.push(Number(q), '%' + q + '%', '%' + q + '%');
    } else {
      whereClauses.push('(title LIKE ? OR prompt_text LIKE ? OR category_name LIKE ?)');
      params.push('%' + q + '%', '%' + q + '%', '%' + q + '%');
    }
  }

  const whereStr = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  let orderBy = 'id DESC';
  if (sort === 'oldest') orderBy = 'id ASC';
  else if (sort === 'alpha_asc') orderBy = 'title ASC';
  else if (sort === 'alpha_desc') orderBy = 'title DESC';

  // Count total matching
  const countSql = 'SELECT COUNT(*) as count FROM prompts ' + whereStr;
  const total = db.prepare(countSql).get(...params).count;

  // Pagination
  const offset = (page - 1) * limit;
  const dataSql = 'SELECT id, title, slug, category_name, badge, is_free, updated_date, char_count, word_count, thumbnail_path, storyboard_path, html_file FROM prompts ' + whereStr + ' ORDER BY ' + orderBy + ' LIMIT ? OFFSET ?';
  const items = db.prepare(dataSql).all(...params, limit, offset);

  return {
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    items
  };
}

export function getPromptById(id) {
  const db = getDb();
  const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(Number(id));
  if (!prompt) return null;

  const media = db.prepare('SELECT * FROM media WHERE prompt_id = ?').all(Number(id));
  return { ...prompt, media };
}

export function getCommunityPosts() {
  const db = getDb();
  return db.prepare('SELECT * FROM community_posts ORDER BY id DESC').all();
}
