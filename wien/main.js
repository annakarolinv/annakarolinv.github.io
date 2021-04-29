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
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            Station: ${feature.properties.STAT_NAME}`)
        },

        // neuer marker mit icon
        pointToLayer: (geoJSONpoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/busstopblue.png',
                    iconSize: [35, 35]
                })
            })
        },

        // Quellenangabe
        attribution: '<a href="https://data.wien.gv.at">Stadt Wien</a>, <a href="https://mapicons.mapsmarker.com">Maps Icons Collection</a>'

    }).addTo(overlays.busStops);
}

// Funktion
let drawBusLines = (geoJSONdata) => {
    console.log('Bus Lines: ', geoJSONdata);
    L.geoJSON(geoJSONdata, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            von: ${feature.properties.FROM_NAME} <br>
            nach: ${feature.properties.TO_NAME}`)
        }
    }).addTo(overlays.busLines);
}


// Datenauswertung

for (let config of OGDWIEN) {
    console.log("Config: ", config.data);   // zeigt an, welche Daten/Datei verwendet wurden

    fetch(config.data)
        .then(response => response.json())
        .then(geoJSONdata => {
            console.log("Data: ", geoJSONdata);     // zeigt wie viele / welche Objekte im Datensatz sind

            // config auswerten
            if (config.title == "Haltestellen Vienna Sightseeing") {
                drawBusStop(geoJSONdata);
            } else if (config.title == "Liniennetz Vienna Sightseeing") {
                drawBusLines(geoJSONdata);
            }
        })
}