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
    // minimap: L.tileLayer.provider("BasemapAT.HOT")
};

// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    busLines: L.featureGroup(),
    busStops: L.markerClusterGroup(),
    pedAreas: L.featureGroup(),
    sights: L.featureGroup()
};

// Karte initialisieren und auf Wiens Wikipedia Koordinate blicken
let map = L.map("map", {
    fullscreenControl: true, // plugin for Leaflet that adds fullscreen button to your maps
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
    "Fußgängerzonen": overlays.pedAreas,
    "Sehenswürdigkeiten": overlays.sights
}).addTo(map);

// alle Overlays nach dem Laden anzeigen
overlays.busLines.addTo(map);
overlays.busStops.addTo(map);
overlays.pedAreas.addTo(map);
overlays.sights.addTo(map);

// Funktion  BUSHALTESTELLEN
let drawBusStop = (geoJSONdata) => {
    L.geoJSON(geoJSONdata, {
        // funktion
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            Station: ${feature.properties.STAT_NAME}`);
        },

        // neuer marker mit icon
        pointToLayer: (geoJSONpoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/haltestellewlogd.png',
                    iconSize: [25, 25]
                })
            })
        },

        // Quellenangabe
        attribution: '<a href="https://data.wien.gv.at">Stadt Wien</a>, <a href="https://mapicons.mapsmarker.com">Maps Icons Collection</a>'

    }).addTo(overlays.busStops);
}

// Funktion BUSLINIEN
let drawBusLines = (geoJSONdata) => {
    console.log('Bus Lines: ', geoJSONdata);
    L.geoJSON(geoJSONdata, {
        style: (feature) => {
            // Farbe aus colors.js
            let col = COLORS.buslines[feature.properties.LINE_NAME];
            return {
                color: col
            }
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            von: ${feature.properties.FROM_NAME} <br>
            nach: ${feature.properties.TO_NAME}`);
        }
    }).addTo(overlays.busLines);
}

// Funktion FUSSGÄNGERZONEN
let drawPedestrianAreas = (geoJSONdata) => {
    console.log('Zone: ', geoJSONdata);
    L.geoJSON(geoJSONdata, {
        style: (feature) => {
            return {
                stroke: true,
                color: "silver",
                fillColor: "yellow",
                fillOpacity: 0.3
            }
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>Fußgängerzone ${feature.properties.ADRESSE}</strong>
            <hr>
            ${feature.properties.ZEITRAUM} <br>
            ${feature.properties.AUSN_TEXT}`);
        }
    }).addTo(overlays.pedAreas);
}

// Funktion SEHENSWÜRDIGKEITEN
let drawSights = (geoJSONdata) => {
    console.log('Sehenswürdigkeit: ', geoJSONdata);
    L.geoJSON(geoJSONdata, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.NAME}</strong>
            <hr>
            ${feature.properties.ADRESSE} <br>
            <i class="fas fa-external-link-alt mr-3"></i> <a href='${feature.properties.WEITERE_INF}'>Weitere Infos</a>`);
        },
        // neuer marker mit icon bei Punktdatensatz
        pointToLayer: (geoJSONpoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/sehenswuerdigogd.png',
                    iconSize: [20, 25]
                })
            })
        },
    }).addTo(overlays.sights);
}


// Datenauswertung

for (let config of OGDWIEN) {
    console.log("Config: ", config.data); // zeigt an, welche Daten/Datei verwendet wurden

    fetch(config.data)
        .then(response => response.json())
        .then(geoJSONdata => {
            console.log("Data: ", geoJSONdata); // zeigt wie viele / welche Objekte im Datensatz sind

            // config auswerten
            if (config.title == "Haltestellen Vienna Sightseeing") {
                drawBusStop(geoJSONdata);
            } else if (config.title == "Liniennetz Vienna Sightseeing") {
                drawBusLines(geoJSONdata);
            } else if (config.title == "Fußgängerzonen") {
                drawPedestrianAreas(geoJSONdata);
            } else if (config.title == "Sehenswürdigkeiten") {
                drawSights(geoJSONdata);
            }
        })
}

// Leaflet hash to add dynamic URL hashes to web pages with Leaflet maps, easily link users to specific map views
var hash = new L.Hash(map);
// oder L.hash(map); weil die Variable brauchen wir erstmal nicht

// Mini Map for overview
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT.basemap"), {
        toggleDisplay: true, // button to minimise minimap, defaults to false
        minimized: false,
    }
).addTo(map);

// reachability plugin

// funktion um Intervalle farblich zu unterscheiden
let styleIntervals = (feature) => {
    console.log(feature.properties);
    let color = "";     // variable für Farbe zuweisen
    let range = feature.properties.Range;   // Variable für Range-Wert zuweisen
    if (feature.properties.Measure === "time") {
        color = COLORS.minutes[range];      // objekt wird angesprochen
    } else if (feature.properties.Measure === "distance") {
        color = COLORS.kilometers[range];      // der variable wird die range übergeben
    } else {
        color = "white";
    };
    return {
        color: color,
        opacity: 0.5,
        fillOpacity: 0.2
    };
};

L.control.reachability({
    // add settings/options here
    apiKey: '5b3ce3597851110001cf6248e5d9f867f324475f94952b029c4788f2',
    //style Funktion einbringen
    styleFn: styleIntervals,
    // icons anpassen
    drawButtonContent: '',
    drawButtonStyleClass: 'fas fa-pencil-alt fa-2x', //
    deleteButtonContent: '',
    deleteButtonStyleClass: 'fa fa-trash fa-2x',
    distanceButtonContent: '',
    distanceButtonStyleClass: 'fa fa-road fa-2x',
    timeButtonContent: '',
    timeButtonStyleClass: 'far fa-clock fa-2x', //
    travelModeButton1Content: '',
    travelModeButton1StyleClass: 'fa fa-car fa-2x',
    travelModeButton2Content: '',
    travelModeButton2StyleClass: 'fa fa-bicycle fa-2x',
    travelModeButton3Content: '',
    travelModeButton3StyleClass: 'fa fa-male fa-2x',
    travelModeButton4Content: '',
    travelModeButton4StyleClass: 'fas fa-wheelchair fa-2x' //
}).addTo(map);