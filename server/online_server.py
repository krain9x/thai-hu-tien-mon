import asyncio
import hashlib
import hmac
import json
import mimetypes
import os
import secrets
import sqlite3
import time
from pathlib import Path
from aiohttp import web, WSMsgType

ROOT_DIR = Path(__file__).resolve().parent.parent
SERVER_DIR = Path(__file__).resolve().parent
DB_PATH = SERVER_DIR / "tienmon_online.db"
HOST = os.environ.get("TIENMON_HOST", "0.0.0.0")
PORT = int(os.environ.get("TIENMON_PORT", "8089"))
RESERVED_ADMIN_NAMES = {"admin", "administrator", "gm", "system", "mod", "moderator"}

def safe_int(v, default=0):
    try:
        return int(v)
    except (TypeError, ValueError):
        return default

def safe_float(v, default=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default

REALM_NAMES = [
    "Phàm Nhân", "Luyện Khí", "Trúc Cơ", "Kim Đan", "Nguyên Anh",
    "Hóa Thần", "Luyện Hư", "Hợp Thể", "Đại Thừa", "Phi Thăng"
]

WORLD_BOSS_POOL = [
    "Thái Cổ Huyết Lôi Ma Đế",
    "Cửu U Ma Long Vương",
    "Huyền Minh Thiên Ma Tôn",
    "Hỗn Độn Yêu Hoàng",
    "Phá Thiên Kiếm Ma Đế"
]

# ==================== TOP-UP PACKAGES, VIP 1..10 & PAYMENT CONFIG ====================
BANK_CONFIG = {
    "bankId": os.environ.get("TIENMON_BANK_ID", "MB"),
    "bankName": os.environ.get("TIENMON_BANK_NAME", "MB Bank (Ngân Hàng Quân Đội)"),
    "accountNo": os.environ.get("TIENMON_BANK_ACC", "0988886688"),
    "accountName": os.environ.get("TIENMON_BANK_OWNER", "THAI HU TIEN MON STUDIO"),
    "momoPhone": os.environ.get("TIENMON_MOMO_PHONE", "0988886688"),
    "webhookSecret": os.environ.get("TIENMON_PAYMENT_SECRET", "thaihu_pay_secret_2026"),
    "sandbox": os.environ.get("TIENMON_SANDBOX_PAY", "1") == "1"
}

TOPUP_PACKS = [
    {"id": "jade_20k",   "cat": "jade", "name": "Túi Tiên Ngọc Nhỏ",  "vnd": 20000,   "jade": 300,   "firstX2": True,  "vipExp": 200,   "icon": "ut_shop_jade_s", "desc": "Nạp 20.000₫ nhận 300 Tiên Ngọc (Lần đầu ×2 thành 600 Ngọc!)"},
    {"id": "jade_50k",   "cat": "jade", "name": "Hộp Tiên Ngọc",      "vnd": 50000,   "jade": 800,   "firstX2": True,  "vipExp": 500,   "icon": "ut_shop_jade_s", "desc": "Nạp 50.000₫ nhận 800 Tiên Ngọc (Lần đầu ×2 thành 1.600 Ngọc!)"},
    {"id": "jade_100k",  "cat": "jade", "name": "Rương Tiên Ngọc",    "vnd": 100000,  "jade": 1700,  "firstX2": True,  "vipExp": 1000,  "icon": "ut_shop_jade_m", "desc": "Nạp 100.000₫ nhận 1.700 Tiên Ngọc (Lần đầu ×2 thành 3.400 Ngọc!)"},
    {"id": "jade_200k",  "cat": "jade", "name": "Bảo Hạp Tiên Ngọc",  "vnd": 200000,  "jade": 3600,  "firstX2": True,  "vipExp": 2000,  "icon": "ut_shop_jade_l", "desc": "Nạp 200.000₫ nhận 3.600 Tiên Ngọc (Lần đầu ×2 thành 7.200 Ngọc!)"},
    {"id": "jade_500k",  "cat": "jade", "name": "Thái Hư Kim Khố",    "vnd": 500000,  "jade": 9500,  "firstX2": True,  "vipExp": 5000,  "icon": "ut_shop_jade_xl","desc": "Nạp 500.000₫ nhận 9.500 Tiên Ngọc (Lần đầu ×2 thành 19.000 Ngọc!)"},
    {"id": "jade_1000k", "cat": "jade", "name": "Chí Tôn Tiên Khố",   "vnd": 1000000, "jade": 20000, "firstX2": True,  "vipExp": 10000, "icon": "ut_shop_jade_xl","desc": "Nạp 1.000.000₫ nhận 20.000 Tiên Ngọc (Lần đầu ×2 thành 40.000 Ngọc!)"},
    {"id": "starter_pack",   "cat": "bundle", "name": "Gói Khai Tông Siêu Hời",   "vnd": 49000,  "jade": 1200, "coin": 30000, "pill": 10, "scroll": 15, "once": True, "vipExp": 500,  "icon": "cont_shop",  "desc": "Giới hạn 1 lần: +1.200 Ngọc, +3 Vạn Linh Thạch, +10 Đan Đột Phá, +15 Ngọc Giản!"},
    {"id": "monthly_card",   "cat": "bundle", "name": "Thẻ Tháng Chí Tôn (30 Ngày)", "vnd": 99000, "jade": 1000, "passDays": 30, "dailyJade": 150, "vipExp": 1000, "icon": "ut_shop_jade_pass30", "desc": "Nhận ngay +1.000 Ngọc · Mỗi ngày đăng nhập nhận +150 Ngọc trong 30 ngày (tổng 5.500 Ngọc)!"},
    {"id": "season_pass",    "cat": "bundle", "name": "Tiên Lệnh Tu Luyện Lục",   "vnd": 129000, "jade": 500,  "seasonPass": True, "once": True, "vipExp": 1300, "icon": "nav_season", "desc": "Mở khóa trọn bộ 30 bậc thưởng Cao Cấp Tiết Khí + nhận ngay 500 Tiên Ngọc!"},
    {"id": "privilege_card", "cat": "bundle", "name": "Lệnh Bài Đặc Quyền Vĩnh Viễn", "vnd": 199000, "jade": 1500, "noAds": True, "once": True, "vipExp": 2000, "icon": "menu_sect", "desc": "Vĩnh viễn +20% sản lượng Điện Các & Cứ Điểm, bỏ giới hạn phúc lợi + nhận ngay 1.500 Ngọc!"}
]

VIP_TIERS = [
    {"lv": 1,  "exp": 200,   "title": "VIP 1 · Linh Giả",   "atkPct": 3,  "coinPct": 5,  "hallPct": 4,  "chest": {"jade": 200,  "herb": 25,  "core": 15}},
    {"lv": 2,  "exp": 600,   "title": "VIP 2 · Chân Nhân",  "atkPct": 6,  "coinPct": 10, "hallPct": 8,  "chest": {"jade": 350,  "pill": 5,   "scroll": 8}},
    {"lv": 3,  "exp": 1500,  "title": "VIP 3 · Kim Tiên",   "atkPct": 10, "coinPct": 15, "hallPct": 12, "chest": {"jade": 600,  "pill": 8,   "core": 35}},
    {"lv": 4,  "exp": 3000,  "title": "VIP 4 · Thái Ất",    "atkPct": 14, "coinPct": 22, "hallPct": 16, "chest": {"jade": 900,  "scroll": 15,"herb": 60}},
    {"lv": 5,  "exp": 6000,  "title": "VIP 5 · Đại La",     "atkPct": 18, "coinPct": 30, "hallPct": 22, "chest": {"jade": 1400, "pill": 15,  "core": 60}},
    {"lv": 6,  "exp": 10000, "title": "VIP 6 · Tiên Vương", "atkPct": 24, "coinPct": 40, "hallPct": 28, "chest": {"jade": 2000, "scroll": 25,"pill": 20}},
    {"lv": 7,  "exp": 18000, "title": "VIP 7 · Tiên Đế",    "atkPct": 30, "coinPct": 50, "hallPct": 35, "chest": {"jade": 3000, "core": 100, "herb": 120}},
    {"lv": 8,  "exp": 30000, "title": "VIP 8 · Thánh Tôn",  "atkPct": 38, "coinPct": 65, "hallPct": 44, "chest": {"jade": 4500, "pill": 35,  "scroll": 40}},
    {"lv": 9,  "exp": 50000, "title": "VIP 9 · Đạo Tổ",     "atkPct": 48, "coinPct": 80, "hallPct": 55, "chest": {"jade": 6500, "core": 180, "pill": 50}},
    {"lv": 10, "exp": 80000, "title": "VIP 10 · Thái Hư Chí Tôn", "atkPct": 60, "coinPct": 100, "hallPct": 70, "chest": {"jade": 10000, "scroll": 80, "pill": 80}}
]

FIRST_TOPUP_REWARD = {
    "weapon": "wp_frost_jian",
    "disciple": "unhak",
    "jade": 500,
    "pill": 10,
    "coin": 20000
}

# ==================== SQLITE PERSISTENCE LAYER ====================
def get_db():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn

DB = get_db()

def hash_password(password: str, salt: str = None) -> str:
    if salt is None:
        salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 60000)
    return f"{salt}${dk.hex()}"

def verify_password(password: str, stored: str) -> bool:
    try:
        salt, hex_dk = stored.split("$", 1)
        cand = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 60000).hex()
        return hmac.compare_digest(cand, hex_dk)
    except Exception:
        return False

def init_db():
    cur = DB.cursor()
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        pass_hash TEXT NOT NULL,
        sect_name TEXT NOT NULL,
        avatar TEXT DEFAULT 'port_master',
        title TEXT DEFAULT 'Tông Chủ Tân Nhập',
        is_bot INTEGER DEFAULT 0,
        created_at REAL NOT NULL,
        last_seen REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at REAL NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS saves (
        user_id INTEGER PRIMARY KEY,
        state_json TEXT NOT NULL,
        power INTEGER DEFAULT 100,
        realm_idx INTEGER DEFAULT 0,
        max_stage INTEGER DEFAULT 1,
        tower_floor INTEGER DEFAULT 1,
        arena_score INTEGER DEFAULT 1000,
        fame INTEGER DEFAULT 0,
        rep INTEGER DEFAULT 0,
        lap INTEGER DEFAULT 1,
        snapshot_json TEXT DEFAULT '{}',
        updated_at REAL NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS guilds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        tag TEXT NOT NULL,
        leader_id INTEGER NOT NULL,
        notice TEXT DEFAULT 'Cùng nhau tu tiên, tranh bá Cửu Châu!',
        exp INTEGER DEFAULT 200,
        week_score INTEGER DEFAULT 1200,
        boss_lv INTEGER DEFAULT 1,
        boss_hp INTEGER DEFAULT 180000,
        boss_max_hp INTEGER DEFAULT 180000,
        bld_json TEXT DEFAULT '{"hall":1,"yard":1,"store":1}',
        created_at REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS guild_members (
        user_id INTEGER PRIMARY KEY,
        guild_id INTEGER NOT NULL,
        role TEXT DEFAULT 'member',
        merit_contrib INTEGER DEFAULT 0,
        joined_at REAL NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(guild_id) REFERENCES guilds(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel TEXT NOT NULL,
        user_id INTEGER,
        sender_name TEXT NOT NULL,
        sect_name TEXT DEFAULT '',
        realm_name TEXT DEFAULT 'Phàm Nhân',
        text TEXT NOT NULL,
        created_at REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS mails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        to_user_id INTEGER NOT NULL,
        from_name TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        attachments_json TEXT DEFAULT '{}',
        claimed INTEGER DEFAULT 0,
        read INTEGER DEFAULT 0,
        created_at REAL NOT NULL,
        FOREIGN KEY(to_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        friend_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        last_gift_day TEXT DEFAULT '',
        created_at REAL NOT NULL,
        UNIQUE(user_id, friend_id)
    );
    CREATE TABLE IF NOT EXISTS market_listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER NOT NULL,
        seller_name TEXT NOT NULL,
        item_type TEXT NOT NULL,
        qty INTEGER NOT NULL,
        price_jade INTEGER NOT NULL,
        status TEXT DEFAULT 'open',
        created_at REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS world_boss (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        name TEXT NOT NULL,
        lv INTEGER NOT NULL,
        hp INTEGER NOT NULL,
        max_hp INTEGER NOT NULL,
        respawn_at REAL DEFAULT 0,
        dmg_board_json TEXT DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS pk_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenger_id INTEGER NOT NULL,
        challenger_name TEXT NOT NULL,
        defender_id INTEGER NOT NULL,
        defender_name TEXT NOT NULL,
        mode TEXT NOT NULL,
        winner_id INTEGER NOT NULL,
        score_delta INTEGER DEFAULT 25,
        created_at REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_billing (
        user_id INTEGER PRIMARY KEY,
        total_vnd INTEGER DEFAULT 0,
        vip_exp INTEGER DEFAULT 0,
        vip_lv INTEGER DEFAULT 0,
        first_topup_claimed INTEGER DEFAULT 0,
        first_packs_json TEXT DEFAULT '{}',
        vip_claimed_json TEXT DEFAULT '{}',
        pass_30_until REAL DEFAULT 0,
        pass_30_last_claim TEXT DEFAULT '',
        no_ads INTEGER DEFAULT 0,
        season_pass INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS topup_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_code TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        pack_id TEXT NOT NULL,
        pack_name TEXT NOT NULL,
        amount_vnd INTEGER NOT NULL,
        method TEXT NOT NULL,
        card_info TEXT DEFAULT '',
        status TEXT DEFAULT 'pending',
        jade_granted INTEGER DEFAULT 0,
        bonus_jade INTEGER DEFAULT 0,
        vip_exp_added INTEGER DEFAULT 0,
        created_at REAL NOT NULL,
        paid_at REAL DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS giftcodes (
        code TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        rewards_json TEXT NOT NULL,
        max_uses INTEGER DEFAULT 99999,
        used_count INTEGER DEFAULT 0,
        expires_at REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS giftcode_claims (
        user_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        claimed_at REAL NOT NULL,
        PRIMARY KEY(user_id, code)
    );
    CREATE TABLE IF NOT EXISTS veins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        tier INTEGER NOT NULL,
        reward_jade INTEGER NOT NULL,
        reward_essence INTEGER DEFAULT 0,
        guild_id INTEGER,
        hp INTEGER NOT NULL,
        max_hp INTEGER NOT NULL,
        captured_at REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS vein_claims (
        user_id INTEGER NOT NULL,
        vein_id INTEGER NOT NULL,
        day_key TEXT NOT NULL,
        PRIMARY KEY(user_id, vein_id, day_key)
    );
    CREATE TABLE IF NOT EXISTS gm_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gm_name TEXT NOT NULL,
        action_kind TEXT NOT NULL,
        target_label TEXT DEFAULT '',
        detail TEXT DEFAULT '',
        created_at REAL NOT NULL
    );
    """)

    # Seed 5 Linh Mạch Bang Hội if empty
    if cur.execute("SELECT COUNT(*) FROM veins").fetchone()[0] == 0:
        existing_gids = [r[0] for r in cur.execute("SELECT id FROM guilds ORDER BY id LIMIT 3").fetchall()]
        seed_veins = [
            ("Thanh Lam Linh Mạch",     1,  45,  6,  180000, existing_gids[0] if len(existing_gids) > 0 else None),
            ("Xích Viêm Hỏa Mạch",      2,  70, 12,  320000, existing_gids[1] if len(existing_gids) > 1 else None),
            ("Cửu Tiêu Lôi Mạch",       3, 100, 18,  520000, existing_gids[2] if len(existing_gids) > 2 else None),
            ("Thái Hư Tinh Mạch",       4, 140, 28,  850000, None),
            ("Hồng Mông Hỗn Độn Mạch",  5, 200, 45, 1400000, None),
        ]
        for vname, tier, rj, re_, vhp, gid in seed_veins:
            cur.execute(
                "INSERT OR IGNORE INTO veins (name, tier, reward_jade, reward_essence, guild_id, hp, max_hp, captured_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (vname, tier, rj, re_, gid, vhp, vhp, time.time() - 3600)
            )

    # Seed active server Giftcodes if missing
    seed_codes = [
        ("THAIHU2026", "Quà Khai Mở Máy Chủ Thái Hư 2026", {"jade": 500, "herb": 30, "core": 20}),
        ("TANTHU",     "Quà Tân Thủ Khai Tông Lập Phái",   {"jade": 300, "coin": 10000, "pill": 5}),
        ("TIENMONVIP", "Quà Tri Ân Tông Chủ Tiên Môn",     {"jade": 800, "scroll": 10, "core": 15}),
    ]
    for code, title, rws in seed_codes:
        cur.execute("INSERT OR IGNORE INTO giftcodes (code, title, rewards_json, max_uses, used_count, expires_at) VALUES (?, ?, ?, 99999, 0, 0)",
                    (code, title, json.dumps(rws, ensure_ascii=False)))

    # Seed World Boss if missing
    if not cur.execute("SELECT 1 FROM world_boss WHERE id=1").fetchone():
        cur.execute(
            "INSERT INTO world_boss (id, name, lv, hp, max_hp, respawn_at, dmg_board_json) VALUES (1, ?, 1, 2500000, 2500000, 0, '{}')",
            (WORLD_BOSS_POOL[0],)
        )
    # Safe column migrations for ban / admin flag / payment txn dedupe
    for ddl in (
        "ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0",
        "ALTER TABLE topup_orders ADD COLUMN bank_txn_id TEXT DEFAULT ''"
    ):
        try:
            cur.execute(ddl)
        except sqlite3.OperationalError:
            pass
    cur.execute("UPDATE users SET is_admin=1 WHERE LOWER(username) IN ('krain9x', 'admin')")
    cur.execute("DELETE FROM sessions WHERE expires_at < ?", (time.time(),))
    DB.commit()

    # Seed realistic Xianxia rival cultivators & 3 starter Guilds + initial Auction items once
    if cur.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0:
        now = time.time()
        rivals = [
            ("lybachhac", "Thanh Vân Kiếm Tông", "Kiếm Tôn Thanh Vân", 48200, 6, 48, 17, 1540, 1950, 55, 2, "wp_immortal_jian", "leilong", ["unhak", "yeonhwa", "cheolsan", "cheonga"]),
            ("diepvongan", "U Minh Kiếm Các", "Ảnh Kiếm Chí Tôn", 36500, 5, 42, 15, 1460, 1420, -48, 2, "wp_thunder_spear", "qingluan", ["heugyeong", "soyul", "macheol", "unhak"]),
            ("trieucuong", "Kim Cang Cổ Tự", "Bất Động Kim Cang", 27400, 4, 35, 13, 1320, 1080, 42, 1, "wp_jade_staff", "xuanwu", ["cheolsan", "dolsoe", "harang", "cheonga"]),
            ("hoaviemton", "Xích Viêm Thần Cốc", "Phần Thiên Hỏa Quân", 19800, 4, 31, 11, 1245, 760, -25, 1, "wp_flame_dao", "leilong", ["macheol", "harang", "danbi", "sundeok"]),
            ("hanbangnhi", "Huyền Băng Tuyết Cung", "Băng Tâm Tiên Tử", 14200, 3, 25, 9, 1180, 540, 38, 1, "wp_frost_jian", "qingluan", ["yeonhwa", "cheonga", "danbi", "makdong"]),
            ("thiencotu", "Thiên Cơ Lâu", "Thần Toán Quân Sư", 9600, 2, 19, 7, 1110, 320, 10, 1, "wp_frost_jian", "jiuwei", ["soyul", "danbi", "makdong"]),
            ("macvanphong", "Cửu Tiêu Lôi Điện", "Lôi Đình Đạo Chủ", 6100, 2, 14, 5, 1055, 190, 20, 1, "wp_thunder_spear", "jiuwei", ["unhak", "cheolsan"]),
            ("tuyetkhong", "Vạn Hoa Linh Cốc", "Dược Vương Cốc Chủ", 3400, 1, 9, 3, 1015, 90, 15, 1, "wp_iron_jian", "jiuwei", ["cheonga", "yeonhwa"])
        ]
        bot_ids = []
        for uname, sect, title, pwr, ridx, stg, tw, arena, fame, rep, lap, wp, pet, dep in rivals:
            cur.execute(
                "INSERT INTO users (username, pass_hash, sect_name, title, is_bot, created_at, last_seen) VALUES (?, ?, ?, ?, 1, ?, ?)",
                (uname, hash_password(secrets.token_hex(8)), sect, title, now - 86400, now - 120)
            )
            uid = cur.lastrowid
            bot_ids.append((uid, uname, sect))
            snap = {
                "atk": max(45, int(pwr * 0.14)),
                "maxHp": max(500, int(pwr * 1.45)),
                "def": max(15, int(pwr * 0.045)),
                "crit": min(0.55, 0.12 + ridx * 0.05),
                "weapon": wp,
                "pet": pet,
                "deployed": dep,
                "realmIdx": ridx,
                "sectName": sect,
                "title": title
            }
            cur.execute(
                "INSERT INTO saves (user_id, state_json, power, realm_idx, max_stage, tower_floor, arena_score, fame, rep, lap, snapshot_json, updated_at) VALUES (?, '{}', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (uid, pwr, ridx, stg, tw, arena, fame, rep, lap, json.dumps(snap, ensure_ascii=False), now)
            )

        starter_guilds = [
            ("Thiên Đạo Liên Minh", "TĐLM", bot_ids[0][0], "Chiêu mộ đạo hữu tu tiên chính đạo, cùng đánh Ma Đế mỗi tối!", 1450, 14800, 3, 240000, 320000, '{"hall":3,"yard":2,"store":2}'),
            ("Cửu Châu Tiên Minh", "CCTM", bot_ids[2][0], "Liên minh tự do, cổ vũ & mượn cao thủ chi viện mỗi ngày!", 920, 8400, 2, 195000, 240000, '{"hall":2,"yard":2,"store":1}'),
            ("U Minh Huyết Tông", "UMHT", bot_ids[1][0], "Bá đạo tung hoành, thách đấu Luận Kiếm toàn server!", 1180, 11200, 2, 160000, 240000, '{"hall":2,"yard":1,"store":2}')
        ]
        g_ids = []
        for gnm, tag, lid, notice, gexp, wsc, blv, bhp, bmhp, bldj in starter_guilds:
            cur.execute(
                "INSERT INTO guilds (name, tag, leader_id, notice, exp, week_score, boss_lv, boss_hp, boss_max_hp, bld_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (gnm, tag, lid, notice, gexp, wsc, blv, bhp, bmhp, bldj, now - 86400)
            )
            g_ids.append(cur.lastrowid)
        for i, (uid, _, _) in enumerate(bot_ids):
            gid = g_ids[i % len(g_ids)]
            role = "leader" if i < 3 else "member"
            cur.execute("INSERT OR IGNORE INTO guild_members (user_id, guild_id, role, merit_contrib, joined_at) VALUES (?, ?, ?, ?, ?)",
                        (uid, gid, role, 120 + (8 - i) * 35, now - 43200))

        seed_market = [
            (bot_ids[0][0], bot_ids[0][2], "herb", 30, 45),
            (bot_ids[2][0], bot_ids[2][2], "core", 25, 60),
            (bot_ids[3][0], bot_ids[3][2], "pill", 5, 80),
            (bot_ids[4][0], bot_ids[4][2], "scroll", 10, 70),
            (bot_ids[5][0], bot_ids[5][2], "herb", 60, 85),
        ]
        for sid, snm, itype, qty, price in seed_market:
            cur.execute("INSERT INTO market_listings (seller_id, seller_name, item_type, qty, price_jade, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', ?)",
                        (sid, snm, itype, qty, price, now - 3600))

        cur.execute(
            "INSERT INTO chat_messages (channel, user_id, sender_name, sect_name, realm_name, text, created_at) VALUES ('world', NULL, 'Thiên Đạo Thông Báo', 'Tiên Giới', 'Hệ Thống', ?, ?)",
            ("🌟 Máy chủ Thái Hư Tiên Môn Online đã khai mở! Chào mừng chư vị Tông Chủ luận kiếm, lập Minh Hội và chinh phạt Thế Giới Yêu Đế!", now - 60)
        )

    DB.commit()

init_db()

# ==================== LIVE REAL-TIME HUB (WS PRESENCE, CHAT, 1v1 PK, WORLD BOSS, PLAZA & CO-OP) ====================
ONLINE_SOCKETS = {}  # user_id -> { ws, user, status }
PK_INVITES = {}      # invite_id -> { id, from_id, to_id, created_at }
PK_ROOMS = {}        # room_id -> { id, p1, p2, hp: {uid: int}, maxHp: {uid: int}, started_at, ended }
COOP_ROOMS = {}      # room_id -> { id, name, tier, host_id, members: [uid], status, boss, dmg: {uid: int}, started_at }
PLAZA_POS = {}       # user_id -> { x, z, facing, updated }

COOP_TIERS = {
    1: {"name": "U Lam Yêu Vương (Sơ Cấp · 2–4 Người)", "bossName": "U Lam Ma Giao Vương", "lv": 45,  "hp": 260000,  "atk": 95,  "jade": 90,  "essence": 16, "gemLv": 2, "gemQty": 2},
    2: {"name": "Viêm Ma Đế Tôn (Trung Cấp · 2–4 Người)", "bossName": "Phần Thiên Viêm Đế",  "lv": 75,  "hp": 780000,  "atk": 240, "jade": 160, "essence": 30, "gemLv": 2, "gemQty": 3},
    3: {"name": "Thái Cổ Hỗn Độn (Đỉnh Phong · 2–4 Người)", "bossName": "Thái Cổ Hỗn Độn Thú", "lv": 110, "hp": 2200000, "atk": 520, "jade": 280, "essence": 55, "gemLv": 3, "gemQty": 2},
}

COSMETIC_WING_LABELS = {
    "wing_thanhlam": "Thanh Lam Dực",
    "wing_xichviem": "Xích Viêm Dực",
    "wing_cuutieu":  "Cửu Tiêu Dực",
    "wing_hongmong": "Hồng Mông Dực",
}

def get_user_vip_and_cosmetics(uid: int, snap: dict = None):
    b_row = DB.execute("SELECT vip_lv FROM user_billing WHERE user_id=?", (uid,)).fetchone()
    vip_lv = int(b_row["vip_lv"]) if b_row else 0
    if snap is None:
        s_row = DB.execute("SELECT snapshot_json FROM saves WHERE user_id=?", (uid,)).fetchone()
        snap = json.loads(s_row["snapshot_json"] or "{}") if s_row else {}
    cos = snap.get("cosmetics") or {"wing": "wing_none", "aura": "aura_none"}
    return vip_lv, cos

def build_plaza_list():
    out = []
    seen = set()
    slot_offsets = [(-3.6, 2.2), (3.8, 2.4), (-5.2, 5.2), (5.0, 5.4), (-2.2, 6.8), (2.4, 7.0), (-6.4, 3.0), (6.5, 3.2), (-4.0, 8.2), (4.2, 8.0)]
    # 1) Live online users with active WebSocket
    idx = 0
    for uid, info in list(ONLINE_SOCKETS.items()):
        u = info["user"]
        snap = json.loads(u.get("snapshot_json") or "{}")
        vip_lv, cos = get_user_vip_and_cosmetics(uid, snap)
        pos = PLAZA_POS.get(uid)
        dx, dz = slot_offsets[idx % len(slot_offsets)]
        idx += 1
        seen.add(uid)
        out.append({
            "id": uid, "username": u["username"], "sectName": u["sect_name"],
            "power": u.get("power") or 100, "realmIdx": u.get("realm_idx") or 0,
            "weapon": snap.get("weapon") or "wp_iron_jian",
            "pet": snap.get("pet") or "",
            "cosmetics": cos, "vipLv": vip_lv, "online": True,
            "x": pos["x"] if pos else dx, "z": pos["z"] if pos else dz,
            "facing": pos["facing"] if pos else (0.2 if idx % 2 else -0.2),
        })
    # 2) Fill nearby cultivators in plaza from top offline/NPC leaderboard up to 8 total
    if len(out) < 8:
        rows = DB.execute("""
            SELECT u.id, u.username, u.sect_name, s.power, s.realm_idx, s.snapshot_json
            FROM users u JOIN saves s ON s.user_id = u.id
            ORDER BY s.power DESC LIMIT 12
        """).fetchall()
        for r in rows:
            if r["id"] in seen or len(out) >= 8:
                continue
            snap = json.loads(r["snapshot_json"] or "{}")
            vip_lv, cos = get_user_vip_and_cosmetics(r["id"], snap)
            # Assign signature default wings visually for top rival emperors if unset
            if (not cos.get("wing") or cos.get("wing") == "wing_none") and (r["realm_idx"] or 0) >= 4:
                cos = {"wing": "wing_cuutieu" if (r["realm_idx"] or 0) >= 5 else "wing_thanhlam", "aura": "aura_jade"}
            dx, dz = slot_offsets[idx % len(slot_offsets)]
            idx += 1
            seen.add(r["id"])
            out.append({
                "id": r["id"], "username": r["username"], "sectName": r["sect_name"],
                "power": r["power"] or 100, "realmIdx": r["realm_idx"] or 0,
                "weapon": snap.get("weapon") or "wp_iron_jian",
                "pet": snap.get("pet") or "",
                "cosmetics": cos, "vipLv": vip_lv, "online": False,
                "x": dx, "z": dz, "facing": (idx % 3 - 1) * 0.45,
            })
    return out

def build_coop_rooms_payload():
    rooms = []
    for rid, rm in list(COOP_ROOMS.items()):
        tdef = COOP_TIERS.get(rm["tier"], COOP_TIERS[1])
        mems = []
        for mid in rm["members"]:
            mu = ONLINE_SOCKETS.get(mid, {}).get("user")
            if not mu:
                row = DB.execute("SELECT u.id, u.username, u.sect_name, s.power, s.realm_idx FROM users u LEFT JOIN saves s ON s.user_id=u.id WHERE u.id=?", (mid,)).fetchone()
                mu = dict(row) if row else {"id": mid, "username": "Đạo Hữu", "sect_name": "Tiên Môn", "power": 100, "realm_idx": 0}
            mems.append({"id": mid, "username": mu["username"], "sectName": mu["sect_name"], "power": mu.get("power") or 100, "realmIdx": mu.get("realm_idx") or 0})
        rooms.append({
            "id": rid, "name": rm["name"], "tier": rm["tier"], "tierName": tdef["name"],
            "bossName": rm["boss"]["name"], "bossHp": rm["boss"]["hp"], "bossMaxHp": rm["boss"]["maxHp"],
            "hostId": rm["host_id"], "status": rm["status"], "members": mems,
            "reward": {"jade": tdef["jade"], "essence": tdef["essence"], "gemLv": tdef["gemLv"], "gemQty": tdef["gemQty"]}
        })
    return rooms

def get_user_by_token(token: str):
    if not token:
        return None
    row = DB.execute("""
        SELECT u.id, u.username, u.sect_name, u.avatar, u.title, u.is_bot,
               COALESCE(u.banned, 0) AS banned, COALESCE(u.is_admin, 0) AS is_admin,
               s.power, s.realm_idx, s.max_stage, s.tower_floor, s.arena_score, s.fame, s.rep, s.lap, s.snapshot_json
        FROM sessions sess
        JOIN users u ON u.id = sess.user_id
        LEFT JOIN saves s ON s.user_id = u.id
        WHERE sess.token = ? AND sess.expires_at > ? AND COALESCE(u.banned, 0) = 0
    """, (token, time.time())).fetchone()
    return dict(row) if row else None

def auth_user(request: web.Request):
    hdr = request.headers.get("Authorization", "")
    token = hdr[7:].strip() if hdr.startswith("Bearer ") else request.query.get("token", "")
    return get_user_by_token(token)

def send_mail(to_user_id: int, from_name: str, title: str, body: str, attachments: dict = None):
    DB.execute(
        "INSERT INTO mails (to_user_id, from_name, title, body, attachments_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (to_user_id, from_name, title, body, json.dumps(attachments or {}, ensure_ascii=False), time.time())
    )
    DB.commit()

async def ws_send(uid: int, payload: dict):
    info = ONLINE_SOCKETS.get(uid)
    if info and not info["ws"].closed:
        try:
            await info["ws"].send_json(payload)
        except Exception:
            pass

async def ws_broadcast(payload: dict, guild_id: int = None):
    if guild_id is not None:
        mids = {r["user_id"] for r in DB.execute("SELECT user_id FROM guild_members WHERE guild_id=?", (guild_id,)).fetchall()}
        targets = [uid for uid in list(ONLINE_SOCKETS.keys()) if uid in mids]
    else:
        targets = list(ONLINE_SOCKETS.keys())
    for uid in targets:
        await ws_send(uid, payload)

def build_online_roster():
    roster = []
    for uid, info in ONLINE_SOCKETS.items():
        u = info["user"]
        ridx = u.get("realm_idx") or 0
        roster.append({
            "id": uid,
            "username": u["username"],
            "sectName": u["sect_name"],
            "power": u.get("power") or 100,
            "realmIdx": ridx,
            "realmName": REALM_NAMES[min(len(REALM_NAMES) - 1, max(0, ridx))],
            "arenaScore": u.get("arena_score") or 1000,
            "status": info.get("status", "Đang Tu Luyện")
        })
    return roster

async def broadcast_presence():
    await ws_broadcast({"type": "presence", "count": len(ONLINE_SOCKETS), "users": build_online_roster()})

async def post_system_chat(text: str, channel: str = "world", guild_id: int = None):
    now = time.time()
    DB.execute(
        "INSERT INTO chat_messages (channel, user_id, sender_name, sect_name, realm_name, text, created_at) VALUES (?, NULL, 'Thiên Đạo Thông Báo', 'Tiên Giới', 'Hệ Thống', ?, ?)",
        (channel, text, now)
    )
    DB.commit()
    await ws_broadcast({
        "type": "chat",
        "msg": {
            "channel": channel, "user_id": None, "sender_name": "Thiên Đạo Thông Báo",
            "sect_name": "Tiên Giới", "realm_name": "Hệ Thống", "text": text, "created_at": now
        }
    }, guild_id=guild_id)

# ==================== REST API HANDLERS ====================
async def api_register(request: web.Request):
    data = await request.json()
    username = str(data.get("username", "")).strip().lower()
    password = str(data.get("password", "")).strip()
    sect_name = str(data.get("sectName", "")).strip() or "Thái Hư Tiên Môn"
    init_state = data.get("initialState")

    if not username or len(username) < 3 or len(username) > 20 or not username.replace("_", "").isalnum():
        return web.json_response({"ok": False, "error": "Tên đạo hiệu dài 3–20 ký tự, chỉ gồm chữ/số/_!"}, status=400)
    if username in RESERVED_ADMIN_NAMES:
        return web.json_response({"ok": False, "error": "Tên đạo hiệu này được dành riêng cho hệ thống!"}, status=403)
    if len(password) < 4:
        return web.json_response({"ok": False, "error": "Mật khẩu tối thiểu 4 ký tự!"}, status=400)
    if DB.execute("SELECT 1 FROM users WHERE username=?", (username,)).fetchone():
        return web.json_response({"ok": False, "error": "Đạo hiệu này đã tồn tại trên máy chủ!"}, status=409)

    now = time.time()
    cur = DB.cursor()
    try:
        cur.execute(
            "INSERT INTO users (username, pass_hash, sect_name, title, is_bot, created_at, last_seen) VALUES (?, ?, ?, 'Tông Chủ Khai Phái', 0, ?, ?)",
            (username, hash_password(password), sect_name[:28], now, now)
        )
    except sqlite3.IntegrityError:
        DB.rollback()
        return web.json_response({"ok": False, "error": "Đạo hiệu này đã tồn tại trên máy chủ!"}, status=409)
    uid = cur.lastrowid
    state_str = json.dumps(init_state, ensure_ascii=False) if isinstance(init_state, dict) else "{}"
    cur.execute(
        "INSERT INTO saves (user_id, state_json, power, realm_idx, max_stage, tower_floor, arena_score, fame, rep, lap, snapshot_json, updated_at) VALUES (?, ?, 100, 0, 1, 1, 1000, 0, 0, 1, '{}', ?)",
        (uid, state_str, now)
    )
    token = secrets.token_hex(32)
    cur.execute("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", (token, uid, now + 86400 * 30))
    DB.commit()

    send_mail(uid, "Thái Hư Tiên Phủ", "Quà Tân Thủ Máy Chủ Online",
              f"Chúc mừng Đạo Hữu {username} khai lập「{sect_name}」tại Thái Hư Tiên Giới Online! Nhận ngay quà khởi hành.",
              {"jade": 300, "herb": 20, "core": 12, "pill": 3})
    await post_system_chat(f"✨ Đạo Hữu {username} vừa khai lập tông môn「{sect_name}」gia nhập Tiên Giới!")
    user = get_user_by_token(token)
    return web.json_response({"ok": True, "token": token, "user": user, "state": init_state if isinstance(init_state, dict) else None})

async def api_login(request: web.Request):
    data = await request.json()
    username = str(data.get("username", "")).strip().lower()
    password = str(data.get("password", "")).strip()
    row = DB.execute("SELECT * FROM users WHERE username=? AND is_bot=0", (username,)).fetchone()
    if not row or not verify_password(password, row["pass_hash"]):
        return web.json_response({"ok": False, "error": "Sai tên đạo hiệu hoặc mật khẩu!"}, status=401)
    if row["banned"]:
        return web.json_response({"ok": False, "error": "Tài khoản này đã bị khóa bởi Thiên Đạo GM!"}, status=403)
    now = time.time()
    token = secrets.token_hex(32)
    DB.execute("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", (token, row["id"], now + 86400 * 30))
    DB.execute("UPDATE users SET last_seen=? WHERE id=?", (now, row["id"]))
    DB.commit()
    save_row = DB.execute("SELECT state_json FROM saves WHERE user_id=?", (row["id"],)).fetchone()
    state = None
    if save_row and save_row["state_json"] and save_row["state_json"] != "{}":
        try:
            state = json.loads(save_row["state_json"])
        except Exception:
            state = None
    user = get_user_by_token(token)
    return web.json_response({"ok": True, "token": token, "user": user, "state": state})

async def api_me(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    save_row = DB.execute("SELECT state_json FROM saves WHERE user_id=?", (user["id"],)).fetchone()
    state = None
    if save_row and save_row["state_json"] and save_row["state_json"] != "{}":
        try:
            state = json.loads(save_row["state_json"])
        except Exception:
            state = None
    unread = DB.execute("SELECT COUNT(*) FROM mails WHERE to_user_id=? AND claimed=0", (user["id"],)).fetchone()[0]
    g_row = DB.execute("SELECT g.* FROM guilds g JOIN guild_members gm ON gm.guild_id=g.id WHERE gm.user_id=?", (user["id"],)).fetchone()
    return web.json_response({
        "ok": True, "user": user, "state": state, "unreadMails": unread,
        "guild": dict(g_row) if g_row else None, "onlineCount": len(ONLINE_SOCKETS)
    })

async def api_save_sync(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    data = await request.json()
    st = data.get("state")
    snap = data.get("snapshot") or {}
    if not isinstance(st, dict):
        return web.json_response({"ok": False, "error": "Missing state"}, status=400)

    prev = DB.execute("SELECT realm_idx, arena_score FROM saves WHERE user_id=?", (user["id"],)).fetchone()
    prev_realm = prev["realm_idx"] if prev else 0
    prev_arena = prev["arena_score"] if prev else 1000
    new_realm = max(0, safe_int(st.get("realmIdx"), 0))
    power = max(1, safe_int(data.get("power") or snap.get("power"), 100))
    max_stage = max(1, safe_int(st.get("maxStage"), 1))
    tower_floor = max(1, safe_int(st.get("towerFloor"), 1))
    client_arena = safe_int(st.get("arenaScore"), prev_arena)
    arena_score = prev_arena if prev_arena != 1000 and client_arena == 1000 else max(prev_arena, client_arena)
    fame = max(0, safe_int(st.get("fame"), 0))
    rep = max(0, safe_int(st.get("rep"), 0))
    lap = max(1, safe_int(st.get("lap"), 1))
    sect_name = str(data.get("sectName") or user["sect_name"]).strip()[:28]

    now = time.time()
    DB.execute("UPDATE users SET sect_name=?, last_seen=? WHERE id=?", (sect_name, now, user["id"]))
    DB.execute("""
        UPDATE saves SET state_json=?, power=?, realm_idx=?, max_stage=?, tower_floor=?,
                         arena_score=?, fame=?, rep=?, lap=?, snapshot_json=?, updated_at=?
        WHERE user_id=?
    """, (json.dumps(st, ensure_ascii=False), power, new_realm, max_stage, tower_floor,
          arena_score, fame, rep, lap, json.dumps(snap, ensure_ascii=False), now, user["id"]))
    DB.commit()

    if user["id"] in ONLINE_SOCKETS:
        ONLINE_SOCKETS[user["id"]]["user"].update({
            "sect_name": sect_name, "power": power, "realm_idx": new_realm,
            "max_stage": max_stage, "arena_score": arena_score, "snapshot_json": json.dumps(snap, ensure_ascii=False)
        })
    if new_realm > prev_realm and new_realm >= 2:
        rnm = REALM_NAMES[min(len(REALM_NAMES) - 1, new_realm)]
        await post_system_chat(f"⚡ Chấn động Tiên Giới! {user['username']} ({sect_name}) vừa độ kiếp đột phá cảnh giới「{rnm}」!")
    return web.json_response({"ok": True, "syncedAt": now})

async def api_leaderboard(request: web.Request):
    sort = request.query.get("sort", "power")
    col_map = {
        "power": "s.power DESC",
        "stage": "s.max_stage DESC, s.power DESC",
        "arena": "s.arena_score DESC, s.power DESC",
        "tower": "s.tower_floor DESC, s.power DESC"
    }
    order = col_map.get(sort, "s.power DESC")
    rows = DB.execute(f"""
        SELECT u.id, u.username, u.sect_name, u.title, u.is_bot,
               s.power, s.realm_idx, s.max_stage, s.tower_floor, s.arena_score, s.fame, s.rep, s.lap,
               g.name as guild_name, g.tag as guild_tag
        FROM users u
        JOIN saves s ON s.user_id = u.id
        LEFT JOIN guild_members gm ON gm.user_id = u.id
        LEFT JOIN guilds g ON g.id = gm.guild_id
        ORDER BY {order}
        LIMIT 50
    """).fetchall()
    out = []
    for idx, r in enumerate(rows):
        ridx = r["realm_idx"] or 0
        out.append({
            "rank": idx + 1,
            "id": r["id"],
            "username": r["username"],
            "sectName": r["sect_name"],
            "title": r["title"],
            "isBot": bool(r["is_bot"]),
            "online": r["id"] in ONLINE_SOCKETS,
            "power": r["power"],
            "realmIdx": ridx,
            "realmName": REALM_NAMES[min(len(REALM_NAMES) - 1, max(0, ridx))],
            "maxStage": r["max_stage"],
            "towerFloor": r["tower_floor"],
            "arenaScore": r["arena_score"],
            "fame": r["fame"],
            "lap": r["lap"],
            "guildTag": r["guild_tag"] or ""
        })
    return web.json_response({"ok": True, "sort": sort, "list": out, "onlineCount": len(ONLINE_SOCKETS)})

async def api_pvp_targets(request: web.Request):
    user = auth_user(request)
    uid = user["id"] if user else -1
    rows = DB.execute("""
        SELECT u.id, u.username, u.sect_name, u.title, u.is_bot,
               s.power, s.realm_idx, s.arena_score, s.snapshot_json
        FROM users u JOIN saves s ON s.user_id = u.id
        WHERE u.id != ?
        ORDER BY s.arena_score DESC
        LIMIT 30
    """, (uid,)).fetchall()
    online_list, async_list = [], []
    for r in rows:
        snap = {}
        try:
            snap = json.loads(r["snapshot_json"] or "{}")
        except Exception:
            pass
        item = {
            "id": r["id"], "username": r["username"], "sectName": r["sect_name"],
            "title": r["title"], "isBot": bool(r["is_bot"]), "online": r["id"] in ONLINE_SOCKETS,
            "power": r["power"], "realmIdx": r["realm_idx"],
            "realmName": REALM_NAMES[min(len(REALM_NAMES) - 1, max(0, r["realm_idx"] or 0))],
            "arenaScore": r["arena_score"], "snapshot": snap
        }
        if item["online"]:
            online_list.append(item)
        async_list.append(item)

    logs = DB.execute("SELECT * FROM pk_logs ORDER BY id DESC LIMIT 15").fetchall()
    return web.json_response({
        "ok": True,
        "online": online_list,
        "targets": async_list,
        "logs": [dict(l) for l in logs]
    })

async def api_pvp_async_result(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    data = await request.json()
    def_id = int(data.get("defenderId") or 0)
    win = bool(data.get("win"))
    def_row = DB.execute("SELECT u.id, u.username, u.is_bot, s.arena_score FROM users u JOIN saves s ON s.user_id=u.id WHERE u.id=?", (def_id,)).fetchone()
    if not def_row:
        return web.json_response({"ok": False, "error": "Opponent not found"}, status=404)
    delta = 25 if win else -14
    new_score = max(0, (user["arena_score"] or 1000) + delta)
    DB.execute("UPDATE saves SET arena_score=? WHERE user_id=?", (new_score, user["id"]))
    if win and not def_row["is_bot"]:
        def_new = max(0, (def_row["arena_score"] or 1000) - 10)
        DB.execute("UPDATE saves SET arena_score=? WHERE user_id=?", (def_new, def_id))
        send_mail(def_id, "Luận Kiếm Đài", "Chiến Báo Phòng Thủ",
                  f"Tông Chủ {user['username']} ({user['sect_name']}) vừa thách đấu và chiến thắng bóng đội hình của bạn (-10 điểm ELO).", {})
    DB.execute(
        "INSERT INTO pk_logs (challenger_id, challenger_name, defender_id, defender_name, mode, winner_id, score_delta, created_at) VALUES (?, ?, ?, ?, 'async', ?, ?, ?)",
        (user["id"], user["username"], def_id, def_row["username"], user["id"] if win else def_id, abs(delta), time.time())
    )
    DB.commit()
    return web.json_response({"ok": True, "arenaScore": new_score, "delta": delta})

# ==================== SHARED REAL-TIME WORLD BOSS ====================
def get_wb_payload():
    row = DB.execute("SELECT * FROM world_boss WHERE id=1").fetchone()
    now = time.time()
    if row["hp"] <= 0 and row["respawn_at"] > 0 and now >= row["respawn_at"]:
        new_lv = row["lv"] + 1
        new_max = int(2500000 * (1 + (new_lv - 1) * 0.45))
        new_nm = WORLD_BOSS_POOL[(new_lv - 1) % len(WORLD_BOSS_POOL)]
        DB.execute("UPDATE world_boss SET name=?, lv=?, hp=?, max_hp=?, respawn_at=0, dmg_board_json='{}' WHERE id=1",
                   (new_nm, new_lv, new_max, new_max))
        DB.commit()
        row = DB.execute("SELECT * FROM world_boss WHERE id=1").fetchone()
    board = json.loads(row["dmg_board_json"] or "{}")
    ranked = sorted(board.values(), key=lambda x: x["dmg"], reverse=True)[:15]
    return {
        "name": row["name"], "lv": row["lv"], "hp": row["hp"], "maxHp": row["max_hp"],
        "respawnIn": max(0, int(row["respawn_at"] - now)) if row["hp"] <= 0 else 0,
        "topDamage": ranked
    }

async def api_worldboss_get(request: web.Request):
    return web.json_response({"ok": True, "boss": get_wb_payload()})

async def api_worldboss_hit(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    data = await request.json()
    dmg = max(1, min(5000000, int(data.get("dmg") or 0)))
    row = DB.execute("SELECT * FROM world_boss WHERE id=1").fetchone()
    if row["hp"] <= 0:
        return web.json_response({"ok": True, "killed": False, "boss": get_wb_payload()})
    new_hp = max(0, row["hp"] - dmg)
    board = json.loads(row["dmg_board_json"] or "{}")
    key = str(user["id"])
    entry = board.get(key) or {"userId": user["id"], "username": user["username"], "sectName": user["sect_name"], "dmg": 0}
    entry["dmg"] += dmg
    entry["sectName"] = user["sect_name"]
    board[key] = entry

    killed = False
    if new_hp == 0:
        killed = True
        respawn_at = time.time() + 45
        DB.execute("UPDATE world_boss SET hp=0, respawn_at=?, dmg_board_json=? WHERE id=1",
                   (respawn_at, json.dumps(board, ensure_ascii=False)))
        DB.commit()
        ranked = sorted(board.values(), key=lambda x: x["dmg"], reverse=True)
        for idx, e in enumerate(ranked):
            jade_rw = 250 if idx == 0 else (160 if idx < 3 else 90)
            core_rw = 35 if idx == 0 else (20 if idx < 3 else 12)
            pill_rw = 4 if idx == 0 else 2
            send_mail(e["userId"], "Thiên Đạo Chiến Báo", f"Hạ Gục {row['name']} Lv.{row['lv']} (Hạng #{idx+1})",
                      f"Chúc mừng Đạo Hữu gây {e['dmg']:,} sát thương lên Boss Thế Giới! Nhận thưởng xếp hạng #{idx+1}.",
                      {"jade": jade_rw, "core": core_rw, "pill": pill_rw})
        await post_system_chat(f"🔥 {user['username']} ({user['sect_name']}) vừa tung đòn kết liễu Boss Thế Giới「{row['name']} Lv.{row['lv']}」! Toàn bộ đạo hữu tham chiến đã nhận thưởng qua Hộp Thư!")
    else:
        DB.execute("UPDATE world_boss SET hp=?, dmg_board_json=? WHERE id=1", (new_hp, json.dumps(board, ensure_ascii=False)))
        DB.commit()

    payload = get_wb_payload()
    await ws_broadcast({"type": "wb_update", "boss": payload, "lastHit": {"by": user["username"], "dmg": dmg}})
    return web.json_response({"ok": True, "killed": killed, "boss": payload})

# ==================== FRIENDS & MAIL ====================
async def api_friends_get(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    today = time.strftime("%Y-%m-%d")
    accepted = DB.execute("""
        SELECT u.id, u.username, u.sect_name, s.power, s.realm_idx, f.last_gift_day
        FROM friends f
        JOIN users u ON u.id = f.friend_id
        JOIN saves s ON s.user_id = u.id
        WHERE f.user_id = ? AND f.status = 'accepted'
    """, (user["id"],)).fetchall()
    pending = DB.execute("""
        SELECT u.id, u.username, u.sect_name, s.power, s.realm_idx
        FROM friends f
        JOIN users u ON u.id = f.user_id
        JOIN saves s ON s.user_id = u.id
        WHERE f.friend_id = ? AND f.status = 'pending'
    """, (user["id"],)).fetchall()
    return web.json_response({
        "ok": True,
        "friends": [{
            "id": r["id"], "username": r["username"], "sectName": r["sect_name"],
            "power": r["power"], "realmName": REALM_NAMES[min(9, max(0, r["realm_idx"] or 0))],
            "online": r["id"] in ONLINE_SOCKETS, "giftedToday": r["last_gift_day"] == today
        } for r in accepted],
        "requests": [{
            "id": r["id"], "username": r["username"], "sectName": r["sect_name"],
            "power": r["power"], "realmName": REALM_NAMES[min(9, max(0, r["realm_idx"] or 0))]
        } for r in pending]
    })

async def api_friends_add(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    data = await request.json()
    uname = str(data.get("username", "")).strip().lower()
    target = DB.execute("SELECT id, username, is_bot FROM users WHERE username=?", (uname,)).fetchone()
    if not target:
        return web.json_response({"ok": False, "error": "Không tìm thấy Đạo Hữu này!"}, status=404)
    if target["id"] == user["id"]:
        return web.json_response({"ok": False, "error": "Không thể tự kết bạn với chính mình!"}, status=400)
    now = time.time()
    # Auto-accept if bot or if target already sent a request (preserve last_gift_day!)
    if target["is_bot"] or DB.execute("SELECT 1 FROM friends WHERE user_id=? AND friend_id=?", (target["id"], user["id"])).fetchone():
        DB.execute("""
            INSERT INTO friends (user_id, friend_id, status, created_at) VALUES (?, ?, 'accepted', ?)
            ON CONFLICT(user_id, friend_id) DO UPDATE SET status='accepted'
        """, (user["id"], target["id"], now))
        DB.execute("""
            INSERT INTO friends (user_id, friend_id, status, created_at) VALUES (?, ?, 'accepted', ?)
            ON CONFLICT(user_id, friend_id) DO UPDATE SET status='accepted'
        """, (target["id"], user["id"], now))
        DB.commit()
        return web.json_response({"ok": True, "autoAccepted": True, "msg": f"Đã kết giao Đạo Hữu với {target['username']}!"})
    DB.execute("INSERT OR IGNORE INTO friends (user_id, friend_id, status, created_at) VALUES (?, ?, 'pending', ?)", (user["id"], target["id"], now))
    DB.commit()
    await ws_send(target["id"], {"type": "toast", "msg": f"💌 Đạo Hữu {user['username']} vừa gửi lời mời kết giao!"})
    return web.json_response({"ok": True, "autoAccepted": False, "msg": f"Đã gửi lời mời kết giao tới {target['username']}!"})

async def api_friends_accept(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    fid = safe_int((await request.json()).get("friendId"), 0)
    pending = DB.execute("SELECT 1 FROM friends WHERE user_id=? AND friend_id=? AND status='pending'", (fid, user["id"])).fetchone()
    if not pending:
        return web.json_response({"ok": False, "error": "Không có lời mời kết bạn hợp lệ!"}, status=404)
    now = time.time()
    DB.execute("UPDATE friends SET status='accepted' WHERE user_id=? AND friend_id=?", (fid, user["id"]))
    DB.execute("""
        INSERT INTO friends (user_id, friend_id, status, created_at) VALUES (?, ?, 'accepted', ?)
        ON CONFLICT(user_id, friend_id) DO UPDATE SET status='accepted'
    """, (user["id"], fid, now))
    DB.commit()
    return web.json_response({"ok": True})

async def api_friends_gift(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    fid = int((await request.json()).get("friendId") or 0)
    today = time.strftime("%Y-%m-%d")
    row = DB.execute("SELECT last_gift_day FROM friends WHERE user_id=? AND friend_id=? AND status='accepted'", (user["id"], fid)).fetchone()
    if not row:
        return web.json_response({"ok": False, "error": "Chưa kết giao Đạo Hữu này!"}, status=400)
    if row["last_gift_day"] == today:
        return web.json_response({"ok": False, "error": "Hôm nay bạn đã tặng quà cho Đạo Hữu này rồi!"}, status=400)
    DB.execute("UPDATE friends SET last_gift_day=? WHERE user_id=? AND friend_id=?", (today, user["id"], fid))
    DB.commit()
    send_mail(fid, user["username"], "Quà Tặng Đạo Hữu", f"{user['username']} ({user['sect_name']}) gửi tặng bạn 20 Tiên Ngọc kết tình đồng đạo!", {"jade": 20})
    await ws_send(fid, {"type": "toast", "msg": f"🎁 Đạo Hữu {user['username']} vừa gửi tặng bạn 20 Tiên Ngọc trong Hộp Thư!"})
    return web.json_response({"ok": True, "senderBonus": {"jade": 10}})

async def api_mail_get(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    rows = DB.execute("SELECT * FROM mails WHERE to_user_id=? ORDER BY id DESC LIMIT 40", (user["id"],)).fetchall()
    out = []
    for r in rows:
        out.append({
            "id": r["id"], "fromName": r["from_name"], "title": r["title"], "body": r["body"],
            "attachments": json.loads(r["attachments_json"] or "{}"),
            "claimed": bool(r["claimed"]), "createdAt": r["created_at"]
        })
    return web.json_response({"ok": True, "mails": out})

async def api_mail_claim(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    data = await request.json()
    mid = data.get("mailId")
    if mid == "all":
        rows = DB.execute("SELECT id, attachments_json FROM mails WHERE to_user_id=? AND claimed=0", (user["id"],)).fetchall()
    else:
        mid_int = safe_int(mid, -1)
        if mid_int < 0:
            return web.json_response({"ok": False, "error": "Invalid mailId"}, status=400)
        rows = DB.execute("SELECT id, attachments_json FROM mails WHERE to_user_id=? AND id=? AND claimed=0", (user["id"], mid_int)).fetchall()
    total = {}
    for r in rows:
        att = json.loads(r["attachments_json"] or "{}")
        for k, v in att.items():
            total[k] = total.get(k, 0) + int(v)
        DB.execute("UPDATE mails SET claimed=1, read=1 WHERE id=?", (r["id"],))
    DB.commit()
    return web.json_response({"ok": True, "claimedCount": len(rows), "rewards": total})

# ==================== PLAYER AUCTION HOUSE (TIÊN THỊ ĐẤU GIÁ) ====================
async def api_market_get(request: web.Request):
    rows = DB.execute("SELECT * FROM market_listings WHERE status='open' ORDER BY id DESC LIMIT 60").fetchall()
    return web.json_response({"ok": True, "listings": [dict(r) for r in rows]})

async def api_market_list(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    d = await request.json()
    itype = str(d.get("itemType", ""))
    qty = max(1, min(999, int(d.get("qty") or 1)))
    price = max(5, min(99999, int(d.get("priceJade") or 20)))
    allowed = ("herb", "core", "pill", "scroll", "essence", "gem_kim", "gem_moc", "gem_thuy", "gem_hoa", "gem_tho")
    if itype not in allowed:
        return web.json_response({"ok": False, "error": "Loại vật phẩm không hợp lệ!"}, status=400)
    DB.execute(
        "INSERT INTO market_listings (seller_id, seller_name, item_type, qty, price_jade, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', ?)",
        (user["id"], f"{user['username']} ({user['sect_name']})", itype, qty, price, time.time())
    )
    DB.commit()
    return web.json_response({"ok": True})

async def api_market_buy(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    lid = int((await request.json()).get("listingId") or 0)
    row = DB.execute("SELECT * FROM market_listings WHERE id=? AND status='open'", (lid,)).fetchone()
    if not row:
        return web.json_response({"ok": False, "error": "Vật phẩm đã có đạo hữu khác mua mất!"}, status=404)
    if row["seller_id"] == user["id"]:
        return web.json_response({"ok": False, "error": "Không thể tự mua vật phẩm của chính mình!"}, status=400)
    DB.execute("UPDATE market_listings SET status='sold' WHERE id=?", (lid,))
    DB.commit()
    payout = max(1, int(row["price_jade"] * 0.95))
    send_mail(row["seller_id"], "Tiên Thị Đấu Giá", "Giao Dịch Thành Công",
              f"Đạo Hữu {user['username']} đã mua {row['qty']} {row['item_type']} với giá {row['price_jade']} Tiên Ngọc (thực nhận {payout} Ngọc sau 5% phí sàn).",
              {"jade": payout})
    await ws_send(row["seller_id"], {"type": "toast", "msg": f"💰 Vật phẩm trên Tiên Thị đã bán được +{payout} Tiên Ngọc (nhận trong Hộp Thư)!"})
    return web.json_response({"ok": True, "itemType": row["item_type"], "qty": row["qty"], "priceJade": row["price_jade"]})

async def api_market_cancel(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    lid = int((await request.json()).get("listingId") or 0)
    row = DB.execute("SELECT * FROM market_listings WHERE id=? AND seller_id=? AND status='open'", (lid, user["id"])).fetchone()
    if not row:
        return web.json_response({"ok": False, "error": "Không thể thu hồi đơn hàng này!"}, status=404)
    DB.execute("UPDATE market_listings SET status='cancelled' WHERE id=?", (lid,))
    DB.commit()
    return web.json_response({"ok": True, "itemType": row["item_type"], "qty": row["qty"]})

# ==================== MULTIPLAYER GUILDS (TIÊN GIỚI MINH TRỰC TUYẾN) ====================
async def api_guilds_get(request: web.Request):
    user = auth_user(request)
    all_g = DB.execute("""
        SELECT g.*, (SELECT COUNT(*) FROM guild_members gm WHERE gm.guild_id=g.id) as member_count,
               u.username as leader_name
        FROM guilds g LEFT JOIN users u ON u.id = g.leader_id
        ORDER BY g.week_score DESC LIMIT 30
    """).fetchall()
    my_guild = None
    if user:
        gm = DB.execute("SELECT guild_id, role FROM guild_members WHERE user_id=?", (user["id"],)).fetchone()
        if gm:
            g = DB.execute("SELECT * FROM guilds WHERE id=?", (gm["guild_id"],)).fetchone()
            if g:
                members = DB.execute("""
                    SELECT u.id, u.username, u.sect_name, gm.role, gm.merit_contrib,
                           s.power, s.realm_idx, s.snapshot_json
                    FROM guild_members gm
                    JOIN users u ON u.id = gm.user_id
                    JOIN saves s ON s.user_id = u.id
                    WHERE gm.guild_id = ?
                    ORDER BY s.power DESC
                """, (g["id"],)).fetchall()
                my_guild = dict(g)
                my_guild["myRole"] = gm["role"]
                my_guild["bld"] = json.loads(g["bld_json"] or '{"hall":1,"yard":1,"store":1}')
                my_guild["members"] = [{
                    "id": m["id"], "username": m["username"], "sectName": m["sect_name"],
                    "role": m["role"], "merit": m["merit_contrib"], "power": m["power"],
                    "realmName": REALM_NAMES[min(9, max(0, m["realm_idx"] or 0))],
                    "online": m["id"] in ONLINE_SOCKETS,
                    "topDisciple": (json.loads(m["snapshot_json"] or "{}").get("deployed") or ["unhak"])[0]
                } for m in members]
    return web.json_response({"ok": True, "guilds": [dict(x) for x in all_g], "myGuild": my_guild})

async def api_guilds_create(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    d = await request.json()
    name = str(d.get("name", "")).strip()[:26]
    tag = str(d.get("tag", "")).strip().upper()[:5] or "TIEN"
    notice = str(d.get("notice", "")).strip()[:120] or "Cùng nhau tu tiên tranh bá!"
    if len(name) < 3:
        return web.json_response({"ok": False, "error": "Tên Liên Minh tối thiểu 3 ký tự!"}, status=400)
    if DB.execute("SELECT 1 FROM guild_members WHERE user_id=?", (user["id"],)).fetchone():
        return web.json_response({"ok": False, "error": "Bạn cần rời Liên Minh hiện tại trước!"}, status=400)
    if DB.execute("SELECT 1 FROM guilds WHERE name=?", (name,)).fetchone():
        return web.json_response({"ok": False, "error": "Tên Liên Minh đã tồn tại!"}, status=409)
    now = time.time()
    cur = DB.cursor()
    cur.execute("INSERT INTO guilds (name, tag, leader_id, notice, created_at) VALUES (?, ?, ?, ?, ?)", (name, tag, user["id"], notice, now))
    gid = cur.lastrowid
    cur.execute("INSERT INTO guild_members (user_id, guild_id, role, merit_contrib, joined_at) VALUES (?, ?, 'leader', 0, ?)", (user["id"], gid, now))
    DB.commit()
    await post_system_chat(f"🏛 Tông Chủ {user['username']} vừa sáng lập Tiên Giới Minh「[{tag}] {name}」!")
    return web.json_response({"ok": True, "guildId": gid})

async def api_guilds_join(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    gid = int((await request.json()).get("guildId") or 0)
    g = DB.execute("SELECT * FROM guilds WHERE id=?", (gid,)).fetchone()
    if not g:
        return web.json_response({"ok": False, "error": "Không tìm thấy Liên Minh!"}, status=404)
    cnt = DB.execute("SELECT COUNT(*) FROM guild_members WHERE guild_id=?", (gid,)).fetchone()[0]
    if cnt >= 30:
        return web.json_response({"ok": False, "error": "Liên Minh đã đủ 30/30 thành viên!"}, status=400)
    DB.execute("DELETE FROM guild_members WHERE user_id=?", (user["id"],))
    DB.execute("INSERT INTO guild_members (user_id, guild_id, role, merit_contrib, joined_at) VALUES (?, ?, 'member', 0, ?)", (user["id"], gid, time.time()))
    DB.commit()
    await post_system_chat(f"🎉 Đạo Hữu {user['username']} ({user['sect_name']}) vừa gia nhập Liên Minh!", channel=f"guild:{gid}", guild_id=gid)
    return web.json_response({"ok": True})

async def api_guilds_leave(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    DB.execute("DELETE FROM guild_members WHERE user_id=?", (user["id"],))
    DB.commit()
    return web.json_response({"ok": True})

async def api_guilds_action(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    gm = DB.execute("SELECT guild_id, role FROM guild_members WHERE user_id=?", (user["id"],)).fetchone()
    if not gm:
        return web.json_response({"ok": False, "error": "Bạn chưa gia nhập Liên Minh!"}, status=400)
    gid = gm["guild_id"]
    g = DB.execute("SELECT * FROM guilds WHERE id=?", (gid,)).fetchone()
    d = await request.json()
    kind = d.get("kind")

    if kind == "donate":
        DB.execute("UPDATE guilds SET exp=exp+25, week_score=week_score+350 WHERE id=?", (gid,))
        DB.execute("UPDATE guild_members SET merit_contrib=merit_contrib+25 WHERE user_id=?", (user["id"],))
        DB.commit()
        await post_system_chat(f"💰 {user['username']} quyên góp xây dựng Minh Hội (+25 EXP, +350 Điểm Tuần)!", channel=f"guild:{gid}", guild_id=gid)
        return web.json_response({"ok": True, "merit": 25})
    elif kind == "cheer":
        DB.execute("UPDATE guilds SET week_score=week_score+250 WHERE id=?", (gid,))
        DB.commit()
        return web.json_response({"ok": True, "merit": 5})
    elif kind == "boss_hit":
        dmg = max(100, min(2000000, int(d.get("dmg") or 15000)))
        new_hp = max(0, g["boss_hp"] - dmg)
        score_add = max(400, int(dmg / 20))
        killed = False
        if new_hp == 0:
            killed = True
            nlv = g["boss_lv"] + 1
            nmax = int(180000 * (1 + (nlv - 1) * 0.55))
            DB.execute("UPDATE guilds SET boss_lv=?, boss_hp=?, boss_max_hp=?, exp=exp+120, week_score=week_score+? WHERE id=?",
                       (nlv, nmax, nmax, score_add + 1500, gid))
            mids = [r["user_id"] for r in DB.execute("SELECT user_id FROM guild_members WHERE guild_id=?", (gid,)).fetchall()]
            for mid in mids:
                send_mail(mid, g["name"], f"Hạ Gục Ma Đầu Minh Hội Lv.{g['boss_lv']}",
                          f"Đạo Hữu {user['username']} vừa kết liễu Ma Đầu Minh Hội! Toàn thể thành viên nhận thưởng.",
                          {"jade": 80, "pill": 2})
            await post_system_chat(f"🏆 {user['username']} đã kết liễu Ma Đầu Minh Hội Lv.{g['boss_lv']}! Toàn Minh nhận +80 Tiên Ngọc trong Hộp Thư!", channel=f"guild:{gid}", guild_id=gid)
        else:
            DB.execute("UPDATE guilds SET boss_hp=?, exp=exp+40, week_score=week_score+? WHERE id=?", (new_hp, score_add, gid))
        DB.commit()
        return web.json_response({"ok": True, "killed": killed, "scoreAdd": score_add})
    elif kind == "upgrade_bld":
        bld_id = str(d.get("bldId", "hall"))
        bld = json.loads(g["bld_json"] or '{"hall":1,"yard":1,"store":1}')
        exps = [0, 300, 900, 2000, 4000, 7000]
        lv = bld.get(bld_id, 1)
        if lv >= len(exps) or g["exp"] < exps[lv]:
            return web.json_response({"ok": False, "error": "Chưa đủ EXP Minh Hội hoặc đã tối đa!"}, status=400)
        bld[bld_id] = lv + 1
        DB.execute("UPDATE guilds SET exp=exp-?, bld_json=? WHERE id=?", (exps[lv], json.dumps(bld), gid))
        DB.commit()
        await post_system_chat(f"🏛 {user['username']} nâng công trình Minh Hội「{bld_id}」lên Lv.{lv+1}!", channel=f"guild:{gid}", guild_id=gid)
        return web.json_response({"ok": True, "bld": bld})

    return web.json_response({"ok": False, "error": "Unknown action"}, status=400)

# ==================== PLAYER INSPECT, PLAZA, CO-OP DUNGEON & GUILD WAR APIs ====================
async def api_player_inspect(request: web.Request):
    try:
        tid = int(request.match_info.get("id", "0"))
    except Exception:
        return web.json_response({"ok": False, "error": "ID không hợp lệ"}, status=400)
    row = DB.execute("""
        SELECT u.id, u.username, u.sect_name, u.title, u.is_bot, u.last_seen,
               s.power, s.realm_idx, s.max_stage, s.tower_floor, s.arena_score, s.fame, s.rep, s.lap, s.snapshot_json
        FROM users u LEFT JOIN saves s ON s.user_id = u.id
        WHERE u.id = ?
    """, (tid,)).fetchone()
    if not row:
        return web.json_response({"ok": False, "error": "Không tìm thấy Đạo Hữu này!"}, status=404)
    d = dict(row)
    snap = json.loads(d.pop("snapshot_json") or "{}")
    vip_lv, cos = get_user_vip_and_cosmetics(tid, snap)
    gm = DB.execute("""
        SELECT g.id, g.name, g.tag, gm.role FROM guild_members gm
        JOIN guilds g ON g.id = gm.guild_id WHERE gm.user_id = ?
    """, (tid,)).fetchone()
    # Provide default gearDetail fallback for seeded rivals / legacy saves without gearDetail
    if not snap.get("gearDetail"):
        ridx = int(d.get("realm_idx") or 0)
        wp_id = snap.get("weapon") or "wp_iron_jian"
        tier_suffix = "immortal" if ridx >= 6 else ("thunder" if ridx >= 4 else ("frost" if ridx >= 2 else "iron"))
        base_lv = max(1, min(20, 2 + ridx * 3))
        snap["gearDetail"] = {
            "weapon": {"id": wp_id, "lv": base_lv, "subs": [], "sockets": [{"id": "kim", "lv": max(1, min(3, 1 + ridx // 2))}]},
            "helm":   {"id": f"hm_{tier_suffix}", "lv": max(1, base_lv - 1), "subs": [], "sockets": []},
            "armor":  {"id": f"ar_{tier_suffix}", "lv": base_lv, "subs": [], "sockets": [{"id": "tho", "lv": max(1, min(3, 1 + ridx // 3))}]},
            "jade":   {"id": f"jd_{tier_suffix}", "lv": max(1, base_lv - 1), "subs": [], "sockets": []},
            "ring":   {"id": f"rg_{tier_suffix}", "lv": max(1, base_lv - 2), "subs": [], "sockets": []},
            "boots":  {"id": f"bt_{tier_suffix}", "lv": max(1, base_lv - 2), "subs": [], "sockets": []},
        }
    ridx = int(d.get("realm_idx") or 0)
    return web.json_response({
        "ok": True,
        "player": {
            "id": d["id"], "username": d["username"], "sectName": d["sect_name"], "title": d["title"],
            "isBot": bool(d["is_bot"]), "online": tid in ONLINE_SOCKETS,
            "power": d["power"] or 100, "realmIdx": ridx,
            "realmName": REALM_NAMES[min(len(REALM_NAMES) - 1, max(0, ridx))],
            "maxStage": d["max_stage"] or 1, "towerFloor": d["tower_floor"] or 1,
            "arenaScore": d["arena_score"] or 1000, "fame": d["fame"] or 0, "lap": d["lap"] or 1,
            "vipLv": vip_lv, "cosmetics": cos,
            "guild": dict(gm) if gm else None,
            "snapshot": snap,
        }
    })

async def api_plaza_get(request: web.Request):
    return web.json_response({"ok": True, "players": build_plaza_list()})

async def api_coop_rooms(request: web.Request):
    return web.json_response({"ok": True, "rooms": build_coop_rooms_payload(), "tiers": COOP_TIERS})

async def api_guildwar_get(request: web.Request):
    user = auth_user(request)
    my_gid = None
    claimed_map = {}
    today = time.strftime("%Y-%m-%d")
    if user:
        gm = DB.execute("SELECT guild_id FROM guild_members WHERE user_id=?", (user["id"],)).fetchone()
        if gm:
            my_gid = gm["guild_id"]
        for r in DB.execute("SELECT vein_id FROM vein_claims WHERE user_id=? AND day_key=?", (user["id"], today)).fetchall():
            claimed_map[r["vein_id"]] = True
    rows = DB.execute("""
        SELECT v.*, g.name AS guild_name, g.tag AS guild_tag
        FROM veins v LEFT JOIN guilds g ON g.id = v.guild_id
        ORDER BY v.tier ASC
    """).fetchall()
    return web.json_response({"ok": True, "veins": [dict(r) for r in rows], "myGuildId": my_gid, "claimedToday": claimed_map})

async def api_guildwar_attack(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Cần đăng nhập để tham gia Bang Chiến Linh Mạch!"}, status=401)
    gm = DB.execute("SELECT gm.guild_id, g.name, g.tag FROM guild_members gm JOIN guilds g ON g.id=gm.guild_id WHERE gm.user_id=?", (user["id"],)).fetchone()
    if not gm:
        return web.json_response({"ok": False, "error": "Bạn cần gia nhập hoặc lập Liên Minh trước!"}, status=400)
    data = await request.json()
    vid = int(data.get("veinId") or 0)
    vein = DB.execute("SELECT * FROM veins WHERE id=?", (vid,)).fetchone()
    if not vein:
        return web.json_response({"ok": False, "error": "Linh Mạch không tồn tại!"}, status=404)
    if vein["guild_id"] == gm["guild_id"]:
        return web.json_response({"ok": False, "error": "Liên Minh của bạn đang trấn giữ Linh Mạch này!"}, status=400)

    vip_lv, _ = get_user_vip_and_cosmetics(user["id"])
    pwr = max(500, int(user.get("power") or 500))
    dmg = max(14000, int(pwr * 2.4 * (1 + vip_lv * 0.08)))
    new_hp = max(0, int(vein["hp"]) - dmg)
    captured = False
    now = time.time()
    if new_hp <= 0:
        captured = True
        DB.execute("UPDATE veins SET guild_id=?, hp=?, captured_at=? WHERE id=?", (gm["guild_id"], vein["max_hp"], now, vid))
        DB.execute("UPDATE guild_members SET merit_contrib = merit_contrib + 60 WHERE user_id=?", (user["id"],))
        DB.execute("UPDATE guilds SET week_score = week_score + 450 WHERE id=?", (gm["guild_id"],))
        DB.commit()
        await post_system_chat(f"⛰ Bang Chiến Linh Mạch: Liên Minh [{gm['tag']}] {gm['name']} (tiên phong: {user['username']}) đã đoạt thành công「{vein['name']}」!")
    else:
        DB.execute("UPDATE veins SET hp=? WHERE id=?", (new_hp, vid))
        DB.execute("UPDATE guild_members SET merit_contrib = merit_contrib + 15 WHERE user_id=?", (user["id"],))
        DB.execute("UPDATE guilds SET week_score = week_score + 80 WHERE id=?", (gm["guild_id"],))
        DB.commit()

    return web.json_response({"ok": True, "dmg": dmg, "captured": captured, "hp": vein["max_hp"] if captured else new_hp, "maxHp": vein["max_hp"]})

async def api_guildwar_claim(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    gm = DB.execute("SELECT guild_id FROM guild_members WHERE user_id=?", (user["id"],)).fetchone()
    if not gm:
        return web.json_response({"ok": False, "error": "Bạn chưa gia nhập Liên Minh!"}, status=400)
    today = time.strftime("%Y-%m-%d")
    held = DB.execute("SELECT * FROM veins WHERE guild_id=?", (gm["guild_id"],)).fetchall()
    total_jade = 0
    total_ess = 0
    names = []
    for v in held:
        exists = DB.execute("SELECT 1 FROM vein_claims WHERE user_id=? AND vein_id=? AND day_key=?", (user["id"], v["id"], today)).fetchone()
        if not exists:
            DB.execute("INSERT INTO vein_claims (user_id, vein_id, day_key) VALUES (?, ?, ?)", (user["id"], v["id"], today))
            total_jade += int(v["reward_jade"] or 0)
            total_ess += int(v["reward_essence"] or 0)
            names.append(v["name"])
    if not names:
        return web.json_response({"ok": False, "error": "Hôm nay bạn đã nhận hết bổng lộc Linh Mạch của Liên Minh hoặc Minh chưa chiếm mạch nào!"}, status=400)
    DB.commit()
    return web.json_response({"ok": True, "jade": total_jade, "essence": total_ess, "veinNames": names})

async def api_chat_get(request: web.Request):
    channel = request.query.get("channel", "world")
    if channel == "guild":
        user = auth_user(request)
        if not user:
            return web.json_response({"ok": True, "messages": []})
        gm = DB.execute("SELECT guild_id FROM guild_members WHERE user_id=?", (user["id"],)).fetchone()
        if not gm:
            return web.json_response({"ok": True, "messages": []})
        channel = f"guild:{gm['guild_id']}"
    rows = DB.execute("SELECT * FROM chat_messages WHERE channel=? ORDER BY id DESC LIMIT 60", (channel,)).fetchall()
    return web.json_response({"ok": True, "messages": [dict(r) for r in reversed(rows)]})

# ==================== WEBSOCKET HANDLER (REAL-TIME CHAT + PRESENCE + 1v1 PK) ====================
async def ws_handler(request: web.Request):
    token = request.query.get("token", "")
    user = get_user_by_token(token)
    ws = web.WebSocketResponse(heartbeat=25)
    await ws.prepare(request)

    if not user:
        await ws.send_json({"type": "error", "msg": "Invalid session token"})
        await ws.close()
        return ws

    uid = user["id"]
    ONLINE_SOCKETS[uid] = {"ws": ws, "user": user, "status": "Đang Tu Luyện"}
    await ws.send_json({
        "type": "welcome", "userId": uid, "boss": get_wb_payload(),
        "onlineCount": len(ONLINE_SOCKETS), "plaza": build_plaza_list(), "coopRooms": build_coop_rooms_payload()
    })
    await broadcast_presence()
    await ws_broadcast({"type": "plaza_sync", "players": build_plaza_list()})

    try:
        async for msg in ws:
            if msg.type != WSMsgType.TEXT:
                continue
            try:
                data = json.loads(msg.data)
            except Exception:
                continue
            mtype = data.get("type")

            if mtype == "chat_send":
                text = str(data.get("text", "")).strip()[:220]
                if not text:
                    continue
                ch_req = data.get("channel", "world")
                gid = None
                channel = "world"
                if ch_req == "guild":
                    gm = DB.execute("SELECT guild_id FROM guild_members WHERE user_id=?", (uid,)).fetchone()
                    if not gm:
                        await ws.send_json({"type": "toast", "msg": "Bạn chưa gia nhập Liên Minh để chat kênh Minh!"})
                        continue
                    gid = gm["guild_id"]
                    channel = f"guild:{gid}"
                fresh = ONLINE_SOCKETS[uid]["user"]
                rnm = REALM_NAMES[min(9, max(0, fresh.get("realm_idx") or 0))]
                vip_lv, cos = get_user_vip_and_cosmetics(uid, json.loads(fresh.get("snapshot_json") or "{}"))
                wing_tag = COSMETIC_WING_LABELS.get(cos.get("wing") or "", "")
                now = time.time()
                DB.execute(
                    "INSERT INTO chat_messages (channel, user_id, sender_name, sect_name, realm_name, text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (channel, uid, fresh["username"], fresh["sect_name"], rnm, text, now)
                )
                DB.commit()
                await ws_broadcast({
                    "type": "chat",
                    "msg": {
                        "channel": "guild" if gid else "world",
                        "user_id": uid, "sender_name": fresh["username"],
                        "sect_name": fresh["sect_name"], "realm_name": rnm,
                        "vip_lv": vip_lv, "wing_tag": wing_tag,
                        "text": text, "created_at": now
                    }
                }, guild_id=gid)

            elif mtype == "status":
                ONLINE_SOCKETS[uid]["status"] = str(data.get("status", "Đang Tu Luyện"))[:24]
                await broadcast_presence()

            elif mtype == "plaza_move":
                px = max(-14.0, min(14.0, safe_float(data.get("x"), 0.0)))
                pz = max(-14.0, min(14.0, safe_float(data.get("z"), 0.0)))
                pf = safe_float(data.get("facing"), 0.0)
                PLAZA_POS[uid] = {"x": px, "z": pz, "facing": pf, "updated": time.time()}
                await ws_broadcast({"type": "plaza_sync", "players": build_plaza_list()})

            elif mtype == "coop_create":
                tier = max(1, min(3, safe_int(data.get("tier"), 1)))
                tdef = COOP_TIERS[tier]
                me = ONLINE_SOCKETS[uid]["user"]
                # Leave any previous waiting room owned/joined
                for r_k, r_v in list(COOP_ROOMS.items()):
                    if uid in r_v["members"] and r_v["status"] == "waiting":
                        r_v["members"] = [x for x in r_v["members"] if x != uid]
                        if not r_v["members"]:
                            COOP_ROOMS.pop(r_k, None)
                rid = f"coop_{secrets.token_hex(4)}"
                rname = str(data.get("name") or f"Tổ Đội của {me['username']}").strip()[:30]
                COOP_ROOMS[rid] = {
                    "id": rid, "name": rname, "tier": tier, "host_id": uid, "members": [uid],
                    "status": "waiting", "ended": False,
                    "boss": {"name": tdef["bossName"], "lv": tdef["lv"], "hp": tdef["hp"], "maxHp": tdef["hp"], "atk": tdef["atk"]},
                    "dmg": {uid: 0}, "started_at": time.time()
                }
                rooms_payload = build_coop_rooms_payload()
                cur_rm = next((x for x in rooms_payload if x["id"] == rid), None)
                await ws.send_json({"type": "coop_room_update", "room": cur_rm})
                await ws_broadcast({"type": "coop_rooms", "rooms": rooms_payload})

            elif mtype == "coop_join":
                rid = str(data.get("roomId") or "")
                rm = COOP_ROOMS.get(rid)
                if not rm or rm["status"] != "waiting":
                    await ws.send_json({"type": "toast", "msg": "Phòng Co-op không tồn tại hoặc đã xuất phát!"})
                    continue
                if len(rm["members"]) >= 4 and uid not in rm["members"]:
                    await ws.send_json({"type": "toast", "msg": "Phòng đã đủ 4/4 người!"})
                    continue
                if uid not in rm["members"]:
                    rm["members"].append(uid)
                    rm["dmg"][uid] = 0
                rooms_payload = build_coop_rooms_payload()
                cur_rm = next((x for x in rooms_payload if x["id"] == rid), None)
                for mid in rm["members"]:
                    await ws_send(mid, {"type": "coop_room_update", "room": cur_rm})
                await ws_broadcast({"type": "coop_rooms", "rooms": rooms_payload})

            elif mtype == "coop_leave":
                rid = str(data.get("roomId") or "")
                rm = COOP_ROOMS.get(rid)
                if rm and uid in rm["members"]:
                    rm["members"] = [x for x in rm["members"] if x != uid]
                    if not rm["members"]:
                        COOP_ROOMS.pop(rid, None)
                    else:
                        if rm["host_id"] == uid:
                            rm["host_id"] = rm["members"][0]
                        rooms_payload = build_coop_rooms_payload()
                        cur_rm = next((x for x in rooms_payload if x["id"] == rid), None)
                        for mid in rm["members"]:
                            await ws_send(mid, {"type": "coop_room_update", "room": cur_rm})
                await ws.send_json({"type": "coop_room_update", "room": None})
                await ws_broadcast({"type": "coop_rooms", "rooms": build_coop_rooms_payload()})

            elif mtype == "coop_start":
                rid = str(data.get("roomId") or "")
                rm = COOP_ROOMS.get(rid)
                if not rm or rm["host_id"] != uid or rm["status"] != "waiting":
                    continue
                rm["status"] = "fighting"
                rm["started_at"] = time.time()
                peer_details = []
                for mid in rm["members"]:
                    mu = ONLINE_SOCKETS.get(mid, {}).get("user")
                    if not mu:
                        continue
                    ONLINE_SOCKETS[mid]["status"] = "🌀 Phó Bản Tổ Đội"
                    snap = json.loads(mu.get("snapshot_json") or "{}")
                    vip_lv, cos = get_user_vip_and_cosmetics(mid, snap)
                    peer_details.append({
                        "id": mid, "username": mu["username"], "sectName": mu["sect_name"],
                        "power": mu.get("power") or 300,
                        "atk": max(80, int(snap.get("atk") or 180)),
                        "maxHp": max(1000, int(snap.get("maxHp") or 1800)),
                        "weapon": snap.get("weapon") or "wp_iron_jian",
                        "cosmetics": cos, "vipLv": vip_lv,
                    })
                rooms_payload = build_coop_rooms_payload()
                cur_rm = next((x for x in rooms_payload if x["id"] == rid), None)
                for mid in rm["members"]:
                    await ws_send(mid, {"type": "coop_start", "room": cur_rm, "boss": rm["boss"], "peers": peer_details})
                await ws_broadcast({"type": "coop_rooms", "rooms": rooms_payload})
                await broadcast_presence()

            elif mtype == "coop_state":
                rid = str(data.get("roomId") or "")
                rm = COOP_ROOMS.get(rid)
                if not rm or rm["status"] != "fighting" or rm.get("ended") or uid not in rm["members"]:
                    continue
                for mid in rm["members"]:
                    if mid != uid:
                        await ws_send(mid, {
                            "type": "coop_peer_state", "roomId": rid, "userId": uid,
                            "x": data.get("x", 0), "z": data.get("z", 0), "facing": data.get("facing", 0),
                            "animClip": data.get("animClip", ""), "moving": bool(data.get("moving"))
                        })

            elif mtype == "coop_hit":
                rid = str(data.get("roomId") or "")
                rm = COOP_ROOMS.get(rid)
                if not rm or rm["status"] != "fighting" or rm.get("ended") or uid not in rm["members"]:
                    continue
                dmg = max(0, min(rm["boss"]["maxHp"], safe_int(data.get("dmg"), 0)))
                rm["boss"]["hp"] = max(0, rm["boss"]["hp"] - dmg)
                rm["dmg"][uid] = rm["dmg"].get(uid, 0) + dmg
                for mid in rm["members"]:
                    await ws_send(mid, {
                        "type": "coop_boss_hp", "roomId": rid, "fromId": uid,
                        "dmg": dmg, "hp": rm["boss"]["hp"], "maxHp": rm["boss"]["maxHp"], "dmgMap": rm["dmg"]
                    })
                if rm["boss"]["hp"] <= 0:
                    rm["ended"] = True
                    rm["status"] = "ended"
                    tdef = COOP_TIERS.get(rm["tier"], COOP_TIERS[1])
                    gem_pool = ["kim", "moc", "thuy", "hoa", "tho"]
                    m_names = []
                    for mid in rm["members"]:
                        if mid in ONLINE_SOCKETS:
                            ONLINE_SOCKETS[mid]["status"] = "Đang Tu Luyện"
                            m_names.append(ONLINE_SOCKETS[mid]["user"]["username"])
                        gem_id = secrets.choice(gem_pool)
                        await ws_send(mid, {
                            "type": "coop_end", "roomId": rid, "win": True,
                            "bossName": rm["boss"]["name"], "tier": rm["tier"],
                            "rewards": {
                                "jade": tdef["jade"], "essence": tdef["essence"],
                                "gemId": gem_id, "gemLv": tdef["gemLv"], "gemQty": tdef["gemQty"]
                            },
                            "dmgMap": rm["dmg"]
                        })
                    await post_system_chat(f"🌀 Phó Bản Co-op: Tổ đội「{', '.join(m_names)}」đã hợp lực tru diệt {rm['boss']['name']} (+{tdef['jade']} Ngọc, Ngọc Bậc {tdef['gemLv']})!")
                    COOP_ROOMS.pop(rid, None)
                    await ws_broadcast({"type": "coop_rooms", "rooms": build_coop_rooms_payload()})
                    await broadcast_presence()

            elif mtype == "pk_invite":
                tid = safe_int(data.get("targetId"), 0)
                if tid == uid or tid not in ONLINE_SOCKETS:
                    await ws.send_json({"type": "toast", "msg": "Đạo Hữu này hiện không trực tuyến — hãy dùng Luận Kiếm Async!"})
                    continue
                inv_id = secrets.token_hex(6)
                PK_INVITES[inv_id] = {"id": inv_id, "from_id": uid, "to_id": tid, "created_at": time.time()}
                me = ONLINE_SOCKETS[uid]["user"]
                await ws_send(tid, {
                    "type": "pk_invite",
                    "inviteId": inv_id,
                    "from": {
                        "id": uid, "username": me["username"], "sectName": me["sect_name"],
                        "power": me.get("power") or 100, "arenaScore": me.get("arena_score") or 1000
                    }
                })
                await ws.send_json({"type": "toast", "msg": f"⚔ Đã gửi Chiến Thư PK 1v1 tới {ONLINE_SOCKETS[tid]['user']['username']}!"})

            elif mtype == "pk_decline":
                inv_key = str(data.get("inviteId") or "")
                inv = PK_INVITES.pop(inv_key, None) if inv_key else None
                if inv and inv.get("to_id") == uid:
                    await ws_send(inv["from_id"], {"type": "toast", "msg": f"❌ {ONLINE_SOCKETS[uid]['user']['username']} đã từ chối lời khiêu chiến 1v1."})

            elif mtype == "pk_accept":
                inv_key = str(data.get("inviteId") or "")
                inv = PK_INVITES.pop(inv_key, None) if inv_key else None
                if not inv or inv["to_id"] != uid or inv["from_id"] not in ONLINE_SOCKETS or (time.time() - inv.get("created_at", 0)) > 90:
                    await ws.send_json({"type": "toast", "msg": "Chiến thư đã hết hạn!"})
                    continue
                p1_id, p2_id = inv["from_id"], inv["to_id"]
                u1, u2 = ONLINE_SOCKETS[p1_id]["user"], ONLINE_SOCKETS[p2_id]["user"]
                s1 = json.loads(u1.get("snapshot_json") or "{}")
                s2 = json.loads(u2.get("snapshot_json") or "{}")
                hp1 = max(800, int(s1.get("maxHp") or (u1.get("power") or 300) * 1.6))
                hp2 = max(800, int(s2.get("maxHp") or (u2.get("power") or 300) * 1.6))
                rid = f"pk_{secrets.token_hex(5)}"
                room = {
                    "id": rid, "p1": p1_id, "p2": p2_id,
                    "hp": {p1_id: hp1, p2_id: hp2},
                    "maxHp": {p1_id: hp1, p2_id: hp2},
                    "started_at": time.time(), "ended": False
                }
                PK_ROOMS[rid] = room
                ONLINE_SOCKETS[p1_id]["status"] = "⚔ PK 1v1 Trực Tuyến"
                ONLINE_SOCKETS[p2_id]["status"] = "⚔ PK 1v1 Trực Tuyến"
                await broadcast_presence()
                p1_info = {"id": p1_id, "username": u1["username"], "sectName": u1["sect_name"], "maxHp": hp1, "atk": max(60, int(s1.get("atk") or 120)), "weapon": s1.get("weapon") or "wp_iron_jian", "power": u1.get("power") or 300}
                p2_info = {"id": p2_id, "username": u2["username"], "sectName": u2["sect_name"], "maxHp": hp2, "atk": max(60, int(s2.get("atk") or 120)), "weapon": s2.get("weapon") or "wp_iron_jian", "power": u2.get("power") or 300}
                await ws_send(p1_id, {"type": "pk_start", "roomId": rid, "side": 0, "me": p1_info, "opp": p2_info})
                await ws_send(p2_id, {"type": "pk_start", "roomId": rid, "side": 1, "me": p2_info, "opp": p1_info})

            elif mtype == "pk_state":
                room = PK_ROOMS.get(data.get("roomId"))
                if not room or room["ended"] or uid not in (room["p1"], room["p2"]):
                    continue
                opp_id = room["p2"] if room["p1"] == uid else room["p1"]
                await ws_send(opp_id, {
                    "type": "pk_opp_state", "roomId": room["id"],
                    "x": data.get("x", 0), "z": data.get("z", 0), "facing": data.get("facing", 0),
                    "animClip": data.get("animClip", ""), "moving": bool(data.get("moving")),
                    "hp": room["hp"][uid]
                })

            elif mtype == "pk_action":
                room = PK_ROOMS.get(data.get("roomId"))
                if not room or room["ended"] or uid not in (room["p1"], room["p2"]):
                    continue
                opp_id = room["p2"] if room["p1"] == uid else room["p1"]
                dmg = max(0, min(room["maxHp"][opp_id], safe_int(data.get("dmg"), 0)))
                room["hp"][opp_id] = max(0, room["hp"][opp_id] - dmg)
                payload = {
                    "type": "pk_hit", "roomId": room["id"], "fromId": uid, "targetId": opp_id,
                    "kind": data.get("kind", "basic"), "slotIdx": data.get("slotIdx", -1),
                    "dmg": dmg, "crit": bool(data.get("crit")),
                    "hpMap": {str(room["p1"]): room["hp"][room["p1"]], str(room["p2"]): room["hp"][room["p2"]]}
                }
                await ws_send(room["p1"], payload)
                await ws_send(room["p2"], payload)

                if room["hp"][opp_id] <= 0:
                    room["ended"] = True
                    winner_id, loser_id = uid, opp_id
                    w_u = ONLINE_SOCKETS.get(winner_id, {}).get("user", {"username": "?", "arena_score": 1000})
                    l_u = ONLINE_SOCKETS.get(loser_id, {}).get("user", {"username": "?", "arena_score": 1000})
                    w_score = (w_u.get("arena_score") or 1000) + 35
                    l_score = max(0, (l_u.get("arena_score") or 1000) - 18)
                    DB.execute("UPDATE saves SET arena_score=? WHERE user_id=?", (w_score, winner_id))
                    DB.execute("UPDATE saves SET arena_score=? WHERE user_id=?", (l_score, loser_id))
                    DB.execute(
                        "INSERT INTO pk_logs (challenger_id, challenger_name, defender_id, defender_name, mode, winner_id, score_delta, created_at) VALUES (?, ?, ?, ?, 'realtime', ?, 35, ?)",
                        (room["p1"], ONLINE_SOCKETS.get(room["p1"], {}).get("user", {}).get("username", "?"),
                         room["p2"], ONLINE_SOCKETS.get(room["p2"], {}).get("user", {}).get("username", "?"),
                         winner_id, time.time())
                    )
                    DB.commit()
                    if winner_id in ONLINE_SOCKETS:
                        ONLINE_SOCKETS[winner_id]["user"]["arena_score"] = w_score
                        ONLINE_SOCKETS[winner_id]["status"] = "Đang Tu Luyện"
                    if loser_id in ONLINE_SOCKETS:
                        ONLINE_SOCKETS[loser_id]["user"]["arena_score"] = l_score
                        ONLINE_SOCKETS[loser_id]["status"] = "Đang Tu Luyện"
                    await ws_send(winner_id, {"type": "pk_end", "roomId": room["id"], "win": True, "scoreDelta": 35, "honor": 35, "newScore": w_score})
                    await ws_send(loser_id, {"type": "pk_end", "roomId": room["id"], "win": False, "scoreDelta": -18, "honor": 10, "newScore": l_score})
                    await post_system_chat(f"⚔ Luận Kiếm 1v1 Trực Tuyến:「{w_u['username']}」đã đánh bại「{l_u['username']}」(+35 ELO)!")
                    await broadcast_presence()
                    PK_ROOMS.pop(room["id"], None)
    finally:
        if ONLINE_SOCKETS.get(uid, {}).get("ws") is ws:
            PLAZA_POS.pop(uid, None)
            for pk_k, pk_r in list(PK_ROOMS.items()):
                if not pk_r.get("ended") and uid in (pk_r["p1"], pk_r["p2"]):
                    pk_r["ended"] = True
                    opp_id = pk_r["p2"] if pk_r["p1"] == uid else pk_r["p1"]
                    await ws_send(opp_id, {"type": "pk_end", "roomId": pk_r["id"], "win": True, "scoreDelta": 15, "honor": 20, "newScore": 1015})
                    PK_ROOMS.pop(pk_k, None)
            for r_k, r_v in list(COOP_ROOMS.items()):
                if uid in r_v["members"]:
                    r_v["members"] = [x for x in r_v["members"] if x != uid]
                    if not r_v["members"]:
                        COOP_ROOMS.pop(r_k, None)
                    elif r_v["host_id"] == uid:
                        r_v["host_id"] = r_v["members"][0]
            ONLINE_SOCKETS.pop(uid, None)
            await broadcast_presence()
            await ws_broadcast({"type": "plaza_sync", "players": build_plaza_list()})
    return ws

# ==================== TOP-UP / PAYMENT GATEWAY / VIP / GIFTCODE APIs ====================
def ensure_billing(user_id: int):
    row = DB.execute("SELECT * FROM user_billing WHERE user_id=?", (user_id,)).fetchone()
    if not row:
        DB.execute("INSERT OR IGNORE INTO user_billing (user_id) VALUES (?)", (user_id,))
        DB.commit()
        row = DB.execute("SELECT * FROM user_billing WHERE user_id=?", (user_id,)).fetchone()
    d = dict(row)
    d["firstPacks"] = json.loads(d.get("first_packs_json") or "{}")
    d["vipClaimed"] = json.loads(d.get("vip_claimed_json") or "{}")
    today = time.strftime("%Y-%m-%d")
    now = time.time()
    d["passDaysLeft"] = max(0, int((d["pass_30_until"] - now) / 86400) + 1) if d["pass_30_until"] > now else 0
    d["canClaimDailyPass"] = (d["passDaysLeft"] > 0 and d["pass_30_last_claim"] != today)
    return d

def calc_vip_level(vip_exp: int) -> int:
    lv = 0
    for t in VIP_TIERS:
        if vip_exp >= t["exp"]:
            lv = t["lv"]
    return lv

async def fulfill_topup_order(order_code: str, attach_rewards_in_mail: bool = False, bank_txn_id: str = ""):
    if bank_txn_id:
        dup = DB.execute("SELECT order_code FROM topup_orders WHERE bank_txn_id=? AND status='paid'", (bank_txn_id,)).fetchone()
        if dup:
            return None, "Mã giao dịch ngân hàng này đã được xử lý trước đó!"
    ord_row = DB.execute("SELECT * FROM topup_orders WHERE order_code=?", (order_code,)).fetchone()
    if not ord_row:
        return None, "Không tìm thấy mã đơn hàng!"
    if ord_row["status"] == "paid":
        return None, "Đơn hàng này đã được thanh toán và cộng Ngọc trước đó!"
    pack = next((p for p in TOPUP_PACKS if p["id"] == ord_row["pack_id"]), None)
    if not pack:
        return None, "Gói nạp không hợp lệ!"

    uid = ord_row["user_id"]
    b = ensure_billing(uid)
    first_packs = b["firstPacks"]
    if pack.get("once") and first_packs.get(pack["id"]):
        return None, "Gói giới hạn 1 lần này tài khoản đã sở hữu rồi!"
    is_first_this = bool(pack.get("firstX2")) and not first_packs.get(pack["id"])
    base_jade = int(pack.get("jade", 0))
    bonus_jade = base_jade if is_first_this else 0
    total_jade = base_jade + bonus_jade
    if is_first_this or pack.get("once"):
        first_packs[pack["id"]] = True

    new_total_vnd = b["total_vnd"] + pack["vnd"]
    new_vip_exp = b["vip_exp"] + pack["vipExp"]
    old_vip_lv = b["vip_lv"]
    new_vip_lv = calc_vip_level(new_vip_exp)

    now = time.time()
    new_pass_until = b["pass_30_until"]
    if pack.get("passDays"):
        base_t = max(now, new_pass_until)
        new_pass_until = base_t + pack["passDays"] * 86400
    new_no_ads = 1 if (b["no_ads"] or pack.get("noAds")) else 0
    new_sp = 1 if (b["season_pass"] or pack.get("seasonPass")) else 0

    DB.execute("""
        UPDATE user_billing
        SET total_vnd=?, vip_exp=?, vip_lv=?, first_packs_json=?, pass_30_until=?, no_ads=?, season_pass=?
        WHERE user_id=?
    """, (new_total_vnd, new_vip_exp, new_vip_lv, json.dumps(first_packs), new_pass_until, new_no_ads, new_sp, uid))
    DB.execute("""
        UPDATE topup_orders
        SET status='paid', jade_granted=?, bonus_jade=?, vip_exp_added=?, paid_at=?, bank_txn_id=?
        WHERE order_code=? AND status!='paid'
    """, (base_jade, bonus_jade, pack["vipExp"], now, bank_txn_id, order_code))
    DB.commit()

    rewards = {}
    if total_jade > 0: rewards["jade"] = total_jade
    if pack.get("coin"): rewards["coin"] = pack["coin"]
    if pack.get("pill"): rewards["pill"] = pack["pill"]
    if pack.get("scroll"): rewards["scroll"] = pack["scroll"]

    u_row = DB.execute("SELECT username, sect_name FROM users WHERE id=?", (uid,)).fetchone()
    uname = u_row["username"] if u_row else str(uid)
    mail_att = rewards if attach_rewards_in_mail else {}
    mail_note = " Mở thư để nhận vật phẩm/Tiên Ngọc đính kèm." if attach_rewards_in_mail else ""
    send_mail(uid, "Tiên Bảo Các · Biên Lai Nạp", f"Thanh Toán Thành Công ({order_code})",
              f"Đơn hàng {pack['name']} ({pack['vnd']:,}₫) đã được xác nhận! Cộng +{total_jade:,} Tiên Ngọc{f' (gồm +{bonus_jade:,} thưởng ×2 lần đầu)' if bonus_jade else ''} & +{pack['vipExp']} VIP EXP.{mail_note}",
              mail_att)
    if new_vip_lv > old_vip_lv and new_vip_lv >= 2:
        t_info = next((x for x in VIP_TIERS if x["lv"] == new_vip_lv), None)
        await post_system_chat(f"👑 Chúc mừng Tông Chủ「{uname}」thăng cấp {t_info['title'] if t_info else f'VIP {new_vip_lv}'}! Toàn môn phái rực rỡ linh quang!")
    await ws_send(uid, {"type": "toast", "msg": f"💎 Nạp thành công {pack['name']} (+{total_jade:,} Tiên Ngọc, VIP {new_vip_lv})!"})

    return {
        "orderCode": order_code,
        "packId": pack["id"],
        "rewards": rewards,
        "bonusJade": bonus_jade,
        "unlockFlags": {
            "seasonPass": bool(new_sp),
            "noAds": bool(new_no_ads),
            "vipLv": new_vip_lv,
            "passDaysLeft": ensure_billing(uid)["passDaysLeft"]
        },
        "billing": ensure_billing(uid)
    }, None

async def api_topup_info(request: web.Request):
    user = auth_user(request)
    billing = ensure_billing(user["id"]) if user else None
    orders = []
    if user:
        rows = DB.execute("SELECT * FROM topup_orders WHERE user_id=? ORDER BY id DESC LIMIT 20", (user["id"],)).fetchall()
        orders = [dict(r) for r in rows]
    return web.json_response({
        "ok": True,
        "packs": TOPUP_PACKS,
        "vipTiers": VIP_TIERS,
        "firstReward": FIRST_TOPUP_REWARD,
        "billing": billing,
        "orders": orders,
        "bank": {
            "bankId": BANK_CONFIG["bankId"],
            "bankName": BANK_CONFIG["bankName"],
            "accountNo": BANK_CONFIG["accountNo"],
            "accountName": BANK_CONFIG["accountName"],
            "momoPhone": BANK_CONFIG["momoPhone"],
            "sandbox": BANK_CONFIG["sandbox"]
        }
    })

async def api_topup_order(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Cần đăng nhập tài khoản Online để nạp thẻ!"}, status=401)
    d = await request.json()
    pack_id = str(d.get("packId", ""))
    method = str(d.get("method", "vietqr"))
    if method not in ("vietqr", "momo", "card"):
        method = "vietqr"
    pack = next((p for p in TOPUP_PACKS if p["id"] == pack_id), None)
    if not pack:
        return web.json_response({"ok": False, "error": "Gói nạp không tồn tại!"}, status=400)
    b = ensure_billing(user["id"])
    if pack.get("once") and b["firstPacks"].get(pack_id):
        return web.json_response({"ok": False, "error": "Bạn đã mua gói giới hạn 1 lần này rồi!"}, status=400)

    card_info = ""
    if method == "card":
        telco = str(d.get("telco", "VIETTEL")).upper()[:12]
        serial = str(d.get("serial", "")).strip()
        pin = str(d.get("pin", "")).strip()
        if len(serial) < 6 or len(pin) < 6:
            return web.json_response({"ok": False, "error": "Số Seri và Mã Thẻ Cào phải có tối thiểu 6 ký tự!"}, status=400)
        card_info = f"{telco} | Seri:{serial[:4]}***{serial[-2:]}"

    order_code = f"TM{time.strftime('%m%d')}{secrets.token_hex(3).upper()}"
    now = time.time()
    DB.execute("""
        INSERT INTO topup_orders (order_code, user_id, pack_id, pack_name, amount_vnd, method, card_info, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    """, (order_code, user["id"], pack["id"], pack["name"], pack["vnd"], method, card_info, now))
    DB.commit()

    qr_url = f"https://img.vietqr.io/image/{BANK_CONFIG['bankId']}-{BANK_CONFIG['accountNo']}-compact2.png?amount={pack['vnd']}&addInfo={order_code}&accountName={BANK_CONFIG['accountName'].replace(' ', '%20')}"
    return web.json_response({
        "ok": True,
        "order": {
            "orderCode": order_code, "packId": pack["id"], "packName": pack["name"],
            "amountVnd": pack["vnd"], "method": method, "status": "pending", "cardInfo": card_info,
            "qrUrl": qr_url, "transferNote": order_code
        },
        "bank": {
            "bankId": BANK_CONFIG["bankId"], "bankName": BANK_CONFIG["bankName"],
            "accountNo": BANK_CONFIG["accountNo"], "accountName": BANK_CONFIG["accountName"],
            "momoPhone": BANK_CONFIG["momoPhone"], "sandbox": BANK_CONFIG["sandbox"]
        }
    })

async def api_topup_confirm(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    d = await request.json()
    order_code = str(d.get("orderCode", "")).strip().upper()
    ord_row = DB.execute("SELECT user_id FROM topup_orders WHERE order_code=?", (order_code,)).fetchone()
    if not ord_row or ord_row["user_id"] != user["id"]:
        return web.json_response({"ok": False, "error": "Đơn hàng không thuộc tài khoản của bạn!"}, status=404)
    sec = request.headers.get("X-Webhook-Secret", "")
    if not BANK_CONFIG["sandbox"] and sec != BANK_CONFIG["webhookSecret"]:
        return web.json_response({"ok": False, "error": "Máy chủ đang bật chế độ Production — vui lòng chuyển khoản để hệ thống tự duyệt qua Webhook!"}, status=403)
    res, err = await fulfill_topup_order(order_code)
    if err:
        return web.json_response({"ok": False, "error": err}, status=400)
    return web.json_response({"ok": True, **res})

async def api_topup_webhook(request: web.Request):
    sec = request.headers.get("X-Webhook-Secret", "")
    if sec != BANK_CONFIG["webhookSecret"]:
        return web.json_response({"ok": False, "error": "Invalid webhook signature"}, status=403)
    d = await request.json()
    content = str(d.get("content") or d.get("orderCode") or "").upper()
    rows = DB.execute("SELECT order_code, amount_vnd FROM topup_orders WHERE status='pending'").fetchall()
    matched = next((r for r in rows if r["order_code"] in content), None)
    if not matched:
        return web.json_response({"ok": False, "error": "No matching pending order code"}, status=404)
    paid_amt = safe_int(d.get("amount") or d.get("transferAmount") or d.get("amount_vnd"), 0)
    if paid_amt > 0 and paid_amt < matched["amount_vnd"]:
        return web.json_response({"ok": False, "error": "Transferred amount less than order price"}, status=400)
    txn_id = str(d.get("transactionId") or d.get("referenceCode") or d.get("id") or "").strip()[:80]
    res, err = await fulfill_topup_order(matched["order_code"], attach_rewards_in_mail=True, bank_txn_id=txn_id)
    if err:
        return web.json_response({"ok": False, "error": err}, status=400)
    return web.json_response({"ok": True, **res})

async def api_topup_claim_first(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    b = ensure_billing(user["id"])
    if b["total_vnd"] <= 0:
        return web.json_response({"ok": False, "error": "Cần nạp ít nhất 1 gói bất kỳ (từ 20.000₫) để mở khóa Quà Nạp Đầu!"}, status=400)
    if b["first_topup_claimed"]:
        return web.json_response({"ok": False, "error": "Bạn đã nhận Quà Nạp Đầu rồi!"}, status=400)
    DB.execute("UPDATE user_billing SET first_topup_claimed=1 WHERE user_id=?", (user["id"],))
    DB.commit()
    return web.json_response({"ok": True, "reward": FIRST_TOPUP_REWARD, "billing": ensure_billing(user["id"])})

async def api_topup_claim_vip(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    lv = int((await request.json()).get("vipLv") or 0)
    tier = next((t for t in VIP_TIERS if t["lv"] == lv), None)
    if not tier:
        return web.json_response({"ok": False, "error": "Mốc VIP không hợp lệ!"}, status=400)
    b = ensure_billing(user["id"])
    if b["vip_lv"] < lv:
        return web.json_response({"ok": False, "error": f"Bạn cần đạt VIP {lv} để nhận rương này!"}, status=400)
    claimed = b["vipClaimed"]
    if claimed.get(str(lv)):
        return web.json_response({"ok": False, "error": f"Đã nhận rương VIP {lv} rồi!"}, status=400)
    claimed[str(lv)] = True
    DB.execute("UPDATE user_billing SET vip_claimed_json=? WHERE user_id=?", (json.dumps(claimed), user["id"]))
    DB.commit()
    return web.json_response({"ok": True, "rewards": tier["chest"], "billing": ensure_billing(user["id"])})

async def api_topup_claim_daily_pass(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Unauthorized"}, status=401)
    b = ensure_billing(user["id"])
    if not b["canClaimDailyPass"]:
        return web.json_response({"ok": False, "error": "Chưa kích hoạt Thẻ Tháng hoặc hôm nay bạn đã nhận rồi!"}, status=400)
    today = time.strftime("%Y-%m-%d")
    DB.execute("UPDATE user_billing SET pass_30_last_claim=? WHERE user_id=?", (today, user["id"]))
    DB.commit()
    return web.json_response({"ok": True, "rewards": {"jade": 150}, "billing": ensure_billing(user["id"])})

async def api_giftcode_redeem(request: web.Request):
    user = auth_user(request)
    if not user:
        return web.json_response({"ok": False, "error": "Cần đăng nhập tài khoản Online để nhập Giftcode!"}, status=401)
    code = str((await request.json()).get("code", "")).strip().upper()
    gc = DB.execute("SELECT * FROM giftcodes WHERE code=?", (code,)).fetchone()
    if not gc:
        return web.json_response({"ok": False, "error": "Mã Giftcode không tồn tại hoặc đã hết hạn!"}, status=404)
    if gc["expires_at"] and float(gc["expires_at"]) > 0 and time.time() > float(gc["expires_at"]):
        return web.json_response({"ok": False, "error": "Mã Giftcode này đã hết hạn sử dụng!"}, status=400)
    if gc["used_count"] >= gc["max_uses"]:
        return web.json_response({"ok": False, "error": "Mã Giftcode này đã hết lượt sử dụng!"}, status=400)
    if DB.execute("SELECT 1 FROM giftcode_claims WHERE user_id=? AND code=?", (user["id"], code)).fetchone():
        return web.json_response({"ok": False, "error": "Bạn đã sử dụng mã Giftcode này rồi!"}, status=400)
    DB.execute("INSERT INTO giftcode_claims (user_id, code, claimed_at) VALUES (?, ?, ?)", (user["id"], code, time.time()))
    DB.execute("UPDATE giftcodes SET used_count=used_count+1 WHERE code=?", (code,))
    DB.commit()
    rws = json.loads(gc["rewards_json"] or "{}")
    return web.json_response({"ok": True, "code": code, "title": gc["title"], "rewards": rws})

# ==================== STATIC FILE SERVER (NO-CACHE FOR JS/CSS/HTML) ====================
def is_gm_admin(user: dict) -> bool:
    if not user:
        return False
    return bool(user.get("is_admin")) or user.get("username", "").lower() in ("krain9x", "admin")

def log_gm_action(gm_name: str, kind: str, target_label: str = "", detail: str = ""):
    try:
        DB.execute(
            "INSERT INTO gm_audit_logs (gm_name, action_kind, target_label, detail, created_at) VALUES (?, ?, ?, ?, ?)",
            (str(gm_name or "GM"), str(kind), str(target_label)[:80], str(detail)[:220], time.time())
        )
        DB.commit()
    except Exception:
        pass

async def api_admin_overview(request: web.Request):
    user = auth_user(request)
    if not is_gm_admin(user):
        return web.json_response({"ok": False, "error": "Chỉ tài khoản GM Admin mới có quyền!"}, status=403)
    users = [dict(r) for r in DB.execute("""
        SELECT u.id, u.username, u.sect_name, u.title, u.is_bot, COALESCE(u.banned, 0) AS banned, u.last_seen, u.created_at,
               s.power, s.realm_idx, s.max_stage, s.tower_floor, s.arena_score, s.fame, s.rep,
               COALESCE(b.vip_lv, 0) AS vip_lv, COALESCE(b.vip_exp, 0) AS vip_exp, COALESCE(b.total_vnd, 0) AS total_vnd,
               g.name AS guild_name, g.tag AS guild_tag
        FROM users u LEFT JOIN saves s ON s.user_id=u.id
        LEFT JOIN user_billing b ON b.user_id=u.id
        LEFT JOIN guild_members gm ON gm.user_id=u.id
        LEFT JOIN guilds g ON g.id=gm.guild_id
        ORDER BY s.power DESC LIMIT 160
    """).fetchall()]
    guilds = [dict(r) for r in DB.execute("""
        SELECT g.*, (SELECT COUNT(*) FROM guild_members gm WHERE gm.guild_id=g.id) AS member_count,
               u.username AS leader_name
        FROM guilds g LEFT JOIN users u ON u.id = g.leader_id
        ORDER BY g.week_score DESC
    """).fetchall()]
    orders = [dict(r) for r in DB.execute("SELECT * FROM topup_orders ORDER BY id DESC LIMIT 100").fetchall()]
    codes = [dict(r) for r in DB.execute("SELECT * FROM giftcodes").fetchall()]
    for c in codes:
        c["rewards"] = json.loads(c.get("rewards_json") or "{}")
    chat = [dict(r) for r in DB.execute("SELECT * FROM chat_messages ORDER BY id DESC LIMIT 40").fetchall()]
    logs = [dict(r) for r in DB.execute("SELECT * FROM gm_audit_logs ORDER BY id DESC LIMIT 60").fetchall()]
    rev_row = DB.execute("""
        SELECT
          COALESCE(SUM(CASE WHEN status='paid' THEN amount_vnd ELSE 0 END), 0) AS totalPaidVnd,
          COALESCE(SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END), 0) AS paidCount,
          COALESCE(SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END), 0) AS pendingCount,
          COALESCE(SUM(CASE WHEN status='rejected' THEN 1 ELSE 0 END), 0) AS rejectedCount
        FROM topup_orders
    """).fetchone()
    return web.json_response({
        "ok": True, "users": users, "guilds": guilds, "orders": orders,
        "codes": codes, "boss": get_wb_payload(), "rooms": build_coop_rooms_payload(),
        "chat": chat, "logs": logs, "revenue": dict(rev_row) if rev_row else {}
    })

async def api_admin_action(request: web.Request):
    user = auth_user(request)
    if not is_gm_admin(user):
        return web.json_response({"ok": False, "error": "Forbidden"}, status=403)
    d = await request.json()
    kind = d.get("kind")
    gm_name = user.get("username", "GM")
    if kind == "grant_mail":
        tid = d.get("targetId")
        att = d.get("attachments") or {}
        title = str(d.get("title") or "Quà GM")
        body_msg = str(d.get("body") or "Quà hỗ trợ trực tiếp từ Quản Trị Viên.")
        if tid == "__ALL__":
            ids = [r[0] for r in DB.execute("SELECT id FROM users WHERE is_bot=0").fetchall()]
            t_lbl = f"Toàn server ({len(ids)} người)"
        else:
            ids = [safe_int(tid, 0)]
            u_row = DB.execute("SELECT username FROM users WHERE id=?", (ids[0],)).fetchone()
            t_lbl = u_row["username"] if u_row else f"#{ids[0]}"
        for x in ids:
            send_mail(x, "GM Thái Hư Tiên Môn", title, body_msg, att)
        log_gm_action(gm_name, "grant_mail", t_lbl, f"{title}: {json.dumps(att, ensure_ascii=False)}")
        return web.json_response({"ok": True, "count": len(ids)})
    elif kind == "grant_vip":
        tid = safe_int(d.get("targetId"), 0)
        add_exp = safe_int(d.get("addExp"), 0)
        b = ensure_billing(tid)
        new_exp = b["vip_exp"] + add_exp
        new_lv = calc_vip_level(new_exp)
        DB.execute("UPDATE user_billing SET vip_exp=?, vip_lv=? WHERE user_id=?", (new_exp, new_lv, tid))
        DB.commit()
        log_gm_action(gm_name, "grant_vip", f"UID {tid}", f"+{add_exp} VIP EXP -> VIP {new_lv}")
        return web.json_response({"ok": True, "vipLv": new_lv})
    elif kind == "toggle_ban":
        tid = safe_int(d.get("targetId"), 0)
        row = DB.execute("SELECT username, COALESCE(banned, 0) AS banned FROM users WHERE id=? AND is_bot=0", (tid,)).fetchone()
        if not row:
            return web.json_response({"ok": False, "error": "User not found"}, status=404)
        new_ban = 0 if row["banned"] else 1
        DB.execute("UPDATE users SET banned=? WHERE id=?", (new_ban, tid))
        if new_ban:
            DB.execute("DELETE FROM sessions WHERE user_id=?", (tid,))
            sock = ONLINE_SOCKETS.pop(tid, None)
            if sock and not sock["ws"].closed:
                try:
                    await sock["ws"].close()
                except Exception:
                    pass
        DB.commit()
        log_gm_action(gm_name, "toggle_ban", row["username"], "KHÓA TÀI KHOẢN" if new_ban else "MỞ KHÓA")
        return web.json_response({"ok": True, "banned": bool(new_ban)})
    elif kind == "rename_sect":
        tid = safe_int(d.get("targetId"), 0)
        new_sect = str(d.get("sectName") or "").strip()[:32]
        if not new_sect:
            return web.json_response({"ok": False, "error": "Tên tông môn trống"}, status=400)
        DB.execute("UPDATE users SET sect_name=? WHERE id=?", (new_sect, tid))
        DB.commit()
        log_gm_action(gm_name, "rename_sect", f"UID {tid}", f"Đổi thành [{new_sect}]")
        return web.json_response({"ok": True, "sectName": new_sect})
    elif kind == "approve_order":
        oc = str(d.get("orderCode") or "")
        row, err = await fulfill_topup_order(oc, attach_rewards_in_mail=True)
        if err:
            return web.json_response({"ok": False, "error": err}, status=400)
        log_gm_action(gm_name, "approve_order", oc, f"Cộng quà: {json.dumps(row.get('rewards') or {}, ensure_ascii=False)}")
        return web.json_response({"ok": True, "rewards": row.get("rewards")})
    elif kind == "reject_order":
        oc = str(d.get("orderCode") or "")
        reason = str(d.get("reason") or "Thông tin giao dịch chưa khớp hoặc hết hạn.").strip()[:180]
        row = DB.execute("SELECT user_id, status, pack_name FROM topup_orders WHERE order_code=?", (oc,)).fetchone()
        if not row:
            return web.json_response({"ok": False, "error": "Không tìm thấy đơn"}, status=404)
        if row["status"] != "pending":
            return web.json_response({"ok": False, "error": "Chỉ hủy được đơn đang chờ duyệt"}, status=400)
        DB.execute("UPDATE topup_orders SET status='rejected' WHERE order_code=?", (oc,))
        DB.commit()
        send_mail(row["user_id"], "GM Thanh Toán", f"Đơn Nạp {oc} Bị Từ Chối", f"Đơn {row['pack_name']} ({oc}) chưa được duyệt. Lý do: {reason}", {})
        log_gm_action(gm_name, "reject_order", oc, reason)
        return web.json_response({"ok": True})
    elif kind == "create_giftcode":
        code = str(d.get("code") or "").strip().upper()
        if not code:
            return web.json_response({"ok": False, "error": "Missing code"}, status=400)
        rws = d.get("rewards") or {}
        DB.execute("""
            INSERT INTO giftcodes (code, title, rewards_json, max_uses, used_count, expires_at) VALUES (?, ?, ?, ?, 0, 0)
            ON CONFLICT(code) DO UPDATE SET title=excluded.title, rewards_json=excluded.rewards_json, max_uses=excluded.max_uses
        """, (code, str(d.get("title") or code), json.dumps(rws, ensure_ascii=False), max(1, safe_int(d.get("maxUses"), 500))))
        DB.commit()
        log_gm_action(gm_name, "create_giftcode", code, json.dumps(rws, ensure_ascii=False))
        return web.json_response({"ok": True})
    elif kind == "delete_giftcode":
        code = str(d.get("code") or "").upper()
        DB.execute("DELETE FROM giftcodes WHERE code=?", (code,))
        DB.commit()
        log_gm_action(gm_name, "delete_giftcode", code, "Xóa Giftcode")
        return web.json_response({"ok": True})
    elif kind == "broadcast":
        txt = str(d.get("text") or "").strip()[:220]
        await post_system_chat(f"📢 {txt}")
        log_gm_action(gm_name, "broadcast", "Thế Giới", txt)
        return web.json_response({"ok": True})
    elif kind in ("reset_boss", "spawn_boss"):
        row = DB.execute("SELECT lv FROM world_boss WHERE id=1").fetchone()
        cur_lv = row["lv"] if row else 1
        nlv = max(1, safe_int(d.get("lv"), cur_lv + 1 if d.get("lv") is None else cur_lv))
        custom_nm = str(d.get("name") or "").strip()
        nm = custom_nm if custom_nm else WORLD_BOSS_POOL[(nlv - 1) % len(WORLD_BOSS_POOL)]
        nmax = int(2500000 * (1 + (nlv - 1) * 0.45))
        DB.execute("UPDATE world_boss SET name=?, lv=?, hp=?, max_hp=?, respawn_at=0, dmg_board_json='{}' WHERE id=1", (nm, nlv, nmax, nmax))
        DB.commit()
        await ws_broadcast({"type": "wb_update", "boss": get_wb_payload(), "lastHit": None})
        log_gm_action(gm_name, "spawn_boss", f"{nm} Lv.{nlv}", f"HP {nmax:,}")
        return web.json_response({"ok": True})
    elif kind == "delete_guild":
        gid = safe_int(d.get("guildId"), 0)
        g_row = DB.execute("SELECT name, tag FROM guilds WHERE id=?", (gid,)).fetchone()
        if not g_row:
            return web.json_response({"ok": False, "error": "Không tìm thấy Bang hội"}, status=404)
        DB.execute("UPDATE veins SET guild_id=NULL WHERE guild_id=?", (gid,))
        DB.execute("DELETE FROM guild_members WHERE guild_id=?", (gid,))
        DB.execute("DELETE FROM guilds WHERE id=?", (gid,))
        DB.commit()
        log_gm_action(gm_name, "delete_guild", f"[{g_row['tag']}] {g_row['name']}", "Giải tán liên minh")
        return web.json_response({"ok": True})
    elif kind == "clear_chat":
        ch = str(d.get("channel") or "all")
        if ch == "all":
            DB.execute("DELETE FROM chat_messages")
        else:
            DB.execute("DELETE FROM chat_messages WHERE channel=?", (ch,))
        DB.commit()
        log_gm_action(gm_name, "clear_chat", ch, "Dọn sạch lịch sử chat")
        return web.json_response({"ok": True})
    elif kind == "delete_item":
        if d.get("col") == "tm_chat":
            DB.execute("DELETE FROM chat_messages WHERE id=?", (safe_int(d.get("id"), 0),))
            DB.commit()
        elif d.get("col") == "tm_coop_rooms":
            COOP_ROOMS.pop(str(d.get("id")), None)
        log_gm_action(gm_name, "delete_item", str(d.get("col")), f"ID {d.get('id')}")
        return web.json_response({"ok": True})
    return web.json_response({"ok": False, "error": "Unknown admin action"}, status=400)

PUBLIC_STATIC_EXTS = {".html", ".js", ".css", ".json", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".wav", ".mp3", ".ogg", ".bin", ".ttf", ".woff", ".woff2"}

async def static_handler(request: web.Request):
    rel = (request.match_info.get("path", "") or "index.html").lstrip("/")
    if rel.endswith("/"):
        rel += "index.html"
    parts = [p for p in Path(rel).parts if p not in ("", ".")]
    if any(p.startswith(".") for p in parts) or (parts and parts[0].lower() in ("server", "__pycache__", ".git")):
        return web.Response(status=403, text="Forbidden")
    fpath = (ROOT_DIR / rel).resolve()
    try:
        fpath.relative_to(ROOT_DIR)
    except ValueError:
        return web.Response(status=403, text="Forbidden")
    if fpath.suffix.lower() not in PUBLIC_STATIC_EXTS or not fpath.is_file():
        return web.Response(status=404, text="Not found")
    ctype, _ = mimetypes.guess_type(str(fpath))
    headers = {}
    if fpath.suffix.lower() in (".js", ".css", ".html", ".json"):
        headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    else:
        headers["Cache-Control"] = "public, max-age=3600"
    return web.FileResponse(fpath, headers=headers)

def create_app():
    app = web.Application(client_max_size=16 * 1024 * 1024)
    app.router.add_post("/api/auth/register", api_register)
    app.router.add_post("/api/auth/login", api_login)
    app.router.add_get("/api/auth/me", api_me)
    app.router.add_post("/api/save/sync", api_save_sync)
    app.router.add_get("/api/leaderboard", api_leaderboard)
    app.router.add_get("/api/pvp/targets", api_pvp_targets)
    app.router.add_post("/api/pvp/async_result", api_pvp_async_result)
    app.router.add_get("/api/worldboss", api_worldboss_get)
    app.router.add_post("/api/worldboss/hit", api_worldboss_hit)
    app.router.add_get("/api/friends", api_friends_get)
    app.router.add_post("/api/friends/add", api_friends_add)
    app.router.add_post("/api/friends/accept", api_friends_accept)
    app.router.add_post("/api/friends/gift", api_friends_gift)
    app.router.add_get("/api/mail", api_mail_get)
    app.router.add_post("/api/mail/claim", api_mail_claim)
    app.router.add_get("/api/market", api_market_get)
    app.router.add_post("/api/market/list", api_market_list)
    app.router.add_post("/api/market/buy", api_market_buy)
    app.router.add_post("/api/market/cancel", api_market_cancel)
    app.router.add_get("/api/guilds", api_guilds_get)
    app.router.add_post("/api/guilds/create", api_guilds_create)
    app.router.add_post("/api/guilds/join", api_guilds_join)
    app.router.add_post("/api/guilds/leave", api_guilds_leave)
    app.router.add_post("/api/guilds/action", api_guilds_action)
    app.router.add_get("/api/chat", api_chat_get)
    app.router.add_get("/api/topup/info", api_topup_info)
    app.router.add_post("/api/topup/order", api_topup_order)
    app.router.add_post("/api/topup/confirm", api_topup_confirm)
    app.router.add_post("/api/topup/webhook", api_topup_webhook)
    app.router.add_post("/api/topup/claim_first", api_topup_claim_first)
    app.router.add_post("/api/topup/claim_vip", api_topup_claim_vip)
    app.router.add_post("/api/topup/claim_daily_pass", api_topup_claim_daily_pass)
    app.router.add_post("/api/giftcode/redeem", api_giftcode_redeem)
    app.router.add_get("/api/player/{id}/inspect", api_player_inspect)
    app.router.add_get("/api/plaza", api_plaza_get)
    app.router.add_get("/api/coop/rooms", api_coop_rooms)
    app.router.add_get("/api/guildwar", api_guildwar_get)
    app.router.add_post("/api/guildwar/attack", api_guildwar_attack)
    app.router.add_post("/api/guildwar/claim", api_guildwar_claim)
    app.router.add_get("/api/admin/overview", api_admin_overview)
    app.router.add_post("/api/admin/action", api_admin_action)
    app.router.add_get("/ws", ws_handler)
    app.router.add_get("/", static_handler)
    app.router.add_get("/{path:.*}", static_handler)
    return app

if __name__ == "__main__":
    print(f"[Thái Hư Tiên Môn ONLINE Server] http://{HOST}:{PORT} | DB: {DB_PATH}")
    web.run_app(create_app(), host=HOST, port=PORT, access_log=None)
