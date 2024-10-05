var map = new maplibregl.Map({
  container: 'map',
  hash: true,
  style:{
	"version":8,
	"name":"Sticky_Note_Map_Shirado",
	"glyphs": "https://glyphs.geolonia.com/{fontstack}/{range}.pbf",
	"sprite":"https://gsi-cyberjapan.github.io/optimal_bvmap/sprite/std",
	"sources":{
	},
	"layers":[
	]
  },
  center: [139.75417,36.50],
  zoom: 1,
  minZoom: 1,
  maxZoom: 23,
});



map.on('load', function () {



	// ソース追加
	addSources();

	// レイヤ追加
	addLayers();

	//################# Sticky Note Map #################
	// Sticky Note Mapオプション
	Sticky_Note_Map_User = "Guest";			// ユーザー指定
	Sticky_Note_Map_Font = "Noto Sans CJK JP Bold";	// フォント指定
	Sticky_Note_Map_Language = "jp";		// 言語指定（デフォルト:英語、jp：日本語）
	Sticky_Note_Map_PV_Target_ID = "PV_Count";	// PV数を表示するターゲット（ID）
	Sticky_Note_Map_List_Target_ID = "newContents";	// リスト（10）を表示するターゲット（ID）


	// Sticky Note Map追加
	add_Sticky_Note_Map();
	//################# Sticky Note Map #################


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

//################# マップコントロール（画面制御） #################
map.doubleClickZoom.disable();
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();
//################# マップコントロール（画面制御） #################


//################# マップコントロール（ツール） #################
//ジオコーダー
const geocoderApi = {
        forwardGeocode: async (config) => {
            const features = [];
            try {
                const request =
            `https://nominatim.openstreetmap.org/search?q=${
                config.query
            }&format=geojson&polygon_geojson=1&addressdetails=1`;
                const response = await fetch(request);
                const geojson = await response.json();
                for (const feature of geojson.features) {
                    const center = [
                        feature.bbox[0] +
                    (feature.bbox[2] - feature.bbox[0]) / 2,
                        feature.bbox[1] +
                    (feature.bbox[3] - feature.bbox[1]) / 2
                    ];
                    const point = {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: center
                        },
                        place_name: feature.properties.display_name,
                        properties: feature.properties,
                        text: feature.properties.display_name,
                        place_type: ['place'],
                        center
                    };
                    features.push(point);
                }
            } catch (e) {
                console.error(`Failed to forwardGeocode with error: ${e}`);
            }

            return {
                features
            };
        }
    };
    map.addControl(
        new MaplibreGeocoder(geocoderApi, {
            maplibregl
        })
    );


// 現在位置表示
map.addControl(new maplibregl.GeolocateControl({
	positionOptions: { enableHighAccuracy: true },
	fitBoundsOptions: { maxZoom: 20 },
	trackUserLocation: true,
	showUserLocation: true
	}), 
    	'top-right'
);

//################# マップコントロール（ツール） #################



