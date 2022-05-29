/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYm9oZGFubCIsImEiOiJjbDNyZGRid2UxZTRhM2RsMnNrOTdzam10In0.v_qjaltxgXaW5pGgDnZr0Q';

  // @ts-ignore
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/bohdanl/cl3ref3to000h15s2m72zwxbi',
    scrollZoom: false,
  });

  // @ts-ignore
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    // @ts-ignore
    new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup

    // @ts-ignore
    new mapboxgl.Popup({ offset: 30, focusAfterOpen: false })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
