from __future__ import annotations

import json
import math
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[2]
LINE_DEMO = ROOT / "line-demo"
PROPOSAL = ROOT / "outputs/manual-20260611-yuukichiya-line/presentations/yuukichiya-line-proposal"
PROPOSAL_ASSETS = PROPOSAL / "assets"
PROPOSAL_OUTPUT = PROPOSAL / "output"
RICH_OUTPUT = PROPOSAL_OUTPUT / "line-rich-menu"

W, H = 1536, 1024
MENU_W, MENU_H = 2500, 1686

GREEN = "#06a944"
GREEN_DARK = "#028236"
YELLOW = "#f7b500"
BLUE = "#168dda"
TEAL = "#00aebf"
CORAL = "#f24d68"
ORANGE = "#ff8a00"
INK = "#152033"
MUTED = "#667085"
PAPER = "#ffffff"
BG = "#f3fbf7"


def font(size: int, weight: int = 5) -> ImageFont.FreeTypeFont:
    candidates = [
        f"/System/Library/Fonts/ヒラギノ角ゴシック W{weight}.ttc",
        "/System/Library/Fonts/ヒラギノ丸ゴ ProN W4.ttc",
        "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


F = {
    "h1": font(74, 7),
    "h2": font(44, 7),
    "h3": font(32, 7),
    "body": font(24, 5),
    "small": font(19, 4),
    "tiny": font(15, 4),
    "badge": font(22, 7),
    "menu": font(112, 7),
    "menu_sub": font(48, 5),
}


def text_size(draw: ImageDraw.ImageDraw, text: str, ft: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=ft)
    return box[2] - box[0], box[3] - box[1]


def center_text(draw: ImageDraw.ImageDraw, box, text: str, ft, fill=PAPER):
    x, y, w, h = box
    tw, th = text_size(draw, text, ft)
    draw.text((x + (w - tw) / 2, y + (h - th) / 2), text, font=ft, fill=fill)


def draw_text(draw, xy, text, ft, fill=INK, spacing=8, max_width=None):
    x, y = xy
    if not max_width:
        draw.text((x, y), text, font=ft, fill=fill)
        return y + text_size(draw, text, ft)[1]
    lines = []
    current = ""
    for ch in text:
        test = current + ch
        if text_size(draw, test, ft)[0] <= max_width or not current:
            current = test
        else:
            lines.append(current)
            current = ch
    if current:
        lines.append(current)
    for line in lines:
        draw.text((x, y), line, font=ft, fill=fill)
        y += text_size(draw, line, ft)[1] + spacing
    return y


def shadow_card(img, box, radius=28, fill=PAPER, outline=None):
    x, y, w, h = box
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x + 10, y + 16, x + w + 10, y + h + 16), radius, fill=(12, 34, 58, 35))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    base = Image.alpha_composite(img.convert("RGBA"), shadow)
    img.paste(base.convert("RGB"))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((x, y, x + w, y + h), radius, fill=fill, outline=outline, width=3 if outline else 1)


def make_slide_bg():
    img = Image.new("RGB", (W, H), "#f7fffb")
    d = ImageDraw.Draw(img)
    d.ellipse((-180, -200, 330, 280), fill="#fff0b8")
    d.ellipse((1240, -140, 1680, 280), fill="#dff2ff")
    for x in range(20, W, 130):
        for y in range(20, H, 130):
            if (x // 130 + y // 130) % 5 == 0:
                d.ellipse((x, y, x + 8, y + 8), fill="#d7f2e3")
    return img


def icon(draw, kind, box, color, fill=PAPER):
    x, y, w, h = box
    cx, cy = x + w / 2, y + h / 2
    s = min(w, h)
    if kind == "member":
        draw.rounded_rectangle((cx - s * .42, cy - s * .28, cx + s * .42, cy + s * .28), int(s * .08), fill=fill)
        draw.ellipse((cx - s * .30, cy - s * .13, cx - s * .10, cy + s * .07), fill=color)
        draw.rounded_rectangle((cx - s * .34, cy + s * .05, cx - s * .06, cy + s * .17), int(s * .03), fill=color)
        for i in range(3):
            yy = cy - s * .16 + i * s * .13
            draw.rounded_rectangle((cx + s * .04, yy, cx + s * .30, yy + s * .035), int(s * .02), fill=color)
    elif kind == "point":
        draw.ellipse((cx - s * .35, cy - s * .35, cx + s * .35, cy + s * .35), outline=fill, width=max(4, int(s * .08)))
        center_text(draw, (cx - s * .22, cy - s * .25, s * .44, s * .5), "P", font(int(s * .55), 7), fill)
    elif kind == "calendar":
        draw.rounded_rectangle((cx - s * .36, cy - s * .34, cx + s * .36, cy + s * .34), int(s * .06), fill=fill)
        for i in range(3):
            for j in range(3):
                px = cx - s * .20 + i * s * .20
                py = cy - s * .10 + j * s * .14
                draw.rounded_rectangle((px - 5, py - 5, px + 5, py + 5), 3, fill=color)
    elif kind == "measure":
        draw.ellipse((cx - s * .34, cy - s * .30, cx + s * .10, cy + s * .14), outline=fill, width=max(5, int(s * .08)))
        draw.rounded_rectangle((cx - s * .05, cy - s * .02, cx + s * .40, cy + s * .18), int(s * .05), fill=fill)
        for i in range(6):
            px = cx + s * (.03 + i * .06)
            draw.line((px, cy - s * .01, px, cy + s * .12), fill=color, width=3)
    elif kind == "cart":
        lw = max(6, int(s * .07))
        draw.line((cx - s*.36, cy - s*.18, cx - s*.22, cy - s*.18, cx - s*.08, cy + s*.15, cx + s*.30, cy+s*.15), fill=fill, width=lw)
        draw.line((cx - s*.12, cy - s*.04, cx + s*.34, cy - s*.04), fill=fill, width=lw)
        draw.ellipse((cx - s*.10, cy+s*.24, cx+s*.02, cy+s*.36), fill=fill)
        draw.ellipse((cx+s*.22, cy+s*.24, cx+s*.34, cy+s*.36), fill=fill)
    elif kind == "coupon":
        draw.rounded_rectangle((cx - s*.38, cy - s*.22, cx + s*.38, cy + s*.22), int(s*.05), fill=fill)
        draw.ellipse((cx - s*.45, cy - s*.06, cx - s*.33, cy + s*.06), fill=color)
        draw.ellipse((cx + s*.33, cy - s*.06, cx + s*.45, cy + s*.06), fill=color)
        center_text(draw, (cx - s*.18, cy - s*.18, s*.36, s*.36), "%", font(int(s*.42), 7), color)


def phone(draw, box, title="勇吉屋"):
    x, y, w, h = box
    draw.rounded_rectangle((x, y, x+w, y+h), 52, fill="#111827")
    draw.rounded_rectangle((x+14, y+18, x+w-14, y+h-18), 42, fill="#eef7ff")
    draw.rounded_rectangle((x+w*.34, y+20, x+w*.66, y+45), 13, fill="#111827")
    draw.text((x+42, y+58), title, font=font(25, 7), fill=INK)
    draw.rounded_rectangle((x+34, y+115, x+w-34, y+215), 28, fill=PAPER)
    draw.text((x+58, y+138), "友だち追加ありがとうございます！", font=font(19, 6), fill=INK)
    draw.text((x+58, y+169), "メニューから各機能をご利用いただけます。", font=font(16, 5), fill=INK)
    labels = [
        ("会員情報", GREEN, "member"),
        ("ポイント", YELLOW, "point"),
        ("採寸予約", BLUE, "calendar"),
        ("採寸記録", TEAL, "measure"),
        ("ECサイト", CORAL, "cart"),
        ("クーポン", ORANGE, "coupon"),
    ]
    tx, ty = x+34, y+245
    tw, th, gap = (w-92)/3, 92, 12
    for i, (label, col, kind) in enumerate(labels):
        cx = tx + (i % 3) * (tw + gap)
        cy = ty + (i // 3) * (th + gap)
        draw.rounded_rectangle((cx, cy, cx+tw, cy+th), 14, fill=col)
        icon(draw, kind, (cx+10, cy+8, 38, 38), col, PAPER)
        center_text(draw, (cx+5, cy+48, tw-10, 34), label, font(18, 7), PAPER)
    center_text(draw, (x, y+h-58, w, 30), "メニューをひらく ▲", font(18, 5), INK)


def badge(draw, xy, text, color):
    x, y = xy
    tw, th = text_size(draw, text, F["badge"])
    draw.rounded_rectangle((x, y, x + tw + 34, y + th + 20), 18, fill=color)
    draw.text((x + 17, y + 10), text, font=F["badge"], fill=PAPER)
    return x + tw + 46


def slide_cover():
    img = make_slide_bg()
    d = ImageDraw.Draw(img)
    d.text((70, 70), "勇吉屋", font=font(90, 7), fill=GREEN_DARK)
    d.text((70, 174), "公式LINE会員サービス", font=font(70, 7), fill=INK)
    d.line((75, 280, 710, 280), fill=GREEN, width=8)
    d.text((70, 340), "会員・ポイント・採寸記録を、", font=font(48, 7), fill=GREEN_DARK)
    d.text((70, 405), "いつものLINEで。", font=font(48, 7), fill=GREEN_DARK)
    d.text((70, 500), "親御さんにも、店舗スタッフにも", font=font(31, 6), fill=INK)
    d.text((70, 545), "使いやすい新しい顧客体験", font=font(31, 6), fill=INK)
    badge(d, (70, 635), "PRデモ企画", CORAL)
    badge(d, (285, 635), "LINE公式 + LIFF", GREEN)
    # simple family circle and phone
    d.ellipse((620, 330, 930, 640), fill="#fff4c9", outline="#ffe28a", width=4)
    d.text((665, 410), "親子で", font=font(44, 7), fill=INK)
    d.text((650, 475), "かんたん確認", font=font(38, 7), fill=GREEN_DARK)
    phone(d, (970, 80, 420, 680))
    y = 795
    cards = [
        ("会員情報", "会員証と家族情報を確認", GREEN, "member"),
        ("ポイント", "残高・履歴・QRを表示", YELLOW, "point"),
        ("採寸記録", "お子さま別に記録を確認", BLUE, "measure"),
        ("EC導線", "勇吉屋ネットへ接続", CORAL, "cart"),
    ]
    x = 52
    for title, sub, col, kind in cards:
        shadow_card(img, (x, y, 344, 145), 28, PAPER, "#dbeee4")
        icon(d, kind, (x+24, y+32, 74, 74), col, col)
        d.text((x+118, y+34), title, font=font(31, 7), fill=col)
        d.text((x+118, y+88), sub, font=font(18, 5), fill=INK)
        x += 370
    d.rounded_rectangle((0, 965, W, H), 0, fill=BLUE)
    center_text(d, (0, 970, W, 46), "株式会社アイアンドエフ様 ご提案用", font(32, 7), PAPER)
    return img


def slide_menu_flow():
    img = make_slide_bg()
    d = ImageDraw.Draw(img)
    center_text(d, (0, 42, W, 70), "LINEメニューから、必要な機能へすぐアクセス", font(54, 7), GREEN_DARK)
    center_text(d, (0, 116, W, 42), "会員証・ポイント・採寸・お買い物の入口をひとつに集約", font(26, 6), INK)
    phone(d, (70, 190, 430, 690))
    panels = [
        ("会員情報", "親御さんとお子さま情報を確認", GREEN, "member"),
        ("ポイント", "残高・履歴・会員QRを表示", YELLOW, "point"),
        ("採寸予約", "既存予約サイトへ移動", BLUE, "calendar"),
        ("採寸記録", "お子さま別に記録を確認", TEAL, "measure"),
        ("ECサイト", "勇吉屋ネットへアクセス", CORAL, "cart"),
        ("クーポン", "学校・学年に合わせて配信", ORANGE, "coupon"),
    ]
    for i, (title, sub, col, kind) in enumerate(panels):
        x = 575 + (i % 2) * 455
        y = 205 + (i // 2) * 210
        shadow_card(img, (x, y, 405, 160), 24, PAPER, col)
        icon(d, kind, (x+28, y+42, 72, 72), col, col)
        d.text((x+120, y+38), title, font=font(34, 7), fill=col)
        draw_text(d, (x+120, y+86), sub, font(22, 5), INK, max_width=240)
    d.rounded_rectangle((235, 920, 1300, 985), 28, fill=GREEN)
    center_text(d, (235, 920, 1065, 65), "初期デモは手動設定で短期間にPR可能", font(33, 7), PAPER)
    return img


def slide_member():
    img = make_slide_bg()
    d = ImageDraw.Draw(img)
    center_text(d, (0, 40, W, 66), "会員情報・お子さま情報をLINEでかんたん確認", font(48, 7), GREEN_DARK)
    center_text(d, (0, 112, W, 42), "親御さんを主会員にして、お子さまごとの学校・学年・採寸履歴につなげます", font(24, 6), INK)
    shadow_card(img, (80, 205, 455, 600), 34, PAPER, "#cfeee0")
    d.text((130, 250), "会員情報", font=font(38, 7), fill=GREEN)
    d.text((130, 326), "会員番号 12345678", font=font(27, 6), fill=INK)
    d.text((130, 382), "お名前　山田 由美", font=font(27, 6), fill=INK)
    d.text((130, 438), "電話番号　090-1234-5678", font=font(23, 5), fill=INK)
    d.text((130, 494), "代表者区分　親御さん", font=font(23, 5), fill=INK)
    d.rounded_rectangle((130, 670, 445, 735), 22, fill=GREEN)
    center_text(d, (130, 670, 315, 65), "情報を更新する", font(26, 7), PAPER)
    shadow_card(img, (620, 205, 455, 600), 34, PAPER, "#d8eaff")
    d.text((670, 250), "お子さま一覧", font=font(38, 7), fill=BLUE)
    children = [("山田 花子", "中学1年", "豊田市立さくら中学校"), ("山田 太郎", "小学5年", "豊田市立みどり小学校")]
    for i, (name, grade, school) in enumerate(children):
        yy = 330 + i * 135
        d.rounded_rectangle((670, yy, 1025, yy+105), 20, fill="#f4f9ff", outline="#b5d7f5", width=2)
        d.text((700, yy+18), f"{name}　{grade}", font=font(27, 7), fill=INK)
        d.text((700, yy+60), school, font=font(19, 5), fill=MUTED)
    d.rounded_rectangle((670, 670, 1025, 735), 22, fill=BLUE)
    center_text(d, (670, 670, 355, 65), "お子さまを追加", font(26, 7), PAPER)
    callouts = [("登録内容をいつでも確認", GREEN), ("兄弟姉妹をまとめて管理", BLUE), ("学校・学年別のお知らせに活用", ORANGE), ("店舗側の代理登録にも対応可能", CORAL)]
    for i, (txt, col) in enumerate(callouts):
        y = 250 + i * 120
        d.rounded_rectangle((1130, y, 1458, y+78), 20, fill=PAPER, outline=col, width=4)
        center_text(d, (1130, y, 328, 78), txt, font(23, 7), col)
    d.rounded_rectangle((450, 900, 1088, 965), 26, fill=GREEN)
    center_text(d, (450, 900, 638, 65), "紙の会員台帳から、LINEでつながる顧客管理へ", font(28, 7), PAPER)
    return img


def draw_demo_qr(draw, x, y, size):
    draw.rounded_rectangle((x, y, x+size, y+size), 12, fill=PAPER, outline="#1f2937", width=3)
    cell = size // 25
    def finder(px, py):
        draw.rectangle((x+px*cell, y+py*cell, x+(px+7)*cell, y+(py+7)*cell), fill="#111")
        draw.rectangle((x+(px+1)*cell, y+(py+1)*cell, x+(px+6)*cell, y+(py+6)*cell), fill=PAPER)
        draw.rectangle((x+(px+2)*cell, y+(py+2)*cell, x+(px+5)*cell, y+(py+5)*cell), fill="#111")
    finder(2, 2); finder(16, 2); finder(2, 16)
    for yy in range(25):
        for xx in range(25):
            if (2 <= xx < 9 and 2 <= yy < 9) or (16 <= xx < 23 and 2 <= yy < 9) or (2 <= xx < 9 and 16 <= yy < 23):
                continue
            if (xx*7 + yy*11 + xx*yy) % 5 in (0, 2):
                draw.rectangle((x+xx*cell, y+yy*cell, x+(xx+1)*cell, y+(yy+1)*cell), fill="#111")


def slide_points():
    img = make_slide_bg()
    d = ImageDraw.Draw(img)
    center_text(d, (0, 35, W, 70), "ポイントカードをLINEで持ち歩き", font(54, 7), GREEN_DARK)
    center_text(d, (0, 112, W, 42), "会員QRを読み取って、店頭でポイントをかんたん付与・減算", font(26, 6), INK)
    steps = ["LINEで会員QRを開く", "店頭でQRを読み取る", "ポイントを付与・減算", "履歴に反映される"]
    for i, s in enumerate(steps):
        x = 95 + i * 350
        d.ellipse((x, 162, x+48, 210), fill=GREEN)
        center_text(d, (x, 162, 48, 48), str(i+1), font(28, 7), PAPER)
        d.text((x+58, 172), s, font=font(21, 6), fill=INK)
    shadow_card(img, (90, 265, 285, 455), 32, PAPER, "#cfeee0")
    d.text((130, 305), "ポイント", font=font(32, 7), fill=GREEN)
    d.text((130, 380), "現在のポイント", font=font(21, 5), fill=MUTED)
    d.text((130, 420), "1,250 pt", font=font(54, 7), fill=GREEN)
    d.rounded_rectangle((130, 515, 335, 570), 20, fill=GREEN)
    center_text(d, (130, 515, 205, 55), "会員QRを表示", font(21, 7), PAPER)
    shadow_card(img, (480, 225, 385, 570), 18, "#f8fff6", GREEN_DARK)
    d.rounded_rectangle((480, 225, 865, 305), 18, fill=GREEN_DARK)
    center_text(d, (480, 230, 385, 65), "勇吉屋", font(44, 7), PAPER)
    d.text((580, 340), "会員QRコード", font=font(26, 7), fill=INK)
    draw_demo_qr(d, 570, 390, 210)
    center_text(d, (480, 628, 385, 50), "山田 由美 様", font(31, 7), INK)
    center_text(d, (480, 682, 385, 38), "会員ID：YUK-0001234", font(23, 5), INK)
    shadow_card(img, (970, 265, 360, 455), 32, PAPER, "#d8eaff")
    d.text((1020, 305), "店員用ポイント処理", font=font(28, 7), fill=BLUE)
    d.text((1020, 375), "山田 由美 様", font=font(25, 6), fill=INK)
    d.text((1020, 420), "現在 1,250pt", font=font(28, 7), fill=BLUE)
    d.rounded_rectangle((1020, 485, 1145, 545), 16, fill=BLUE)
    center_text(d, (1020, 485, 125, 60), "+100", font(26, 7), PAPER)
    d.rounded_rectangle((1160, 485, 1285, 545), 16, fill=CORAL)
    center_text(d, (1160, 485, 125, 60), "-50", font(26, 7), PAPER)
    d.rounded_rectangle((1020, 585, 1285, 645), 16, fill="#f5f7fb", outline="#d5dbe5", width=2)
    d.text((1040, 602), "理由を入力", font=font(21, 5), fill=MUTED)
    callouts = [("紙カードからの移管にも対応", GREEN), ("履歴を残すので安心", BLUE), ("誰が・いつ・なぜを記録", CORAL), ("残高だけを書き換えない設計", ORANGE)]
    x = 70
    for txt, col in callouts:
        d.rounded_rectangle((x, 835, x+330, 895), 18, fill=PAPER, outline=col, width=3)
        center_text(d, (x, 835, 330, 60), txt, font(22, 7), col)
        x += 360
    d.rounded_rectangle((260, 930, 1275, 995), 26, fill=GREEN)
    center_text(d, (260, 930, 1015, 65), "店頭オペレーションを変えすぎず、LINE化を始められます", font(28, 7), PAPER)
    return img


def slide_measurement():
    img = make_slide_bg()
    d = ImageDraw.Draw(img)
    center_text(d, (0, 38, W, 66), "採寸予約・採寸記録もLINEから", font(52, 7), GREEN_DARK)
    center_text(d, (0, 112, W, 42), "お子さまごとの採寸データを残し、買い替えや補正の相談をスムーズに", font(25, 6), INK)
    shadow_card(img, (95, 230, 330, 430), 30, PAPER, BLUE)
    d.text((145, 275), "採寸予約", font=font(38, 7), fill=BLUE)
    icon(d, "calendar", (170, 345, 120, 120), BLUE, BLUE)
    d.text((145, 500), "既存予約サイトへ移動", font=font(22, 6), fill=INK)
    d.rounded_rectangle((145, 570, 375, 630), 20, fill=BLUE)
    center_text(d, (145, 570, 230, 60), "予約する", font(25, 7), PAPER)
    shadow_card(img, (520, 195, 405, 580), 44, PAPER, "#cfeee0")
    d.rounded_rectangle((520, 195, 925, 280), 44, fill=GREEN)
    center_text(d, (520, 205, 405, 60), "採寸記録", font(38, 7), PAPER)
    d.text((570, 318), "山田 花子　中学1年", font=font(28, 7), fill=INK)
    d.text((570, 380), "最新の採寸", font=font(25, 7), fill=GREEN_DARK)
    rows = [("身長", "155cm"), ("胸囲", "78cm"), ("ウエスト", "62cm"), ("足長", "24cm")]
    for i, (k, v) in enumerate(rows):
        yy = 430 + i*64
        d.rounded_rectangle((570, yy, 875, yy+50), 14, fill="#f3fbf7")
        d.text((600, yy+10), k, font=font(22, 5), fill=INK)
        d.text((780, yy+7), v, font=font(25, 7), fill=INK)
    d.rounded_rectangle((590, 705, 855, 758), 20, fill=GREEN)
    center_text(d, (590, 705, 265, 53), "履歴を見る", font(24, 7), PAPER)
    shadow_card(img, (1010, 250, 380, 410), 30, PAPER, BLUE)
    d.text((1060, 300), "過去の記録", font=font(34, 7), fill=BLUE)
    d.text((1060, 375), "2026年 春", font=font(25, 7), fill=INK)
    d.text((1060, 430), "身長 155cm / 胸囲 78cm", font=font(20, 5), fill=MUTED)
    d.text((1060, 505), "2025年 冬", font=font(25, 7), fill=INK)
    d.text((1060, 560), "身長 148cm / 胸囲 74cm", font=font(20, 5), fill=MUTED)
    callouts = [("兄弟姉妹ごとに記録", GREEN), ("入学・進級前の確認に便利", BLUE), ("修理・補正の相談にも活用", CORAL)]
    x = 145
    for txt, col in callouts:
        d.rounded_rectangle((x, 835, x+365, 895), 18, fill=PAPER, outline=col, width=3)
        center_text(d, (x, 835, 365, 60), txt, font(23, 7), col)
        x += 425
    d.rounded_rectangle((250, 930, 1285, 995), 26, fill=GREEN)
    center_text(d, (250, 930, 1035, 65), "前回の採寸がすぐわかることで、親御さんの安心感が高まります", font(27, 7), PAPER)
    return img


def slide_engagement():
    img = make_slide_bg()
    d = ImageDraw.Draw(img)
    center_text(d, (0, 36, W, 66), "買ったあとも、LINEでつながる勇吉屋", font(52, 7), GREEN_DARK)
    center_text(d, (0, 112, W, 42), "EC・クーポン・お知らせを、会員情報と組み合わせて届けられます", font(25, 6), INK)
    phone(d, (590, 175, 360, 660))
    items = [
        ("ECサイト", "勇吉屋ネットへワンタップ", CORAL, "cart"),
        ("クーポン", "ポイント交換や来店特典に", ORANGE, "coupon"),
        ("学校・学年別配信", "必要なご家庭へだけお知らせ", BLUE, "member"),
        ("修理・補正", "相談履歴を残して安心", TEAL, "measure"),
        ("季節のリマインド", "入学・進級・衣替え前に通知", YELLOW, "calendar"),
    ]
    positions = [(100, 220), (100, 410), (100, 600), (1030, 300), (1030, 510)]
    for (title, sub, col, kind), (x, y) in zip(items, positions):
        shadow_card(img, (x, y, 390, 130), 24, PAPER, col)
        icon(d, kind, (x+25, y+33, 64, 64), col, col)
        d.text((x+112, y+27), title, font=font(28, 7), fill=col)
        d.text((x+112, y+76), sub, font=font(18, 5), fill=INK)
    d.rounded_rectangle((300, 915, 1235, 985), 28, fill=GREEN)
    center_text(d, (300, 915, 935, 70), "必要な時に思い出してもらえるLINE導線をつくります", font(30, 7), PAPER)
    return img


def slide_admin():
    img = make_slide_bg()
    d = ImageDraw.Draw(img)
    center_text(d, (0, 36, W, 66), "店舗側も見やすい管理画面で運用", font(52, 7), GREEN_DARK)
    center_text(d, (0, 112, W, 42), "会員・ポイント・採寸・配信をひとつの画面で確認できます", font(25, 6), INK)
    shadow_card(img, (250, 190, 850, 520), 30, PAPER, "#d9eadf")
    d.rounded_rectangle((250, 190, 1100, 255), 30, fill=GREEN)
    d.text((295, 208), "勇吉屋 管理画面", font=font(28, 7), fill=PAPER)
    tabs = ["会員一覧", "お子さま情報", "ポイント履歴", "採寸履歴", "クーポン管理", "お知らせ配信"]
    x = 290
    for t in tabs:
        w = text_size(d, t, font(16, 6))[0] + 22
        d.rounded_rectangle((x, 285, x+w, 322), 12, fill="#eefbf4")
        center_text(d, (x, 285, w, 37), t, font(16, 6), GREEN_DARK)
        x += w + 10
    rows = [("山田 由美", "中学1年", "1,300pt", "2026/04/05"), ("佐藤 直子", "小学5年", "850pt", "2026/03/28"), ("鈴木 恵美", "高校2年", "2,150pt", "2026/04/01")]
    y = 360
    for row in rows:
        d.rounded_rectangle((300, y, 1048, y+70), 16, fill="#f7fbff")
        d.text((330, y+20), row[0], font=font(22, 6), fill=INK)
        d.text((520, y+20), row[1], font=font(20, 5), fill=MUTED)
        d.text((700, y+20), row[2], font=font(22, 7), fill=GREEN_DARK)
        d.text((875, y+20), row[3], font=font(19, 5), fill=MUTED)
        y += 86
    ops = [("QR読み取りでポイント付与", GREEN), ("学校・学年で絞り込み", BLUE), ("紙カード移管を記録", ORANGE), ("問い合わせ・補正履歴を蓄積", CORAL)]
    for i, (txt, col) in enumerate(ops):
        y = 240 + i*110
        d.rounded_rectangle((80, y, 220, y+78), 18, fill=PAPER, outline=col, width=3)
        center_text(d, (80, y, 140, 78), txt, font(17, 7), col)
    phases = [("Phase 0", "PRデモ", "LINEメニュー・会員証・ポイント・採寸履歴"), ("Phase 1", "実運用MVP", "会員登録・店員認証・履歴管理"), ("Phase 2", "データ移行", "既存顧客・紙ポイントカード移管")]
    x = 95
    for label, title, sub in phases:
        shadow_card(img, (x, 790, 410, 100), 22, PAPER, "#dbeee4")
        d.text((x+22, 804), label, font=font(22, 7), fill=GREEN_DARK)
        d.text((x+135, 804), title, font=font(24, 7), fill=INK)
        d.text((x+22, 848), sub, font=font(16, 5), fill=MUTED)
        x += 455
    d.rounded_rectangle((190, 930, 1340, 995), 26, fill=CORAL)
    center_text(d, (190, 930, 1150, 65), "まずは見えるデモで価値を共有し、必要な連携は段階的に検討します", font(27, 7), PAPER)
    return img


def save_slides():
    PROPOSAL_ASSETS.mkdir(parents=True, exist_ok=True)
    slides = [
        ("01_cover.png", slide_cover()),
        ("02_rich_menu_flow.png", slide_menu_flow()),
        ("03_member_children.png", slide_member()),
        ("04_points_qr.png", slide_points()),
        ("05_measurement_records.png", slide_measurement()),
        ("06_ec_coupon_notice.png", slide_engagement()),
        ("07_admin_phase.png", slide_admin()),
    ]
    for name, img in slides:
        img.save(PROPOSAL_ASSETS / name, optimize=True)


def generate_rich_menu():
    outdir = RICH_OUTPUT
    outdir.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (MENU_W, MENU_H), "#f7fbff")
    d = ImageDraw.Draw(img)
    margin_x, margin_y, gap = 46, 50, 34
    cell_w = (MENU_W - 2 * margin_x - 2 * gap) // 3
    cell_h = (MENU_H - 2 * margin_y - gap) // 2
    items = [
        ("会員情報", "会員証・お子さま情報", GREEN, "member"),
        ("ポイント", "残高・履歴・QR表示", YELLOW, "point"),
        ("採寸予約", "既存予約サイトへ", BLUE, "calendar"),
        ("採寸記録", "お子さま別に確認", TEAL, "measure"),
        ("ECサイト", "勇吉屋ネットへ", CORAL, "cart"),
        ("クーポン", "特典・お知らせ", ORANGE, "coupon"),
    ]
    for i, (title, sub, col, kind) in enumerate(items):
        c, r = i % 3, i // 3
        x = margin_x + c * (cell_w + gap)
        y = margin_y + r * (cell_h + gap)
        shadow_card(img, (x, y, cell_w, cell_h), 46, col)
        d.rounded_rectangle((x+5, y+5, x+cell_w-5, y+cell_h-5), 42, outline=PAPER, width=7)
        icon(d, kind, (x+cell_w/2-150, y+125, 300, 300), col, PAPER)
        center_text(d, (x, y + cell_h*0.56, cell_w, 150), title, F["menu"], PAPER)
        center_text(d, (x, y + cell_h*0.76, cell_w, 80), sub, F["menu_sub"], PAPER)
    png = outdir / "yuukichiya_rich_menu_6_2500x1686.png"
    jpg = outdir / "yuukichiya_rich_menu_6_2500x1686_upload.jpg"
    preview = outdir / "yuukichiya_rich_menu_6_preview.png"
    img.save(png, optimize=True)
    img.save(jpg, quality=92, optimize=True, progressive=True)
    img.resize((1200, 809), Image.LANCZOS).save(preview, optimize=True)
    areas = []
    labels = ["会員情報", "ポイント", "採寸予約", "採寸記録", "ECサイト", "クーポン"]
    cols = [0, 833, 1667, 2500]
    rows = [0, 843, 1686]
    for r in range(2):
        for c in range(3):
            areas.append({
                "label": labels[r * 3 + c],
                "bounds": {"x": cols[c], "y": rows[r], "width": cols[c+1] - cols[c], "height": rows[r+1] - rows[r]},
                "action": {"type": "uri", "uri": "https://example.com/replace-me"},
            })
    payload = {
        "size": {"width": MENU_W, "height": MENU_H},
        "selected": True,
        "name": "勇吉屋 公式LINEメニュー 6分割",
        "chatBarText": "メニューをひらく",
        "areas": areas,
    }
    (outdir / "yuukichiya_rich_menu_6_tap_areas.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    # Keep production copy in line-demo in sync.
    line_menu = LINE_DEMO / "rich-menu"
    line_menu.mkdir(exist_ok=True)
    img.save(line_menu / "yuukichiya_rich_menu_6_2500x1686.png", optimize=True)
    img.save(line_menu / "yuukichiya_rich_menu_6_2500x1686_upload.jpg", quality=92, optimize=True, progressive=True)


def main():
    save_slides()
    generate_rich_menu()


if __name__ == "__main__":
    main()
