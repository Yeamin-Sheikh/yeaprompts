#!/usr/bin/env python3
"""
YeaPrompts 1:1 Local Website Server
Zero external dependencies (pure standard library).
Handles PHP route aliases (/browse.php, /prompt.php?id=XYZ), extensionless routes, and static assets.
"""

import http.server
import socketserver
import urllib.parse
import os
import mimetypes
import sys
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get("PORT", 8000))
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT_DIR)
import db.database as db_repo

class YeaPromptsHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def do_POST(self):
        # Gracefully handle form submissions from contact and community pages
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(b'{"success": true, "message": "Received successfully"}')

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Route matching 1:1 original URL structure and extensionless paths
        if path in ("/", "/index.php"):
            self.path = "/index.html"
        elif path in ("/browse.php", "/browse"):
            self.path = "/browse.html"
        elif path in ("/prompt.php", "/prompt"):
            pid = query.get("id", ["281"])[0]
            candidate = os.path.join(ROOT_DIR, "prompts", f"{pid}.html")
            if os.path.exists(candidate):
                self.path = f"/prompts/{pid}.html"
            else:
                self.path = "/prompt.html"
        elif path in ("/community.php", "/community"):
            self.path = "/community.html"
        elif path in ("/pricing.php", "/pricing"):
            self.path = "/pricing.html"
        elif path in ("/contact.php", "/contact"):
            self.path = "/contact.html"
        elif path in ("/privacy.php", "/privacy"):
            self.path = "/privacy.html"
        elif path in ("/terms.php", "/terms"):
            self.path = "/terms.html"
        elif path in ("/refund.php", "/refund"):
            self.path = "/refund.html"
        elif path in ("/account.php", "/account"):
            self.path = "/account.html"
        elif path == "/api/stats":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(db_repo.get_stats()).encode("utf-8"))
            return
        elif path == "/api/categories":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(db_repo.get_categories()).encode("utf-8"))
            return
        elif path == "/api/prompts":
            pg = int(query.get("page", query.get("pg", ["1"]))[0])
            limit = int(query.get("limit", ["15"])[0])
            cat = query.get("cat", query.get("category", [None]))[0]
            type_val = query.get("type", [None])[0]
            is_free = True if type_val == "free" else False if type_val == "premium" else None
            search = query.get("q", query.get("search", [""]))[0]
            sort = query.get("sort", ["newest"])[0]

            res_data = db_repo.get_prompts(page=pg, limit=limit, category=cat, is_free=is_free, search=search, sort=sort)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(res_data).encode("utf-8"))
            return
        elif path.startswith("/api/prompts/"):
            try:
                pid = int(path.replace("/api/prompts/", ""))
                item = db_repo.get_prompt_by_id(pid)
                if not item:
                    self.send_response(404)
                    self.end_headers()
                    self.wfile.write(b'{"error":"Not found"}')
                    return
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(item).encode("utf-8"))
                return
            except Exception:
                pass
        elif path == "/api/load_more.php":
            api_file = os.path.join(ROOT_DIR, "api", "load_more_data.json")
            if os.path.exists(api_file):
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                with open(api_file, "rb") as f:
                    self.wfile.write(f.read())
                return
        else:
            # Check if appending .html matches a local file
            clean_path = path.lstrip("/")
            candidate = os.path.join(ROOT_DIR, clean_path + ".html")
            if os.path.isfile(candidate):
                self.path = f"/{clean_path}.html"

        return super().do_GET()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), YeaPromptsHandler) as httpd:
        print("=" * 55)
        print("YeaPrompts Local Replica Server Running")
        print(f"Local Website:   http://localhost:{PORT}")
        print(f"Browse Prompts:  http://localhost:{PORT}/browse.php")
        print(f"Prompt Preview:  http://localhost:{PORT}/prompt.php?id=281")
        print("=" * 55)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
