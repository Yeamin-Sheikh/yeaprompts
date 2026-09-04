import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { execSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

/**
 * sync_prompt.mjs
 * Adds new prompts to the local replica, downloads remote images to uploads/,
 * updates SQLite, prompts.json, and rebuilds the site.
 * 
 * Usage:
 *   node sync_prompt.mjs --json '{"id": 282, "title": "...", "promptText": "...", ...}'
 *   node sync_prompt.mjs --file path/to/prompt.json
 */

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        if (!url || !url.startsWith('http')) {
            resolve(url);
            return;
        }

        const client = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(destPath);
        client.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
                return;
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(destPath);
            });
        }).on('error', (err) => {
            fs.unlink(destPath, () => {});
            reject(err);
        });
    });
}

async function addPrompt(promptData) {
    if (!promptData || !promptData.id || !promptData.title || !promptData.promptText) {
        throw new Error('Prompt data must contain id, title, and promptText.');
    }

    console.log(`Processing prompt #${promptData.id}: "${promptData.title}"...`);

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    // Handle thumbnail
    let localThumbnail = promptData.thumbnail || 'assets/img/cover.jpg';
    if (localThumbnail.startsWith('http')) {
        const ext = path.extname(new URL(localThumbnail).pathname) || '.png';
        const filename = `prompt_${promptData.id}_thumb${ext}`;
        const targetPath = path.join(uploadsDir, filename);
        console.log(`Downloading thumbnail from ${localThumbnail}...`);
        await downloadFile(localThumbnail, targetPath);
        localThumbnail = `uploads/${filename}`;
    }

    // Handle gallery / storyboard images
    const localGallery = [];
    if (Array.isArray(promptData.galleryImages)) {
        for (let idx = 0; idx < promptData.galleryImages.length; idx++) {
            const imgUrl = promptData.galleryImages[idx];
            if (imgUrl.startsWith('http')) {
                const ext = path.extname(new URL(imgUrl).pathname) || '.png';
                const filename = `prompt_${promptData.id}_story_${idx + 1}${ext}`;
                const targetPath = path.join(uploadsDir, filename);
                console.log(`Downloading storyboard image ${idx + 1} from ${imgUrl}...`);
                await downloadFile(imgUrl, targetPath);
                localGallery.push(`uploads/${filename}`);
            } else {
                localGallery.push(imgUrl);
            }
        }
    }

    const cleanedPrompt = {
        id: Number(promptData.id),
        title: promptData.title.trim(),
        category: promptData.category || 'General',
        thumbnail: localThumbnail,
        badge: promptData.badge || '🔒 Premium',
        href: `prompts/${promptData.id}.html`,
        updated: promptData.updated || 'Updated Recently',
        galleryImages: localGallery,
        promptText: promptData.promptText.trim(),
        promptLen: promptData.promptText.trim().length,
        status: 200
    };

    // 1. Update data/prompts.json
    const promptsJsonPath = path.join(process.cwd(), 'data', 'prompts.json');
    let allPrompts = [];
    if (fs.existsSync(promptsJsonPath)) {
        allPrompts = JSON.parse(fs.readFileSync(promptsJsonPath, 'utf8'));
    }

    const existingIdx = allPrompts.findIndex(p => Number(p.id) === Number(cleanedPrompt.id));
    if (existingIdx !== -1) {
        allPrompts[existingIdx] = cleanedPrompt;
        console.log(`Updated existing prompt #${cleanedPrompt.id} in prompts.json.`);
    } else {
        allPrompts.unshift(cleanedPrompt);
        console.log(`Added new prompt #${cleanedPrompt.id} to prompts.json.`);
    }

    fs.writeFileSync(promptsJsonPath, JSON.stringify(allPrompts, null, 2), 'utf8');

    // 2. Save individual JSON file in data/prompts/{id}.json
    const indDir = path.join(process.cwd(), 'data', 'prompts');
    if (!fs.existsSync(indDir)) fs.mkdirSync(indDir, { recursive: true });
    fs.writeFileSync(path.join(indDir, `${cleanedPrompt.id}.json`), JSON.stringify(cleanedPrompt, null, 2), 'utf8');

    // 3. Update data/database.sqlite
    const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
    if (fs.existsSync(dbPath)) {
        try {
            const db = new DatabaseSync(dbPath);
            const isFree = cleanedPrompt.badge.toLowerCase().includes('free') ? 1 : 0;
            const wordCount = cleanedPrompt.promptText.split(/\s+/).filter(Boolean).length;
            
            db.prepare(`
                INSERT INTO prompts (id, title, category_name, thumbnail, badge, is_free, updated_at, prompt_text, char_count, word_count, view_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title,
                    category_name = excluded.category_name,
                    thumbnail = excluded.thumbnail,
                    badge = excluded.badge,
                    is_free = excluded.is_free,
                    updated_at = excluded.updated_at,
                    prompt_text = excluded.prompt_text,
                    char_count = excluded.char_count,
                    word_count = excluded.word_count
            `).run(
                cleanedPrompt.id,
                cleanedPrompt.title,
                cleanedPrompt.category,
                cleanedPrompt.thumbnail,
                cleanedPrompt.badge,
                isFree,
                cleanedPrompt.updated,
                cleanedPrompt.promptText,
                cleanedPrompt.promptLen,
                wordCount,
                0
            );
            console.log(`Updated prompt in SQLite database.`);
        } catch (e) {
            console.error('Notice: SQLite update warning:', e.message);
        }
    }

    // 4. Rebuild the static site and index
    console.log('Rebuilding HTML static site and search indices...');
    execSync('node generate_site.mjs', { stdio: 'inherit' });

    console.log(`\nPrompt #${cleanedPrompt.id} is live at prompts/${cleanedPrompt.id}.html and browse.html.`);
}

// CLI argument parsing
const args = process.argv.slice(2);
let jsonArg = null;
let fileArg = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json' && args[i + 1]) {
        jsonArg = args[i + 1];
        i++;
    } else if (args[i] === '--file' && args[i + 1]) {
        fileArg = args[i + 1];
        i++;
    }
}

if (jsonArg) {
    try {
        const obj = JSON.parse(jsonArg);
        addPrompt(obj);
    } catch (e) {
        console.error('Failed to parse JSON argument:', e.message);
        process.exit(1);
    }
} else if (fileArg) {
    try {
        const obj = JSON.parse(fs.readFileSync(fileArg, 'utf8'));
        addPrompt(obj);
    } catch (e) {
        console.error('Failed to read prompt file:', e.message);
        process.exit(1);
    }
} else {
    console.log('Sync Prompt Utility ready.');
    console.log('Provide --json \'<json_string>\' or --file <path_to_json>.');
}
