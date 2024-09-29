//レイヤ設定

function addLayers() {
// ########## OSM（ラスター） ##########
	map.addLayer({
		'id': 'OSM_Raster',
		'type': 'raster',
		'source': 'OSM_Raster',
		'minzoom': 0,
		'maxzoom': 24,
	});
// ########## OSM（ラスター） ##########

// ########## OSM（ベクトル） ##########
	// POI（ポイント）
	map.addLayer({
		'id': 'OSM_POI',
		'type': 'circle',
		'source': 'OSM_Vector',
		'source-layer': 'poi',
		'filter': ['has', 'name'], // nameプロパティが存在するフィーチャーのみを表示
		'layout': {
			'visibility': 'visible',
		},
		'paint': {
			'circle-radius': 3.5,  //半径
			'circle-color': '#00ffff',
			'circle-opacity': 1.0,
		},
		'minzoom': 17,
		'maxzoom': 24,
	});


	// Places（テキスト）
	map.addLayer({
		'id': 'OSM_POI_Label',
		'type': 'symbol',
		'source': 'OSM_Vector',
		'source-layer': 'poi',
		'filter': ['has', 'name'], // nameプロパティが存在するフィーチャーのみを表示
		'layout': {
			'text-field': ['get', 'name'],
//			'text-font': ['Open Sans Semibold'],
			'text-font': ['Noto Sans CJK JP Bold'],
//			'text-font': ['Open Sans Semibold'],
			'text-anchor': 'left',
			'text-offset': [0.5, 0],
			'visibility': 'visible',
		},
		'paint': {
			'text-color': 'rgba(255, 255, 255, 0.7)',
			'text-halo-color': 'rgba(0,0,0,0.7)', // ラベルの外枠の色を黒に設定
			'text-halo-width': 1.0, // ラベルの外枠の幅を1.0に設定
		},
		'minzoom': 17,
		'maxzoom': 24,
	});
// ########## OSM（ベクトル） ##########

};