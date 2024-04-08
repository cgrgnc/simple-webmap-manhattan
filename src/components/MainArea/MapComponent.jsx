/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { FullscreenControl, GeolocateControl, Layer, Marker, NavigationControl, ScaleControl, Source } from 'react-map-gl';
import axios from 'axios';
import { Button, Flex, IconButton, useToast, Text, Heading, Card, VStack } from '@chakra-ui/react';
import { FaPerson, FaPersonWalking } from "react-icons/fa6"
import { MdOutlineDirectionsRailwayFilled, MdOutlineMuseum, MdOutlinePark, MdBookmarkBorder } from "react-icons/md";
import { GiStreetLight } from "react-icons/gi"
import { Popup } from 'react-map-gl';
import markers from '../../../data/data';


const MapComponent = () => {

    const mapRef = useRef()
    const toast = useToast()

    const APIKEY = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    const APIDIRECTIONKEY = process.env.NEXT_PUBLIC_MAPBOX_API_DIRECTION_TOKEN

    const initialViewState = {
        latitude: 40.78,
        longitude: -73.97,
        zoom: 14
    }

    const [hoveredMarker, setHoveredMarker] = useState(null);

    const [filterType, setFilterType] = useState(null);




    const [me, setMe] = useState({
        latitude: 40.782,
        longitude: -73.973
    });

    const [mehoveredMarker, setMeHoveredMarker] = useState({ latitude: me.latitude, longitude: me.longitude });

    const [events, logEvents] = useState({});

    const onMarkerDragStart = useCallback((event) => {
        logEvents(_events => ({ ..._events, onDragStart: event.lngLat }));
        setReadyNavigation(false)
        setMeHoveredMarker(null)
    }, []);

    const onMarkerDrag = useCallback((event) => {
        logEvents(_events => ({ ..._events, onDrag: event.lngLat }));

        setMe({
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat
        });
    }, []);

    const onMarkerDragEnd = useCallback((event) => {
        logEvents(_events => ({ ..._events, onDragEnd: event.lngLat }));
        toast({
            description: "Start point selected. Please select a destination point.",
            status: "success",
            duration: "3000",
        })


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [navPoints, setNavPoints] = useState([{ latitude: me.latitude, longitude: me.longitude },
    { latitude: undefined, longitude: undefined }]);

    const [directions, setDirections] = useState(null);

    useEffect(() => {
        if (navPoints.length === 2) {
            const origin = navPoints[0];
            const destination = navPoints[1];
            getDirections(origin, destination);
        } else {
            setDirections(null);
        }
    }, [navPoints]);

    const getDirections = async (origin, destination) => {

        try {
            const response = await axios.get(
                `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${APIDIRECTIONKEY}`
            );
            setDirections(response?.data?.routes[0]?.geometry);
        } catch (error) {
            setDirections(null)
        }

    };

    const [selectedDestination, setSelectedDestination] = useState({ latitude: null, longitude: null })

    const selectDestination = (lat, lon) => {
        setSelectedDestination({ latitude: lat, longitude: lon })
        const updatedMarkers = [...navPoints]
        updatedMarkers[1].latitude = lat
        updatedMarkers[1].longitude = lon
        setNavPoints(updatedMarkers)
        toast({
            description: "Destionation point selected.",
            status: "success",
            duration: "3000",
        })
        setReadyNavigation(false)
    }

    const [readyNavigation, setReadyNavigation] = useState(false)

    const getBoundsForMarkers = (markers) => {
        return markers.reduce(([minLng, minLat, maxLng, maxLat], marker) => [
            Math.min(minLng, marker.longitude),
            Math.min(minLat, marker.latitude),
            Math.max(maxLng, marker.longitude),
            Math.max(maxLat, marker.latitude),
        ], [Infinity, Infinity, -Infinity, -Infinity]);
    }


    const fitBoundsForMarkers = (markers) => {
        const bounds = getBoundsForMarkers(markers);
        mapRef.current.fitBounds([
            [bounds[0], bounds[1]],
            [bounds[2], bounds[3]]
        ], { padding: 40, duration: 1000 });
    }

    const navigate = () => {
        const minLat = me.latitude;
        const minLng = me.longitude;
        const maxLat = selectedDestination.latitude;
        const maxLng = selectedDestination.longitude;

        if (maxLat && maxLng && directions) {
            const bounds = [
                [minLng, minLat],
                [maxLng, maxLat]
            ];

            const options = {
                padding: 40,
                duration: 1000
            };

            const distanceLng = Math.abs(maxLng - minLng);
            const distanceLat = Math.abs(maxLat - minLat);

            const avgDistance = (distanceLng + distanceLat) / 2;
            const desiredZoom = Math.log2(360 / avgDistance) - 1;
            options.zoom = desiredZoom;

            setTimeout(() => {
                mapRef.current.fitBounds(bounds, options);
                if (!readyNavigation) {
                    setReadyNavigation(true);
                }

            }, 1000);

            toast({
                description: "The shortest distance is being calculated.",
                status: "loading",
                duration: "1000"
            });
        } else {
            toast({
                description: "Please select a Point of Interest",
                status: "warning",
                duration: "3000"
            });
        }
    };

    useMemo(() => {
        const updatedMarkers = [...navPoints]
        updatedMarkers[0].latitude = me.latitude
        updatedMarkers[0].longitude = me.longitude
        setNavPoints(updatedMarkers)
    }, [me])


    return (
        <Flex position="relative" width="100%" height="70vh">
            <Map
                ref={mapRef}
                initialViewState={initialViewState}
                style={{ width: "100%", height: "100%" }}
                mapStyle="mapbox://styles/mapbox/outdoors-v12"
                mapboxAccessToken={APIKEY}
            >

                <GeolocateControl position="bottom-right" />
                <FullscreenControl position="top-left" />
                <NavigationControl position="bottom-right" />
                <ScaleControl position="bottom-right" />

                {/* Me */}
                <Marker onDragStart={onMarkerDragStart}
                    onDrag={onMarkerDrag}
                    onDragEnd={onMarkerDragEnd} draggable latitude={me.latitude} longitude={me.longitude} color="red"
                    offsetTop={-20}
                    offsetLeft={-10}
                >
                    {/* <Icon as={<FaPerson />} /> */}
                    <IconButton icon={<FaPerson color='#F31559' />}
                        variant="outlined" aria-label='me symbol' fontSize={40} colorScheme='whiteAlpha'
                        onMouseEnter={() => { setMeHoveredMarker(null) }}
                        onMouseLeave={() => {
                            if (events?.onDragEnd?.lat == me.latitude && events?.onDragEnd?.lng == me.longitude) {
                                setMeHoveredMarker({ latitude: me.latitude, longitude: me.longitude })
                            }
                        }}
                    />
                </Marker>
                {mehoveredMarker && (
                    <Popup
                        latitude={mehoveredMarker.latitude}
                        longitude={mehoveredMarker.longitude}
                        onClose={() => setMeHoveredMarker(null)}
                        closeButton={false}
                        offset={20}
                    >
                        <Text fontWeight={600} color="#33BBC5">You can drag me!</Text>
                    </Popup>
                )}

                {/* Other Markers */}
                {markers.map((marker, i) => {
                    if (filterType && marker.type !== filterType) return null;
                    const isClicked = selectedDestination?.latitude === marker.latitude && selectedDestination?.longitude === marker.longitude
                    return (
                        <>
                            {isClicked
                                ? <Marker key={i * 10 + 1} scale={1.5} longitude={marker.longitude} latitude={marker.latitude} onClick={() => selectDestination(marker.latitude, marker.longitude)} />
                                : <Marker key={i} longitude={marker.longitude}
                                    latitude={marker.latitude}
                                    onClick={() => selectDestination(marker.latitude, marker.longitude)}

                                >
                                    <IconButton icon={
                                        marker.type === "museum" ? <MdOutlineMuseum color="#0C356A" />
                                            : marker.type === "park" ? <MdOutlinePark color="#1A5D1A" />
                                                : marker.type === "railway" ? <MdOutlineDirectionsRailwayFilled color="#A2678A" />
                                                    : marker.type === "street" ? <GiStreetLight color="#F6635C" />
                                                        : undefined
                                    } variant="outlined" aria-label='me symbol' fontSize={40} colorScheme='whiteAlpha'
                                        onMouseEnter={() => { setHoveredMarker(marker) }}
                                        onMouseLeave={() => setHoveredMarker(null)} />
                                </Marker>}
                        </>
                    )
                })}
                {hoveredMarker && (
                    <Popup
                        latitude={hoveredMarker.latitude}
                        longitude={hoveredMarker.longitude}
                        onClose={() => setHoveredMarker(null)}
                        closeButton={false}
                        offset={20}
                    >
                        <Text fontWeight={600} color="#33BBC5">{hoveredMarker.title}</Text>
                    </Popup>
                )}

                {directions && readyNavigation && (
                    <Source type="geojson" data={directions}>
                        <Layer type="line" paint={{
                            'line-color': '#0074D9', 'line-width': 4,
                            'line-opacity': 0.6,
                        }} />
                    </Source>
                )}
            </Map >
            <Card position="absolute" top="0" right="1" bg="white" borderRadius={15}>
                <Flex p={5} justifyContent="center" bgColor="#319795">
                    <Heading size="sm" color="white">Select What to See</Heading>
                </Flex>

                <VStack alignItems="flex-start">
                    <Button leftIcon={<MdOutlineDirectionsRailwayFilled />} variant="outlined" size="sm" color="#A2678A"
                        onClick={() => {
                            setFilterType('railway'), setDirections(null),
                                fitBoundsForMarkers(markers.filter(marker => marker.type === 'railway'))
                        }}
                    > Railway Station</Button>
                    <Button leftIcon={<MdOutlineMuseum />} variant="outlined" size="sm" color="#0C356A"
                        onClick={() => {
                            setFilterType('museum'), setDirections(null),
                                fitBoundsForMarkers(markers.filter(marker => marker.type === 'museum'))
                        }}
                    >Museum</Button>
                    <Button leftIcon={<MdOutlinePark />} variant="outlined" size="sm" color="#1A5D1A"
                        onClick={() => {
                            setFilterType('park'), setDirections(null),
                                fitBoundsForMarkers(markers.filter(marker => marker.type === 'park'))
                        }}
                    >Park or Garden</Button>
                    <Button leftIcon={<GiStreetLight />} variant="outlined" size="sm" color="#F6635C"
                        onClick={() => {
                            setFilterType('street'), setDirections(null),
                                fitBoundsForMarkers(markers.filter(marker => marker.type === 'street'))
                        }}
                    >Square or Street</Button>
                    <Button leftIcon={<MdBookmarkBorder />} variant="outlined" size="sm"
                        onClick={() => {
                            setFilterType(null), setDirections(null),
                                fitBoundsForMarkers(markers)
                        }}
                    >Show All</Button>
                </VStack>
            </Card>
            <Button leftIcon={<FaPersonWalking size={20} />} position="absolute" bottom="10" right="50%" transform="translateX(50%)" colorScheme='teal' onClick={() => navigate()}>
                Start Navigation
            </Button>
        </Flex>
    );
};

export default MapComponent;






