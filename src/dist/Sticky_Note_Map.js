const API_URL = "https://chosashi-data.org/amx/sticky_note_map/api_test/";
var ID = 0;
var Sticky_Note_Map_Access_Count = 0;
var Sticky_Note_Map_Latest_ID = 0;
var Sticky_Note_Map_User = "Guest";
var Sticky_Note_Map_Font = "";
var Sticky_Note_Map_PV_Target_ID ="";
var Sticky_Note_Map_Language = "en";
var Sticky_Note_Map_List_Flg = false;
var Sticky_Note_Map_List_Target_ID = "";

var DoubleClick_Flg = false ;
var Sticky_Note_Map_features = [];

var Popup_Sticky_Note_Map01 = new maplibregl.Popup()	// 属性表示
var Popup_Sticky_Note_Map02 = new maplibregl.Popup()	// ダブルクリック

var Popup_Text_User = "from";
var Popup_Text_PostDateTime = "at";
var Popup_Text_Delete_Button = "Delete";
var Popup_Text_Nice = "Like";
var Popup_Text_GoogleMaps = "Google Maps";
var Popup_Text_StreetView = "Google Street View";
var Popup_Text_Description = "Post (within 100 characters)";
var Popup_Text_Post_Button = "POST";
var Popup_Text_Placeholder = "Comment or URL";
var Popup_Text_Link = "URL";
var Alert_Text_Delete = "Are you sure you want to delete this?";
var Alert_Text_Post01 = "Please enter a comment.";


//################# 桁表示（1000→1,000） #################
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
//################# 桁表示（1000→1,000） #################


//################# ミリ秒から時間・分に変換 #################
function MilliToTime(MilliSeconds) {
	const Seconds = Math.floor(MilliSeconds / 1000);
	const Minutes = Math.floor(Seconds / 60);
	const Hours = Math.floor(Minutes / 60);
	const RemainingMinutes = Minutes % 60;
	const RemainingSeconds = Seconds % 60;

	if( Sticky_Note_Map_Language =="jp"){
		return `残り 約${Hours} 時 ${RemainingMinutes} 分`;
	}else{
		return `${Hours} h ${RemainingMinutes} m left`;
	}
}
//################# ミリ秒から時間・分に変換 #################


//################# Flyto Point（現在地） #################
function Sticky_Note_Map_Flyto_Location(getLatLng) {
	map.flyTo({
	  center: [getLatLng.coords.longitude, getLatLng.coords.latitude], 
	  zoom: 17,
	  speed: 2.5,
	  curve: 1
	});
};
//################# Flyto Point（現在地） #################


//################# Flyto Point（リスト） #################
function Flyto_Point(data_Lng, data_Lat,ZoomLv){
	map.flyTo({
	  center: [data_Lng, data_Lat], 
	  zoom: ZoomLv,
	  speed: 2.5,
	  curve: 1
	})
	const screenWidth = window.innerWidth;
	// 画面幅によって、「newContents」を閉じる
	setTimeout(function(){
		if(screenWidth < 700){
			const detailsElement = document.getElementById('newContents');
			detailsElement.open = false;	
		}
	},500)
}
//################# Flyto Point（リスト） #################


//################# アクセスカウント更新 #################
async function updateCount() {
	try {
		const response = await fetch(API_URL, {
			method: 'POST',
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			body: 'key=' + encodeURIComponent('update_Access_Count')		// アクセスカウント更新・取得
			}
		)
		.then(response => response.text()) // JSON ではなくテキストとして取得
		.then(text => {
			var trimmedText = text.trim();		// 先頭と末尾の空白文字を削除
			var data = JSON.parse(trimmedText);
			var count = data[0].Count;
			if(Sticky_Note_Map_PV_Target_ID !== ""){
				document.getElementById('PV_Count').textContent = numberWithCommas(count) + ' PV';
			}
			Sticky_Note_Map_Access_Count = count;
		})
	}
	catch (error) {
		console.error('Error fetching data:', error);
	}
}
//################# アクセスカウント更新 #################


//################# Sticky_Note_Mapリスト（10）取得 #################
function get_Sticky_Note_Map_List() {
	// Sticky_Noteデータリスト取得
	fetch(API_URL, {
		method: 'POST',
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		body: 'key=' + encodeURIComponent('get_Sticky_Note_List')	// Sticky_Noteデータリスト取得
	})
	.then(response => response.text()) // JSON ではなくテキストとして取得
	.then(text => {
		// 先頭と末尾の空白文字を削除
		var trimmedText = text.trim();
		var data = JSON.parse(trimmedText);

		if(Sticky_Note_Map_List_Target_ID !==""){
			const tableBody = document.getElementById('infoTable').querySelector('tbody');
			tableBody.innerHTML = ''; // 既存の行をクリア

			data.forEach(row => {
				const newRow = document.createElement('tr');
				const truncated_Sticky_Note = row.StickyNote.length > 30 ? row.StickyNote.substring(0, 30) + '...' : row.StickyNote;
				newRow.innerHTML = `
					<td class="yubi" onclick="Flyto_Point('${row.Lng}', '${row.Lat}',17)">${truncated_Sticky_Note}<br><small>(ID:${row.ID}) ${row.PostDateTime}<small></td>
				`;
				tableBody.appendChild(newRow);
			});
		}
	})
}
//################# Sticky_Note_Mapリスト（10）取得 #################


//################# Sticky_Note_Mapデータ削除 #################
async function delete_Sticky_Note(ID) {
	if (confirm(Alert_Text_Delete)) {
		await fetch(API_URL, {
			method: 'POST',
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			body: 'key=' + encodeURIComponent('delete_Sticky_Note')	+ '&ID=' + encodeURIComponent(ID)	// Sticky_Noteデータ削除（ID）
		})
		Popup_Sticky_Note_Map01.remove();
		Popup_Sticky_Note_Map02.remove();

		update_Sticky_Note_Map_Data();

		if(Sticky_Note_Map_List_Target_ID !== ""){
			await get_Sticky_Note_Map_List();
		}
	}
}
//################# Sticky_Note_Mapデータ削除 #################


//################# Sticky_Note_Mapソース更新（response） #################
async function update_Sticky_Note_Map_Source(response) {
	// 文字列に変換
	const textPromise = response.text();
        const text = await textPromise; // Promiseが解決するまで待つ

	// 先頭と末尾の空白文字を削除
	var trimmedText = text.trim();
	var data = JSON.parse(trimmedText);

	Sticky_Note_Map_features = [];
	for(var i=0; i<data.length; i++){
		var point = [];

		point = {
			type: 'Feature',
			properties: {
				'ID': data[i].ID,
				'User': data[i].User,
				'Sticky_Note': data[i].StickyNote,
				'URL': data[i].URL,
				'Sticky_Note_Label': data[i].StickyNote.length > 30 ? data[i].StickyNote.substring(0, 30) + '...' : data[i].StickyNote,
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
		Sticky_Note_Map_features.push(point);

		// 最新情報のIDを入れる
		Sticky_Note_Map_Latest_ID = data[i].ID;
	}

	var geojson = {
		type: "FeatureCollection",
		features: Sticky_Note_Map_features
	};

	// ソース更新
	map.getSource('Sticky_Note_Map').setData(geojson);
}
//################# Sticky_Note_Mapソース更新（response） #################


//################# Sticky_Note_Mapデータ取得・更新 #################
async function update_Sticky_Note_Map_Data() {
	// Sticky_Noteデータ取得
	const response = await fetch(API_URL, {
		method: 'POST',
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		body: 'key=' + encodeURIComponent('get_Sticky_Note')		// Sticky_Noteデータ取得
	})

	// ソース更新
	update_Sticky_Note_Map_Source(response);
}
//################# Sticky_Note_Mapデータ取得・更新 #################


//################# 最新投稿の確認・更新 #################
async function Confirm_Latest_Sticky_Note_Map() {
  try {
	await fetch(API_URL, {
				method: 'POST',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				body: 'key=' + encodeURIComponent('confirm_ID')		// 最終投稿ID確認
			},
		)
		.then(response => response.text()) // JSON ではなくテキストとして取得
		.then(text => {
			// 先頭と末尾の空白文字を削除
			var trimmedText = text.trim();
			var data = JSON.parse(trimmedText);
			Get_ID = data[0].ID;
			if(Sticky_Note_Map_Latest_ID != Get_ID){
				if(Sticky_Note_Map_List_Target_ID !== ""){
					get_Sticky_Note_Map_List();
				}
				update_Sticky_Note_Map_Data();
			}
			else
			{
//				console.log("更新しない");
			}
		})
  } catch (error) {
	console.error("サーバーエラー", error);
  }



}
//################# 最新投稿の確認・更新 #################


//################# ソース・レイヤ初期設定 #################
function set_Sticky_Note_Map_Source_Layer() {
	Sticky_Note_Map_features = [];
	var geojson = {
		type: "FeatureCollection",
		features: Sticky_Note_Map_features
	};

	map.addSource("Sticky_Note_Map", {
		"type": "geojson",
		"data": geojson,
		"cluster": true,
		"clusterMaxZoom": 14, // クラスタリングを行う最大ズームレベル
	});


	// クラスター（円）
	map.addLayer({
		'id': 'Sticky_Note_Map_Cluster',
		'type': 'circle',
		'source': 'Sticky_Note_Map',
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
		'id': 'Sticky_Note_Map_Cluster_Label',
		'type': 'symbol',
		'source': 'Sticky_Note_Map',
		'layout': {
			"text-field": ["get", "point_count_abbreviated"],
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
		'id': 'Sticky_Note_Map',
		'type': 'circle',
		'source': 'Sticky_Note_Map',
		'layout': {
		},
		paint: {
			'circle-radius': 3.5,  //半径
			'circle-color': 'rgba(0, 0, 255, 1)',
			'circle-stroke-color': 'rgba(255,255,255,1)', // ラベルの外枠の色を白に設定
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
		'id': 'Sticky_Note_Map_Label',
		'type': 'symbol',
		'source': 'Sticky_Note_Map',
		'layout': {
			'text-field': ['get', 'Sticky_Note_Label'],
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

	if( Sticky_Note_Map_Font !== ""){
		map.setLayoutProperty("Sticky_Note_Map_Cluster_Label", "text-font" , [Sticky_Note_Map_Font]);
		map.setLayoutProperty("Sticky_Note_Map_Label", "text-font" , [Sticky_Note_Map_Font]);
	}



}
//################# ソース・レイヤ初期設定 #################


//################# ポップアップ（属性表示） #################
// ポップアップカウント追加
function update_PopupCount(e) {
	var ID = e.features[0].properties['ID'];

	// PopupCount追加
	fetch(API_URL, {
		method: 'POST',
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		body: 'key=' + encodeURIComponent('update_PopupCount')	+ '&ID=' + encodeURIComponent(ID)	// Popupカウント追加（ID）
	})

	for (var i = 0; i < Sticky_Note_Map_features.length; i++) {
		if (Sticky_Note_Map_features[i].properties.ID === ID) {
			// 期限日時
			var TermDateTime = new Date(Sticky_Note_Map_features[i].properties.TermDateTime);	// TermDateTimeをDateオブジェクトに変換
			TermDateTime.setMinutes(TermDateTime.getMinutes() + 12);				// 12分加算
			Sticky_Note_Map_features[i].properties.TermDateTime = TermDateTime.toISOString();	// 更新されたTermDateTimeをfeatures配列に反映し、ISO形式で保存

			// 残り時間を計算し表示
			const RemainingTimeElement = document.getElementById("RemainingTime");
			var now = new Date();
			var MilliSeconds = TermDateTime - now;
			var RemainingTime = MilliToTime(MilliSeconds)
			RemainingTimeElement.textContent = RemainingTime;

		}
	}

	var geojson = {
		type: "FeatureCollection",
		features: Sticky_Note_Map_features
	};

	map.getSource('Sticky_Note_Map').setData(geojson);
};

// いいね！カウント追加
function update_NiceCount(ID) {

	// NiceCount追加
	fetch(API_URL, {
		method: 'POST',
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		body: 'key=' + encodeURIComponent('update_NiceCount')	+ '&ID=' + encodeURIComponent(ID)	// いいね！カウント追加（ID）
	})

	const NiceCountElement = document.getElementById("NiceCount");
	const RemainingTimeElement = document.getElementById("RemainingTime");
	let CurrentNiceCount = parseInt(NiceCountElement.textContent); // テキストを数値に変換
	NiceCountElement.textContent = CurrentNiceCount + 1;
};


// 属性表示（Sticky Note Map）
function Popup_Sticky_Note_Map(e) {

	PopupFlg = false;

	var ID = e.features[0].properties['ID'];
	var Sticky_Note_User = e.features[0].properties['User'];
	var Sticky_Note_Sticky_Note = e.features[0].properties['Sticky_Note'];
	var Sticky_Note_URL = e.features[0].properties['URL'];
	var Sticky_Note_Lng = e.features[0].geometry.coordinates[0];
	var Sticky_Note_Lat = e.features[0].geometry.coordinates[1];
	var Sticky_Note_PostDateTime = e.features[0].properties['PostDateTime'];
	var Sticky_Note_TermDateTime = e.features[0].properties['TermDateTime'];
	var Sticky_Note_MaxTermDateTime = e.features[0].properties['MaxTermDateTime'];
	var Sticky_Note_NiceCount = e.features[0].properties['NiceCount'];


	// 表示期間の終了日時をDateオブジェクトに変換
	var TermDateTime = new Date(Sticky_Note_TermDateTime);

	// 残り時間を計算し表示
	var now = new Date();
	TermDateTime.setMinutes(TermDateTime.getMinutes() + 12);	// 12分加算
	var MilliSeconds = TermDateTime - now;
	var RemainingTime = MilliToTime(MilliSeconds)


	let infoContent = Sticky_Note_Sticky_Note;
	if ( Sticky_Note_URL !=="" ) {
		infoContent = `<a href="${Sticky_Note_URL}" target="_blank">${Sticky_Note_Sticky_Note}</a>`;
	}else{
		if (Sticky_Note_Sticky_Note.startsWith("https://")) {
			infoContent = `<a href="${Sticky_Note_Sticky_Note}" target="_blank">${Sticky_Note_Sticky_Note}</a>`;
		}
	}

	// ポップアップ削除
	Popup_Sticky_Note_Map01.remove();
	Popup_Sticky_Note_Map02.remove();

	Popup_Sticky_Note_Map01 = new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
			'<div id="Sticky_Note_Map_Popup">' +
				'<span><b>' + '<big>' + infoContent + '</big>' + '</b></span>' + '<br>' +
				'</span></b><span><b>' + Popup_Text_User +' '+ Sticky_Note_User + '</b></span>' + '<br>' +
				'<span>' + Popup_Text_PostDateTime +' </span><span id = "PostDateTime">' + Sticky_Note_PostDateTime + '</span><span> </span>' +
				'<button id="delete_Sticky_Note_Button" class="sendButton" onclick="delete_Sticky_Note(' + ID + ')"><b>' + Popup_Text_Delete_Button + '</b></button>' + '<br>' + 
				'<span  class="nice" id = "NiceButton"><b>' + Popup_Text_Nice + '</b></span><b><span>(</span><span id = "NiceCount">' + Sticky_Note_NiceCount + '</span><span>) </span></b>' +
				'<span><span id = "RemainingTime">' + RemainingTime + '</span><br>' +
				'<hr>' +
				'<center>' +
				'<a href="https://www.google.co.jp/maps?q=' + Sticky_Note_Lat + ',' + Sticky_Note_Lng + '&hl=ja" target="_blank">' + Popup_Text_GoogleMaps + '</a> / ' +
				'<a href="https://www.google.com/maps/@?api=1&map_action=pano&parameters&viewpoint=' + Sticky_Note_Lat + ',%20' + Sticky_Note_Lng + '" target="_blank">' + Popup_Text_StreetView + '</a><br>' + 
				'</center>' +
			'</div>'
	).addTo(map);

	// PopupCount追加（12分追加）
	update_PopupCount(e);

	// イベントリスナー
	document.getElementById("NiceButton").addEventListener("click", function() {
		if( !PopupFlg ){
			update_NiceCount(ID);

			PopupFlg= true;

			// 表示期間の終了日時をDateオブジェクトに変換
			var TermDateTime = new Date(Sticky_Note_TermDateTime);
			TermDateTime.setMinutes(TermDateTime.getMinutes() + 12);				// 12分加算
			var MaxTermDateTime = new Date(Sticky_Note_MaxTermDateTime);

			// 1時間後の日時を計算
			TermDateTime.setHours(TermDateTime.getHours() + 1);

			// 残り時間を計算し、表示
			if(MaxTermDateTime > TermDateTime){
				var now = new Date();
				var MilliSeconds = TermDateTime - now;
				var RemainingTime = MilliToTime(MilliSeconds);

				// 残り時間を適切な形式で表示する処理（ミリ秒を日時に変換など）
				document.getElementById("RemainingTime").textContent = RemainingTime;


				for (var i = 0; i < Sticky_Note_Map_features.length; i++) {
					if (Sticky_Note_Map_features[i].properties.ID === ID) {
						// いいね！カウント
						Sticky_Note_Map_features[i].properties.NiceCount = parseInt(Sticky_Note_Map_features[i].properties.NiceCount) + 1;	// いいね！カウント+1

						// 期限日時
						var TermDateTime = new Date(Sticky_Note_Map_features[i].properties.TermDateTime);	// TermDateTimeをDateオブジェクトに変換
						TermDateTime.setHours(TermDateTime.getHours() + 1);					// 1時間加算
						Sticky_Note_Map_features[i].properties.TermDateTime = TermDateTime.toISOString();	// 更新されたTermDateTimeをfeatures配列に反映し、ISO形式で保存
					}
				}

				var geojson = {
					type: "FeatureCollection",
					features: Sticky_Note_Map_features
				};

				map.getSource('Sticky_Note_Map').setData(geojson);
			}
		}
	});
};
//################# ポップアップ（属性表示） #################


//################# ポップアップ（ダブルクリック） #################
// データベースに登録・参照
async function add_Sticky_Note(){
	db_Sticky_Note = document.getElementById("db_Sticky_Note").value;
	db_Sticky_Note_URL = document.getElementById("db_Sticky_Note_URL").value;

	if( db_Sticky_Note !== "" || db_Sticky_Note_URL !== "" ){
		Popup_Sticky_Note_Map02.remove();

		if( db_Sticky_Note === "" ){
			db_Sticky_Note = db_Sticky_Note_URL;
		}

		// DB登録
		var response = await fetch(API_URL, {
			method: 'POST',
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			body: 'key=' + encodeURIComponent('add_Sticky_Note') + '&db_user=' + Sticky_Note_Map_User + '&db_Sticky_Note=' + db_Sticky_Note + '&db_Sticky_Note_URL=' + db_Sticky_Note_URL + '&db_Lng=' + db_Lng + '&db_Lat=' + db_Lat
		})

		if (response.ok) {
			// 成功した場合に実行
//			console.log('データベースに登録完了');
			await update_Sticky_Note_Map_Data(); 

			// リスト更新
			if(Sticky_Note_Map_List_Target_ID !== ""){
				await get_Sticky_Note_Map_List();
			}

		} else {
			console.error('データベースへの登録に失敗しました');
		}
	}else{
		alert(Alert_Text_Post01);
	}

}

function Popup_Post_Menu(e){
	ZoomLv = map.getZoom();

	db_Lng = e.lngLat.lng;
	db_Lat = e.lngLat.lat;

	// ポップアップ削除
	Popup_Sticky_Note_Map01.remove();
	Popup_Sticky_Note_Map02.remove();

	Popup_Sticky_Note_Map02 = new maplibregl.Popup({closeButton: false})
		.setLngLat(e.lngLat)
		.setHTML(
			'<div id="Sticky_Note_Map_POST" style="width: 250px;">' +
				'<b>' + Popup_Text_Description + '</b><br>' + 
				'<input type="hidden" name="db_user" value="' + Sticky_Note_Map_User + '">' +
				'<input type="hidden" name="db_Lng" value="' + db_Lng + '">' +
				'<input type="hidden" name="db_Lat" value="' + db_Lat + '">' +
				'<input  type="text"class="share_info" id="db_Sticky_Note" name="db_Sticky_Note" placeholder="' + Popup_Text_Placeholder + '"  maxlength="100">　' + ' ' +
				'<button id="post_Sticky_Note_Button" class="sendButton" onclick="add_Sticky_Note()"><b>' + Popup_Text_Post_Button + '</b></button><br>' + 
				'<small>' + Popup_Text_Link + ' </small><input  type="text"class="share_info" id="db_Sticky_Note_URL" name="db_Sticky_Note_URL" placeholder="https://...."  maxlength="100">　' + '<br>' +
				'<hr>' + 
				'<center>' + 
				'<a href="https://www.google.co.jp/maps?q=' + e.lngLat.lat + ',' + e.lngLat.lng + '&hl=ja" target="_blank">' + Popup_Text_GoogleMaps + '</a> / ' + 
				'<a href="https://www.google.com/maps/@?api=1&map_action=pano&parameters&viewpoint=' + e.lngLat.lat + ',%20' + e.lngLat.lng + '" target="_blank">' + Popup_Text_StreetView + '</a><br>' +
				'</center>' + 
			    '</div>'
		);
	Popup_Sticky_Note_Map02.addTo(map);

	const Sticky_Note_textBox = document.getElementById('db_Sticky_Note');
	Sticky_Note_textBox.focus();
}
//################# ポップアップ（ダブルクリック） #################


function set_Language() {
	if( Sticky_Note_Map_Language =="jp"){
		Popup_Text_User ="投稿者";
		Popup_Text_PostDateTime ="投稿日時";
		Popup_Text_Post_Button = "POST";
		Popup_Text_Delete_Button = "削　除";
		Popup_Text_Nice ="いいね！";
		Popup_Text_GoogleMaps = "Google Maps";
		Popup_Text_StreetView = "ストリートビュー";
		Popup_Text_Description = "【投稿】（100文字以内）";
		Popup_Text_Placeholder = "コメント又はＵＲＬ";
		Popup_Text_Link = "リンク";
		Alert_Text_Delete = "本当に削除しますか？";
		Alert_Text_Post01 = "コメントが入力されていません。";
	}
}

//################# Sticky_Note_Map追加 #################
function add_Sticky_Note_Map() {

	// 言語設定
	set_Language();

	// アクセスカウント更新
	updateCount()

	// ソース・レイヤ初期設定
	set_Sticky_Note_Map_Source_Layer();

	// ソース更新
	update_Sticky_Note_Map_Data();

        // リスト更新
	get_Sticky_Note_Map_List();

	// ダブルクリック制御
	map.on('click', function (e) {
		if (DoubleClick_Flg) {
			// ダブルクリック処理
			Popup_Post_Menu(e);	// Postメニューの呼び出し
			DoubleClick_Flg = false; // 次のクリックに備えて状態をリセット
		} else {
			DoubleClick_Flg = true;
			setTimeout(() => {
				DoubleClick_Flg = false; // 一定時間後に状態をリセット
			}, 300); // 300ミリ秒後にリセット
		}
	});

	if( Sticky_Note_Map_List_Target_ID !== "" ){
		const detailsElement = document.getElementById(Sticky_Note_Map_List_Target_ID);	// 最新投稿のイベントリスナー
		detailsElement.addEventListener('toggle', () => {
			if (detailsElement.open) {
				Confirm_Latest_Sticky_Note_Map();
			}
		});
	}

	// マウスポインタ制御
	map.on('mousemove', 'Sticky_Note_Map', (e) => { map.getCanvas().style.cursor = 'pointer' });		//マウスイベント【Sticky_Note_Map上で動いている場合】
	map.on('mousemove', 'Sticky_Note_Map_Label', (e) => { map.getCanvas().style.cursor = 'pointer' });	//マウスイベント【Sticky_Note_Map_Label上で動いている場合】
	map.on('mouseleave','Sticky_Note_Map', function() { map.getCanvas().style.cursor = ''; });		//マウスアウトイベント（Sticky_Note_Map）【元に戻す】
	map.on('mouseleave','Sticky_Note_Map_Label', function() { map.getCanvas().style.cursor = ''; });	//マウスアウトイベント（Sticky_Note_Map_Label）【元に戻す】
	map.on('mousemove', 'Sticky_Note_Map_Cluster', (e) => { map.getCanvas().style.cursor = 'pointer' });	//マウスイベント【Sticky_Note_Map_Cluster上で動いている場合】
	map.on('mouseleave','Sticky_Note_Map_Cluster', function() { map.getCanvas().style.cursor = ''; });	//マウスアウトイベント（Sticky_Note_Map_Cluster）【元に戻す】

	map.on('drag', function () { map.getCanvas().style.cursor = 'grabbing'; });	//マウスイベント【ドラッグ】
	map.on('moveend', function () {	map.getCanvas().style.cursor = ''; });		//マウスイベント【ムーブエンド】

	// クリック属性表示（Sticky_Note_Map）【Point】
	map.on('click', 'Sticky_Note_Map', (e) => { if( e.features[0].properties['ID'] !== undefined ){ Popup_Sticky_Note_Map(e); } });

	// クリック属性表示（Sticky_Note_Map）【Text】
	map.on('click', 'Sticky_Note_Map_Label', (e) => { Popup_Sticky_Note_Map(e); });

	// クリック属性表示（Sticky_Note_Map）【Cluster_Circle】
	map.on('click', 'Sticky_Note_Map_Cluster', (e) => {
		const screenWidth = window.innerWidth;	// 画面幅を取得

		// 画面幅に応じて拡大スピードを調整
		if( screenWidth < 700){	ZoomLv = map.getZoom() + 3; }else{ ZoomLv = map.getZoom() + 4; }

		// クラスタリング地物（Features）の中心座標
		data_Lng = e.features[0].geometry.coordinates[0];
		data_Lat = e.features[0].geometry.coordinates[1];

		Flyto_Point(data_Lng, data_Lat,ZoomLv);
	});
}
//################# Sticky_Note_Map追加 #################
