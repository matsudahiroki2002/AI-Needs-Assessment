# AI Wrapper FastAPI Backend

Next.js 向けの「AI Wrapper 仮想ユーザー調査AI」UI と接続できる FastAPI バックエンドです。OpenAI GPT を利用して簡易的な反応テキストやソフト指標を生成しつつ、統計値は `services/statkit.py` に集約された擬似アルゴリズムで算出しています。後から本番ロジックに差し替えやすいモジュラー構造を採用しています。

## セットアップ

```bash
python -m venv .venv && source .venv/bin/activate
pip install -U pip
pip install -e .
uvicorn app.main:app --reload --port 8000
# → http://127.0.0.1:8000/docs
```

### 環境変数

`.env` または環境変数で以下を設定してください。

```
OPENAI_API_KEY=sk-...
MODEL_CHAT=gpt-4o-mini  # 省略時は gpt-4o-mini
```

### 主要パッケージ

- FastAPI + uvicorn
- OpenAI Python SDK (`from openai import OpenAI`)
- pydantic-settings
- numpy / tenacity

## ディレクトリ構成

```
app/
  main.py                # FastAPI エントリーポイント
  core/config.py         # 設定管理
  api/routes.py          # REST ルータ
  schemas/               # Pydantic スキーマ
  services/              # GPTアダプタ、statkit、シミュレーション等
  data/seed.py           # 開発用シードデータ
  utils/json_safety.py   # JSON 安全化ユーティリティ
tests/
  test_smoke.py          # スモークテスト
```

## API ハイライト

- `GET /health` : ヘルスチェック
- `GET /ideas` / `POST /ideas` : 案の取得・作成
- `POST /ideas/score` : GPT で反応を推定 → psf/pmf, CI, 寄与分解を返却
- `GET /ideas/{id}/reactions` : 擬似反応の取得
- `POST /simulate` : A/B/C 勝率・レンジ算出

レスポンス構造はフロントの `lib/apiClient.ts` が想定する型と互換です。

## UI との接続

Next.js 側で以下を設定します。

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

`lib/apiClient.ts` のモック呼び出しを `fetch` (または axios) に置換し、 `/ideas`, `/ideas/score`, `/simulate` を本APIに向けてください。

## テスト

```bash
pytest
```

テストでは OpenAI コールをスタブ化して擬似値で検証しています。

## コスト・運用上の工夫

- デフォルトモデルは `gpt-4o-mini`。温度0.4 & max_tokens 180。
- `services/gpt_adapter.py` 内でメモ化（最大 50 件）と 1 分あたりの呼び出し制限を実装。
- 統計ロジックは `services/statkit.py` に集約しており、後からデータサイエンスモデルに差し替え可能。

## 今後の拡張

- `gpt_adapter.py` を差し替えるだけで別ベンダー接続が可能。
- `store.py` をデータベース実装に置き換える際も API シグネチャは維持。
- `statkit.py` のヒューリスティックを実測値計算へ置換。

---

### ユーザー側ですべきこと
- `.env` を作成し `OPENAI_API_KEY=...` を設定
- `uvicorn app.main:app --reload --port 8000` でAPI起動
- Next.js 側の `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` を設定
- フロントの `lib/apiClient.ts` を `/ideas`, `/ideas/score`, `/simulate` に向けてテスト
- `/ideas/score` に1件だけ投げてカードが更新されるか確認
- 負荷テスト前に `MODEL_CHAT=gpt-4o-mini` で固定し、`temperature=0.4` のまま
- コスト監視のため、ログレベルINFOでAPI呼び出し回数を記録
