let basemapGray = L.tileLayer.provider('BasemapAT.grau');

let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    layers: [
        basemapGray
    ]
});

let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    snowheight: L.featureGroup(),
    windspeed: L.featureGroup(),
    winddirection: L.featureGroup(),
}
/*  
    https://leafletjs.com/reference-1.7.1.html#map-example
    https://leafletjs.com/reference-1.7.1.html#featuregroup
    https://leafletjs.com/reference-1.7.1.html#control-layers-addoverlay
    https://leafletjs.com/reference-1.7.1.html#divicon
    https://leafletjs.com/reference-1.7.1.html#tilelayer 
    https://leafletjs.com/reference-1.7.1.html#layergroup-l-layergroup
    https://leafletjs.com/reference-1.7.1.html#marker
    https://leafletjs.com/reference-1.7.1.html#control-layers
*/

let layerControl = L.control.layers({
    "BasemapAT.grau": basemapGray,
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.surface": L.tileLayer.provider('BasemapAT.surface'),
    "BasemapAT.overlay": L.tileLayer.provider('BasemapAT.overlay'),
    "BasemapAT.overlay+ortho": L.layerGroup([
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay')
    ])
}, {
    "Wetterstationen Tirol": overlays.stations,
    "Temperatur (°C)": overlays.temperature,
    "Schneehöhe (cm)": overlays.snowheight,
    "Windgeschwindigkeit (km/h)": overlays.windspeed,
    "Windrichtung": overlays.winddirection,
}, {
    // layer conrol permanently expanded
    collapsed: false
}).addTo(map);
// choose layer and add to map immediatly 
overlays.temperature.addTo(map);

L.control.scale({
    imperial: false,
    maxWidth: 200,
    metric: true,
}).addTo(map);

let getColor = (value, colorRamp) => {
    console.log("Wert: ", value, "Palette: ", colorRamp);
};

let newLabel = (coords, options) => {
    let color = getColor(option.value, options.colors)
    let label = L.divIcon({
        html: `<div>${options.value}</div>`,
        className: "text-label"
    })
    let marker = L.marker([coords[1], coords[0]], {
        icon: label
    });
    return marker;
};

let awsURL = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

// load data from server // auf Anwort des Servers warten, dann in JSON konvertierten, dann kann man damit weiter arbeiten
fetch(awsURL)
    .then(response => response.json())
    .then(json => {
        console.log('Daten konvertiert: ', json);
        // Marker für Wetterstationen hinzufügen
        for (station of json.features) {
            let marker = L.marker(
                [station.geometry.coordinates[1], station.geometry.coordinates[0]]);
            let formattedDate = new Date(station.properties.date);
            // spezifisches Datum eingeben
            marker.bindPopup(`
                <h3>${station.properties.name}</h3>
                <ul>
                    <li>Datum: ${formattedDate.toLocaleDateString("de")}</li> 
                    <li>Temperatur: ${station.properties.LT} °C</li>
                    <li>Schneehöhe: ${station.properties.HS} cm</li>
                    <li>Luftdruck: ${station.properties.LD} hPa</li>
                    <li>Höhe der Wetterstation: ${station.geometry.coordinates[2]} m ü.d.M.</li>
                    <li>Windgeschwindigkeit: ${station.properties.WG || '?'} km/h</li>
                </ul>
                <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `);
            marker.addTo(overlays.stations);
            if (typeof station.properties.HS == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.HS, 
                    colors: COLORS.snowheight
                });
                marker.addTo(overlays.snowheight);
            }
            if (typeof station.properties.WG == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.WG,
                    colors: COLORS.windspeed
                });
                marker.addTo(overlays.windspeed);
            }
            if (typeof station.properties.LT == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.LT,
                    color: COLORS.temperature
                });
                marker.addTo(overlays.temperature);
            }
        }
        // set map view to all stations
        map.fitBounds(overlays.stations.getBounds());
    });