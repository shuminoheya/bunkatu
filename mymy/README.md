# GPS Telemetry - GitHub Pages版

このフォルダをそのままGitHub Pagesの公開ディレクトリに置いてください。

## ファイル
- index.html
- gps.js
- gps.wasm

## GitHub Pages
1. GitHubリポジトリを作成
2. 3ファイルを同じ階層へアップロード
3. Settings → Pages
4. Deploy from a branch
5. main / root を選択
6. 公開された HTTPS URL を開く
7. ブラウザの位置情報を許可

## 機能
- 通常モード
- ✈️ 飛行機モード
- 🚆 電車モード
- 緯度 / 経度
- GPS高度 m / ft
- 速度
- GPS精度
- GPS進行方向
- 端末方位センサー
- OpenCage住所取得
- Leaflet地図
- 北 / 南 / 西 / 東による地図範囲指定
- GPS自動追従 ON/OFF
- 現在地へ移動
- 範囲指定解除
- LIVE LOG

## 注意
Geolocation API は HTTPS のページで使用してください。
GitHub Pages は HTTPS なので対応しています。

gps.wasm は小さなWASM処理モジュールです。
GPSの取得そのものはブラウザのGeolocation APIを使用します。

OpenCage APIキーはクライアント側から見えるため、公開運用時はOpenCage側で利用元ドメインを制限してください。


## WASM
40バイトのダミーではなく、実際にGPS数値処理を行うWASMを搭載。`geo_distance_m`、`ms_to_kmh`、`m_to_ft`、`calc_speed`、`valid_latlon` をJSから呼び出します。WASM取得失敗時はJSフォールバックします。


## 表示変更
向き（heading）は角度だけ表示し、後ろの「(GPS)」「(端末コンパス)」などの括弧表示を削除しました。


## ボタン修正版
ボタンを個別にイベント登録し、初期化エラーで全ボタンが無反応になる問題を防止。ボタンには type=button を付与し、LIVE LOGへイベント登録状況を出力します。
