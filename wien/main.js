// OGD-Wien Beispiel

// Kartenhintergründe der basemap.at definieren
let baselayers = {
    standard: L.tileLayer.provider("BasemapAT.basemap"),
    grau: L.tileLayer.provider("BasemapAT.grau"),
    terrain: L.tileLayer.provider("BasemapAT.terrain"),
    surface: L.tileLayer.provider("BasemapAT.surface"),
    highdpi: L.tileLayer.provider("BasemapAT.highdpi"),
    ortho_overlay: L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ]),
};

// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    busLines: L.featureGroup(),
    busStops: L.featureGroup(),
    pedAreas: L.featureGroup()
};

// Karte initialisieren und auf Wiens Wikipedia Koordinate blicken
let map = L.map("map", {
    center: [48.208333, 16.373056],
    zoom: 13,
    layers: [
        baselayers.grau
    ]
});

// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "Liniennetz Vienna Sightseeing": overlays.busLines,
    "Haltestellen Vienna Sightseeing": overlays.busStops,
    "Fußgängerzonen": overlays.pedAreas
}).addTo(map);

// alle Overlays nach dem Laden anzeigen
overlays.busLines.addTo(map);
overlays.busStops.addTo(map);
overlays.pedAreas.addTo(map);

// Funktion 
let drawBusStop = (geoJSONdata) => {
    L.geoJSON(geoJSONdata, {
        // funktion
        onEachFeature: (feature, layer) => {
            layer.bindPopup(feature.properties.STAT_NAME)
        },
        // neuer marker mit icon
        pointToLayer: (geoJSONpoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/busstopblue.png',
                    iconSize: [35, 35]
                })
            })
        }
    }).addTo(overlays.busStops);
}

// Daten aus dem Ordner laden
/* fetch("data/TOURISTIKHTSVSLOGD.json")
    .then(response => response.json())
    .then(stations => {
        L.geoJSON(stations, {       // objekt, das eine funktion aufruft, aus der der Name gelesen wird
            // funktion
            onEachFeature: (feature, layer) => {
                layer.bindPopup(feature.properties.STAT_NAME)
            },
            // neuer marker mit icon
            pointToLayer: (geoJSONpoint, latlng) => {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: 'icons/busstopblue.png',
                        iconSize: [35, 35]
                    })
                })
            }
        }).addTo(map);
    }) */

for (let config of OGDWIEN) {
    console.log("Config: ", config.data); // zeigt an, welche Daten/Datei verwendet wurden

    fetch(config.data)
        .then(response => response.json())
        .then(geoJSONdata => {
            console.log("Data: ", geoJSONdata); // zeigt wie viele / welche Objekte im Datensatz sind

            // config auswerten
            if (config.title == "Haltestellen Vienna Sightseeing") {
                drawBusStop(geoJSONdata);
            }
        })
}