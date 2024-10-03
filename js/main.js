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

	// Sticky Note Map追加
	add_Sticky_Note_Map();

	// 現在地取得
	ZoomLv = map.getZoom();
	//初期ズームレベルの時は、現在地ジャンプ
	if (ZoomLv == 1){
		// 1.0秒遅延してジャンプ
		setTimeout(
			function(){
				navigator.geolocation.getCurrentPosition(getLocation);
			},1000
		);
	}


	// 最新投稿のイベントリスナー追加
	const detailsElement = document.getElementById('newContents');

	detailsElement.addEventListener('toggle', () => {
		if (detailsElement.open) {
			// 最新投稿の更新
			Update_ShareInfo();
		}
	});

});

//#################マップコントロール（画面制御）#################
map.doubleClickZoom.disable();
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();
//#################マップコントロール（画面制御）#################


//#################マップコントロール（ツール）#################
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

//#################マップコントロール（ツール）#################



