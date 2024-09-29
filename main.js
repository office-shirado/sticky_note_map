const updateAccessCount_URL = "https://chosashi-data.org/amx/sticky_note_map/map/db/update_Access_Count.php";
const getAccessCount_URL = "https://chosashi-data.org/amx/sticky_note_map/map/db/get_Access_Count.php";
const getData_URL = "https://chosashi-data.org/amx/sticky_note_map/map/db/get_share_info.php";
const getList_URL = "https://chosashi-data.org/amx/sticky_note_map/map/db/get_List.php";
const confirm_ID_URL = "https://chosashi-data.org/amx/sticky_note_map/map/db/confirm_ID.php";
const add_share_info_URL = "https://chosashi-data.org/amx/sticky_note_map/map/db/add_share_info.php";
const delete_share_info_URL = "https://chosashi-data.org/amx/sticky_note_map/map/db/delete_share_info.php";
const update_PopupCount_URL = "https://chosashi-data.org/amx/sticky_note_map/map/db/update_PopupCount.php";
const update_NiceCount_URL = "https://chosashi-data.org/amx/sticky_note_map/map/db/update_NiceCount.php";

var data_Lng = "";
var data_Lat = "";
var ZoomLv = "";

function Flyto_Point(data_Lng, data_Lat,ZoomLv){
	map.flyTo({
	  center: [data_Lng, data_Lat], 
	  zoom: ZoomLv,
	  speed: 2.5,
	  curve: 1
	})
	const screenWidth = window.innerWidth;
	setTimeout(function(){
		if(screenWidth < 700){
			const detailsElement = document.getElementById('newContents');
			detailsElement.open = false;	
		}
	},500)
}

var user = "";
var Lng = "";
var Lat = "";
var data = "";

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

response = fetch(updateAccessCount_URL)

async function updateCount() {
	try {
		const response = await fetch(getAccessCount_URL);
		const count = await response.json();
		document.getElementById('Count').textContent = numberWithCommas(count[0].Count) + ' PV';
	}
	catch (error) {
		console.error('Error fetching data:', error);
	}
}

updateCount()

var Latest_ID = ""
var Get_ID=""

async function Update_ShareInfo() {
  try {
	await fetch(confirm_ID_URL)
		.then(response => response.json())
		.then(data => {
			Get_ID = data[0].ID;
			if(Latest_ID != Get_ID){
				getShareInfo();
			}
			else
			{
			console.log("投稿更新しない");
			}
		})

  } catch (error) {
	console.error("サーバーエラー", error);
  }
}

function delete_Share_Info(ID) {
	if (confirm('本当に削除しますか？')) {
		fetch(delete_share_info_URL, {
			method: 'POST',
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			body: 'ID=' + ID
		})
		console.log("投稿を削除しました。ID:"+ ID);
		Limit21_PopUp01.remove();
		getShareInfo();
	}
}

function getShareInfo() {

	if (map.getSource('Limit12_Share_Info')) {
		// レイヤ削除
		map.removeLayer('Limit12_Share_Info')
		map.removeLayer('Limit12_Share_Info_Label')
		map.removeLayer('Limit12_Share_Info_Cluster')
		map.removeLayer('Limit12_Share_Info_Cluster_Label')
		// ソース削除
		map.removeSource('Limit12_Share_Info');
	}

	setTimeout(function(){
		fetch(getData_URL)
			.then(response => response.json())
			.then(data => {
				disp_point_limit12(data);
		}),
		fetch(getList_URL)
			.then(response => response.json())
			.then(data => {
//				console.log(data);

				const tableBody = document.getElementById('infoTable').querySelector('tbody');
				tableBody.innerHTML = ''; // 既存の行をクリア

				data.forEach(row => {
					const newRow = document.createElement('tr');
					const truncatedInfo = row.Info.length > 30 ? row.Info.substring(0, 30) + '...' : row.Info;
					newRow.innerHTML = `
						<td class="yubi" onclick="Flyto_Point('${row.Lng}', '${row.Lat}',17)">${truncatedInfo}<br><small>(ID:${row.ID}) ${row.PostDateTime}<small></td>
					`;
//				console.log(data);
					tableBody.appendChild(newRow);
				});
		})
		console.log("【リミット１２】リスト表示完了");
	},500);	// 500:0.5秒
}

// ポイントの表示（リミット１２）
var share_info_features = [];

function disp_point_limit12(data) {
	share_info_features = [];

//	console.log(data);// ここで中身を確認
	var latlng;
	var description;

	var ilen=data.length;

	for(var i=0; i<ilen; i++){
		var feature = [];

		var point = [];
		point = {
			type: 'Feature',
			properties: {
				'ID': data[i].ID,
				'User': data[i].User,
				'Share_Info': data[i].Info,
				'URL': data[i].URL,
				'Share_Info_Label': data[i].Info.length > 30 ? data[i].Info.substring(0, 30) + '...' : data[i].Info,
				'NiceCount': data[i].NiceCount,
				'PostDateTime': data[i].PostDateTime,
				'TermDateTime': data[i].TermDateTime,
				'MaxTermDateTime': data[i].MaxTermDateTime
			},
			geometry: {
				type: 'Point',
				coordinates: [data[i].Lng, data[i].Lat]
			}
		};
		share_info_features.push(point);

		// 最新情報のIDを入れる
		Latest_ID = data[i].ID;
	}


	var geojson = {
		type: "FeatureCollection",
		features: share_info_features
	};

	map.addSource("Limit12_Share_Info", {
		"type": "geojson",
		"data": geojson,
		"cluster": true,
		"clusterMaxZoom": 14, // クラスタリングを行う最大ズームレベル
	});


	// クラスター（円）
	map.addLayer({
		'id': 'Limit12_Share_Info_Cluster',
		'type': 'circle',
		'source': 'Limit12_Share_Info',
		'layout': {
		},
		paint: {
			'circle-radius': 20.0,  //半径
			'circle-color': 'rgba(0, 0, 255, 0.5)',
			'circle-stroke-color': 'rgba(255,255,255,0.5)', // ラベルの外枠の色を白に設定
			'circle-stroke-width': 2.0, // ラベルの外枠の幅を2に設定
			'circle-opacity': 1.0,
		},
		'minzoom': 0,
		'maxzoom': 14,
	});

	// クラスター（ラベル）
	map.addLayer({
		'id': 'Limit12_Share_Info_Cluster_Label',
		'type': 'symbol',
		'source': 'Limit12_Share_Info',
		'layout': {
//			'text-field': ['get', 'Share_Info_Label'],
			"text-field": ["get", "point_count_abbreviated"],
			"text-font": ["Noto Sans CJK JP Bold"],
//			'text-anchor': 'left',
//			'text-offset': [0.5, 0],
		},
		'paint': {
			'text-color': 'rgba(0, 0, 255, 1)',
			'text-halo-color': 'rgba(255,255,255,1)', // ラベルの外枠の色を白に設定
			'text-halo-width': 2.0, // ラベルの外枠の幅を2に設定
		},
		'minzoom': 0,
		'maxzoom': 14,
	});


	// 投稿ポイント
	map.addLayer({
		'id': 'Limit12_Share_Info',
		'type': 'circle',
		'source': 'Limit12_Share_Info',
		'layout': {
		},
		paint: {
			'circle-radius': 3.5,  //半径
			'circle-color': 'rgba(0, 0, 255, 1)',
			'circle-stroke-color': 'rgba(255,255,255,1)', // ラベルの外枠の色を白に設定
//			'circle-stroke-width': 2.0, // ラベルの外枠の幅を2に設定
			"circle-stroke-width": ["step", ["zoom"],
						0.0, 4,
						0.2, 13,
						2.0
			],
			'circle-opacity': 1.0,
		},
		'minzoom': 14,
		'maxzoom': 24,
	});


	// 投稿ポイント（ラベル）
	map.addLayer({
		'id': 'Limit12_Share_Info_Label',
		'type': 'symbol',
		'source': 'Limit12_Share_Info',
		'layout': {
			'text-field': ['get', 'Share_Info_Label'],
			"text-font": ["Noto Sans CJK JP Bold"],
			'text-anchor': 'left',
			'text-offset': [0.5, 0],
		},
		'paint': {
			'text-color': 'rgba(0, 0, 255, 1)',
			'text-halo-color': 'rgba(255,255,255,1)', // ラベルの外枠の色を白に設定
			'text-halo-width': 2.0, // ラベルの外枠の幅を2に設定
		},
		'minzoom': 14,
		'maxzoom': 24,
	})
}

setInterval(Update_ShareInfo, 1000 * 60);

var map = new maplibregl.Map({
  container: 'map',
  hash: true,
  style:{
	"version":8,
	"name":"Optimal_GSI_Shirado",
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


//ジャンプ（現在地）
function getLocation(getLatLng) {
	map.flyTo({
	  center: [getLatLng.coords.longitude, getLatLng.coords.latitude], 
	  zoom: 17,
	  speed: 2.5,
	  curve: 1
	});
};


map.on('load', function () {

	// ソース追加
	addSources();

	// レイヤ追加
	addLayers();


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

	// 投稿
	getShareInfo();

	// 最新投稿のイベントリスナー追加
	const detailsElement = document.getElementById('newContents');

	detailsElement.addEventListener('toggle', () => {
		if (detailsElement.open) {
			// 最新投稿の更新
			Update_ShareInfo();
		}
	});

});

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



//################# クリックイベント #################
// ポップアップ
var Limit21_PopUp01 = new maplibregl.Popup()
var PopupFlg = false;

function update_PopupCount(e) {

	var ID = e.features[0].properties['ID'];

	// PopupCount追加
	fetch(update_PopupCount_URL, {
		method: 'POST',
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		body: 'ID=' + ID
	})

	console.log("ポップアップ（１２分追加）");

	for (var i = 0; i < share_info_features.length; i++) {
		if (share_info_features[i].properties.ID === ID) {
			// 期限日時
			var TermDateTime = new Date(share_info_features[i].properties.TermDateTime);	// TermDateTimeをDateオブジェクトに変換
			TermDateTime.setMinutes(TermDateTime.getMinutes() + 12);			// 12分加算
			share_info_features[i].properties.TermDateTime = TermDateTime.toISOString();	// 更新されたTermDateTimeをfeatures配列に反映し、ISO形式で保存
		}
	}

	var geojson = {
		type: "FeatureCollection",
		features: share_info_features
	};

	map.getSource('Limit12_Share_Info').setData(geojson);



};

function update_NiceCount(ID) {

	// PopupCount追加
	fetch(update_NiceCount_URL, {
		method: 'POST',
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		body: 'ID=' + ID
	})

	const NiceCountElement = document.getElementById("NiceCount");
	let CurrentNiceCount = parseInt(NiceCountElement.textContent); // テキストを数値に変換
	CurrentNiceCount++;
	NiceCountElement.textContent = CurrentNiceCount;
	console.log("いいね！（カウント、１時間追加）");
};

// ミリ秒から時間・分にする
function MilliToTime(MilliSeconds) {
	const Seconds = Math.floor(MilliSeconds / 1000);
	const Minutes = Math.floor(Seconds / 60);
	const Hours = Math.floor(Minutes / 60);
	const RemainingMinutes = Minutes % 60;
	const RemainingSeconds = Seconds % 60;
	return `${Hours} h ${RemainingMinutes} m`;
}


// Limit12
function Popup_Limit12(e) {

    PopupFlg = false;

    var ID = e.features[0].properties['ID'];
    var Popup_Limit12_User = e.features[0].properties['User'];
    var Popup_Limit12_Info = e.features[0].properties['Share_Info'];
    var Popup_Limit12_URL = e.features[0].properties['URL'];
    var Popup_Limit12_Lng = e.features[0].geometry.coordinates[0];
    var Popup_Limit12_Lat = e.features[0].geometry.coordinates[1];
    var Popup_Limit12_PostDateTime = e.features[0].properties['PostDateTime'];
    var Popup_Limit12_TermDateTime = e.features[0].properties['TermDateTime'];
    var Popup_Limit12_MaxTermDateTime = e.features[0].properties['MaxTermDateTime'];
    var Popup_Limit12_NiceCount = e.features[0].properties['NiceCount'];


	// 表示期間の終了日時をDateオブジェクトに変換
	var TermDateTime = new Date(Popup_Limit12_TermDateTime);

	// 残り時間を計算し、表示（必要であれば）
	var now = new Date();
	var MilliSeconds = TermDateTime - now;
	var RemainingTime = MilliToTime(MilliSeconds)





    ZoomLv = map.getZoom();

	// PopupCount追加（12分追加）
	update_PopupCount(e);


	let infoContent = Popup_Limit12_Info;
	if ( Popup_Limit12_URL !==" " ) {
		infoContent = `<a href="${Popup_Limit12_URL}" target="_blank">${Popup_Limit12_Info}</a>`;
	}else{
		if (Popup_Limit12_Info.startsWith("https://")) {
			infoContent = `<a href="${Popup_Limit12_Info}" target="_blank">${Popup_Limit12_Info}</a>`;
		}
	}

    Limit21_PopUp01.remove();	// ポップアップ削除
    Limit21_PopUp01 = new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
			'<span><b>' + '<big>' + infoContent + '</big>' + '</b></span>' + '<br>' +
			'</span></b><span><b>' + 'from ' + Popup_Limit12_User + '</b></span>' + '<br>' +
			'<span> at </span><span id = "PostDateTime">' + Popup_Limit12_PostDateTime + '</span><span> </span>' +
			'<button id="delete_share_info_Button" class="sendButton" onclick="delete_Share_Info(' + ID + ')"><b>Delete</b></button>' + '<br>' + 
			'<span  class="nice" id = "NiceButton"><b>' + 'Like </b></span><b><span>（</span><span id = "NiceCount">' + Popup_Limit12_NiceCount + '</span><span>）</span></b>' +
			'<span><span id = "RemainingTime">' + RemainingTime + '</span> left<br>' +
			'<hr>' +
			"<a href='https://www.google.co.jp/maps?q=" + Popup_Limit12_Lat + "," + Popup_Limit12_Lng + "&hl=ja' target='_blank'>Google Maps</a> / " +
			"<a href='https://www.google.com/maps/@?api=1&map_action=pano&parameters&viewpoint=" + Popup_Limit12_Lat + ",%20" + Popup_Limit12_Lng + "' target='_blank'>Google Street View</a><br>"
	).addTo(map);

	document.getElementById("NiceButton").addEventListener("click", function() {
		if( !PopupFlg ){
			update_NiceCount(ID);

			PopupFlg= true;

			// 表示期間の終了日時をDateオブジェクトに変換
			var TermDateTime = new Date(Popup_Limit12_TermDateTime);
			var MaxTermDateTime = new Date(Popup_Limit12_MaxTermDateTime);

			// 1時間後の日時を計算
			TermDateTime.setHours(TermDateTime.getHours() + 1);

			// 残り時間を計算し、表示
			if(MaxTermDateTime > TermDateTime){
				var now = new Date();
				var MilliSeconds = TermDateTime - now;
				var RemainingTime = MilliToTime(MilliSeconds);

				// 残り時間を適切な形式で表示する処理（ミリ秒を日時に変換など）
				document.getElementById("RemainingTime").textContent = RemainingTime;


				for (var i = 0; i < share_info_features.length; i++) {
					if (share_info_features[i].properties.ID === ID) {
						// いいね！カウント
						share_info_features[i].properties.NiceCount = parseInt(share_info_features[i].properties.NiceCount) + 1;	// いいね！カウント+1

						// 期限日時
						var TermDateTime = new Date(share_info_features[i].properties.TermDateTime);	// TermDateTimeをDateオブジェクトに変換
						TermDateTime.setHours(TermDateTime.getHours() + 1);				// 1時間加算
						share_info_features[i].properties.TermDateTime = TermDateTime.toISOString();	// 更新されたTermDateTimeをfeatures配列に反映し、ISO形式で保存
					}
				}

				var geojson = {
					type: "FeatureCollection",
					features: share_info_features
				};

				map.getSource('Limit12_Share_Info').setData(geojson);
			}
		}
	});
};

// クリック属性表示（Limit12）【Point】
map.on('click', 'Limit12_Share_Info', (e) => {
	Popup_Limit12(e);
});

// クリック属性表示（Limit12）【Text】
map.on('click', 'Limit12_Share_Info_Label', (e) => {
	Popup_Limit12(e);
});



// クリック属性表示（Limit12）【Cluster_Circle】
map.on('click', 'Limit12_Share_Info_Cluster', (e) => {

	const screenWidth = window.innerWidth;	// 画面幅を取得

	// 画面幅に応じて拡大スピードを調整
	if( screenWidth < 700){
		ZoomLv = map.getZoom() + 3;
	}else{
		ZoomLv = map.getZoom() + 4;
	}

	// Clickした地点の座標
//	data_Lng = e.lngLat.lng;
//	data_Lat = e.lngLat.lat;

	// クラスタリング地物（Features）の中心座標
	data_Lng = e.features[0].geometry.coordinates[0];
	data_Lat = e.features[0].geometry.coordinates[1];


	Flyto_Point(data_Lng, data_Lat,ZoomLv);
});


//################# クリックイベント #################



//################# ポップアップ（ダブルクリック） #################
var popup_contextmenu = new maplibregl.Popup();
var LongTouch_Flg = false ;

var db_user = "";
var db_Lng = "";
var db_Lat = "";
var db_share_info = "test";
var db_POST_Lng = "";
var db_POST_Lat = "";


// POPUPから登録・参照
function add_share_info(){
	db_share_info = document.getElementById("db_share_info").value;
	db_share_info_URL = document.getElementById("db_share_info_URL").value;

	if( db_share_info !== "" || db_share_info_URL !== "" ){
		popup_contextmenu.remove();

		if( db_share_info === "" ){
			db_share_info = db_share_info_URL;
		}

		// DB登録
		fetch(add_share_info_URL, {
			method: 'POST',
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			body: 'db_user=' + db_user + '&db_share_info=' + db_share_info + '&db_share_info_URL=' + db_share_info_URL + '&db_Lng=' + db_Lng + '&db_Lat=' + db_Lat
		})
		.then(getShareInfo())

		console.log('データベースに登録完了');
	}else{

		alert("コメントが入力されていません。");
	}

}


function PopUp_Context_Menu(e){
    ZoomLv = map.getZoom();

    db_user = "guest";
    db_Lng = e.lngLat.lng;
    db_Lat = e.lngLat.lat;

    // POPUPの削除
    popup_contextmenu.remove();
    Limit21_PopUp01.remove();

    popup_contextmenu = new maplibregl.Popup({closeButton: false})
        .setLngLat(e.lngLat)
        .setHTML(
		    '<div id="contextmenu" style="width: 250px;">' +
			"<b>【投稿】（100文字以内）</b><br>" + 
			"<input type='hidden' name='db_user' value='" + db_user + "'>" +
			"<input type='hidden' name='db_Lng' value='" + db_Lng + "'>" +
			"<input type='hidden' name='db_Lat' value='" + db_Lat + "'>" +
			"<input  type='text'class='share_info' id='db_share_info' name='db_share_info' placeholder='コメント又はＵＲＬ'  maxlength='100'>　" + " " +
			"<button id='share_info_Button' class='sendButton' onclick='add_share_info()'><b>ＰＯＳＴ</b></button><br>" + 
			"<small>リンク </small><input  type='text'class='share_info' id='db_share_info_URL' name='db_share_info_URL' placeholder='ＵＲＬ'  maxlength='100'>　" + "<br>" +
			"<hr>" + 
			"<a href='https://www.google.co.jp/maps?q=" + e.lngLat.lat + "," + e.lngLat.lng + "&hl=ja' target='_blank'>【GoogleMap】</a>" + 
			"<a href='https://www.google.com/maps/@?api=1&map_action=pano&parameters&viewpoint=" + e.lngLat.lat + ",%20" + e.lngLat.lng + "' target='_blank'>【ストリートビュー】</a><br>" +
		    '</div>'
	);
    popup_contextmenu.addTo(map);


    const textBox = document.getElementById('db_share_info');
    textBox.focus();


}
//################# ポップアップ（ダブルクリック） #################


//################# ダブルクリックメニュー #################
var DoubleClick_Flg = false ;
map.on('click', function (e) {

	popup_contextmenu.remove();

	if (DoubleClick_Flg) {
		// ダブルクリックとみなす処理
//		console.log('ダブルクリックされました！');
		PopUp_Context_Menu(e);	// 右クリックメニューの呼び出し
		DoubleClick_Flg = false; // 次のクリックに備えて状態をリセット
	} else {
		DoubleClick_Flg = true;
		setTimeout(() => {
			DoubleClick_Flg = false; // 一定時間後に状態をリセット
		}, 300); // 300ミリ秒後にリセット
	}
});
//################# ダブルクリックメニュー #################



//################# マウスイベント（カーソル制御） #################
var Popup_Layers_Name ="";
//マウスイベント【Limit12_Share_Info上で動いている場合】
map.on('mousemove', 'Limit12_Share_Info', (e) => {
	map.getCanvas().style.cursor = 'pointer'
});

//マウスイベント【Limit12_Share_Info_Label上で動いている場合】
map.on('mousemove', 'Limit12_Share_Info_Label', (e) => {
	map.getCanvas().style.cursor = 'pointer'
});

//マウスアウトイベント（Limit12_Share_Info）【元に戻す】
map.on('mouseleave','Limit12_Share_Info', function() {
	map.getCanvas().style.cursor = '';
});

//マウスアウトイベント（Limit12_Share_Info_Label）【元に戻す】
map.on('mouseleave','Limit12_Share_Info_Label', function() {
	map.getCanvas().style.cursor = '';
});


//マウスイベント【Limit12_Share_Info_Cluster上で動いている場合】
map.on('mousemove', 'Limit12_Share_Info_Cluster', (e) => {
	map.getCanvas().style.cursor = 'pointer'
});

//マウスアウトイベント（Limit12_Share_Info_Cluster）【元に戻す】
map.on('mouseleave','Limit12_Share_Info_Cluster', function() {
	map.getCanvas().style.cursor = '';
});



//マウスイベント【ドラッグ】
map.on('drag', function () {
	//グラッビングに変更（つかむ）
	map.getCanvas().style.cursor = 'grabbing';
});

//マウスイベント【ムーブエンド】
map.on('moveend', function () {
	map.getCanvas().style.cursor = '';	//元に戻す
});

//################# マウスイベント（カーソル制御） #################


//################# 画面移動 #################
map.on('movestart', function () {
	//Popup削除
//	popup_contextmenu.remove();

});
//################# 画面移動 #################
