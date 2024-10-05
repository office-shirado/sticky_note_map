var map = new maplibregl.Map({
    container: 'map',
    style: 'https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json', // 地図のスタイル
    center: [139.68786, 35.68355], // 中心座標
    zoom: 1, // ズームレベル
});

// Sticky Note Map追加
map.on('load', function () {
	Sticky_Note_Map_Language = "jp";		// 言語指定（デフォルト:英語、jp：日本語）
	add_Sticky_Note_Map();

	// 現在地取得
	ZoomLv = map.getZoom();
	//初期ズームレベルの時は、現在地ジャンプ
	if (ZoomLv == 1){
		// 1.0秒遅延してジャンプ
		setTimeout(
			function(){
				navigator.geolocation.getCurrentPosition(Sticky_Note_Map_Flyto_Location);	// Sticky_Note_Map関数
			},1000
		);
	}
});

// ダブルクリックズーム制御
map.doubleClickZoom.disable();



const draw = new MaplibreTerradrawControl({
        modes: [
            'point',
            'linestring',
            'polygon',
            'rectangle',
            'angled-rectangle',
            'circle',
            'freehand',
            'select'
        ],
        open: true,
    });
    map.addControl(draw, 'top-right');


