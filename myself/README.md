# Realtime GPS / WASM Telemetry

## 構成
- index.html : UI + Leaflet
- gps.js     : Geolocation API / reverse geocoding / map
- gps.wasm   : WebAssembly processing module（最小の実動WASM）

## 起動
Geolocation は `file://` ではなく HTTPS または localhost が必要です。

例:
python3 -m http.server 8000

その後:
http://localhost:8000/

## 取得データ
緯度、経度、高度、向き、速度、GPS精度、時刻を
`watchPosition()` でリアルタイム更新します。

住所は「UPDATE ADDRESS」ボタンで Nominatim の reverse geocoding API
を呼び出します。公開APIなので、連続自動リクエストは避けています。

## 注意
- Heading は端末・ブラウザ・センサーによって `N/A` になることがあります。
- 高度は端末GPSから取得できない場合があります。
- 高度を別の標高APIで補正する実装は次の拡張候補です。
- 地図タイルと住所APIはオンライン接続が必要です。
