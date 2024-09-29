function addSources() {
  map.addSource("OSM_Raster", {
    type: "raster",
    tiles: ['https://tile.openstreetmap.jp/{z}/{x}/{y}.png'],
	tileSize: 256,
    attribution:"<a href='https://www.openstreetmap.org/copyright'>&copy; OpenStreetMap contributors</a>"
  })
  map.addSource("OSM_Vector", {
    type: "vector",
	tiles: ['https://tile.openstreetmap.jp/data/planet/{z}/{x}/{y}.pbf'],
	minzoom: 14,
	maxzoom: 14,
	attribution:"<a href='https://www.openstreetmap.org/copyright'>&copy; OpenStreetMap contributors</a>"
  })
}