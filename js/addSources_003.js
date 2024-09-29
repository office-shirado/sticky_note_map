// ソース設定
function addSources() {
        // OSM（ラスター）
	map.addSource("OSM_Raster", {
		type: "raster",
                tiles: ['https://tile.openstreetmap.jp/{z}/{x}/{y}.png'],
//		minzoom: 0,
//		maxzoom: 18,
		tileSize: 256,
                attribution:"<a href='https://www.openstreetmap.org/copyright'>&copy; OpenStreetMap contributors</a>"
	});

        // OSM（ベクトル）
	map.addSource("OSM_Vector", {
		type: "vector",
		tiles: ['https://tile.openstreetmap.jp/data/planet/{z}/{x}/{y}.pbf'],
		minzoom: 14,
		maxzoom: 14,
		attribution:"<a href='https://www.openstreetmap.org/copyright'>&copy; OpenStreetMap contributors</a>"
	});

};