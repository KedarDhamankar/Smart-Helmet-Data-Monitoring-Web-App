import { ThermometerSun, Vibrate, Cloudy, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

import { Deck } from "@deck.gl/core";
import { Tile3DLayer } from "@deck.gl/geo-layers";
import { ScatterplotLayer } from '@deck.gl/layers';


import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import DataOverviewChart from "../components/overview/DataOverviewChart";

const OverviewPage = ({ socket }) => {
	const [sensor_data, setSensorData] = useState({});
	const [base64_image, setBase64Image] = useState();

	const sensor_types = ["temperature", "humidity", "air_quality", "latitude", "longitude"];

	const handleSensorData = (sensor_type, sensor_data) => {
		setSensorData((prev_data) => ({
			...prev_data,
			[sensor_type]: sensor_data,
		}))
	}

	const handleImageData = async () => {
		const get_image_response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/mongo/image/data`, { method: "GET" })
		const base64_image_data_object = await get_image_response.json();
		console.log(base64_image_data_object);
		if (base64_image_data_object) {
			setBase64Image(base64_image_data_object.base64_image);
		}
	}

	useEffect(() => {
		sensor_types.forEach((sensor_type) => {
			// Listen for real-time updates
			socket.on(sensor_type, (sensor_data_object) => {
				console.log("Received new data:", sensor_data_object);
				handleSensorData(sensor_type, sensor_data_object.sensor_reading);
				// console.log(sensor_data_object)
			});
		})

		socket.on("New image received", async () => {
			handleImageData();
		})

		return () => {
			sensor_types.forEach((sensor_type) => {
				socket.off(sensor_type); // Clean up on unmount
			})
		};
	}, [socket]);

	useEffect(() => {
		sensor_types.forEach(async (sensor_type) => {
			const mongo_response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/mongo/sensor/data/${sensor_type}`, { method: "GET" })
			const sensor_data_object = await mongo_response.json();
			// console.log(sensor_data_object);
			handleSensorData(sensor_type, sensor_data_object.sensor_reading);
		})

		handleImageData();
	}, [])

	// Google Maps Integration
	// const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
	// const TILESET_URL = "https://tile.googleapis.com/v1/3dtiles/root.json";

	// const containerRef = useRef(null);

	// useEffect(() => {
	// 	const creditsElement = document.createElement("div");
	// 	creditsElement.style.position = "absolute";
	// 	creditsElement.style.bottom = "0";
	// 	creditsElement.style.right = "0";
	// 	creditsElement.style.padding = "2px";
	// 	creditsElement.style.fontSize = "15px";
	// 	creditsElement.style.color = "white";
	// 	creditsElement.style.textShadow = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
	// 	containerRef.current.appendChild(creditsElement);

	// 	const deckgl = new Deck({
	// 		container: containerRef.current,
	// 		initialViewState: {
	// 			latitude: sensor_data.latitude,
	// 			longitude: sensor_data.longitude,
	// 			zoom: 16,
	// 			bearing: 90,
	// 			pitch: 60,
	// 		},
	// 		controller: { minZoom: 8 },
	// 		layers: [
	// 			new Tile3DLayer({
	// 				id: "google-3d-tiles",
	// 				data: TILESET_URL,
	// 				loadOptions: {
	// 					fetch: {
	// 						headers: {
	// 							"X-GOOG-API-KEY": GOOGLE_API_KEY,
	// 						},
	// 					},
	// 				},
	// 				onTilesetLoad: (tileset3d) => {
	// 					tileset3d.options.onTraversalComplete = (selectedTiles) => {
	// 						const credits = new Set();
	// 						selectedTiles.forEach((tile) => {
	// 							const copyright = tile.content.gltf?.asset?.copyright;
	// 							if (copyright) {
	// 								copyright.split(";").forEach((c) => credits.add(c.trim()));
	// 							}
	// 						});
	// 						creditsElement.innerHTML = [...credits].join("; ");
	// 						return selectedTiles;
	// 					};
	// 				},
	// 			}),
	// 		],
	// 	});

	// 	return () => deckgl.finalize();
	// }, []);

	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Sensor Readings Overview' />

			<main className='max-w-7xl mx-auto py-5 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-5'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name='Temperature' icon={ThermometerSun} value={sensor_data.temperature + "°C"} color='#EC4899' />
					<StatCard name='Location' icon={Vibrate} value={`${sensor_data.latitude}° ${sensor_data.longitude}°`} color='#8B5CF6' />
					<StatCard name='Humidity' icon={Droplets} value={sensor_data.humidity + "%"} color='#6366F1' />
					<StatCard name='Air Quality' icon={Cloudy} value={sensor_data.air_quality + " AQI"} color='#10B981' />
				</motion.div>

				{/* CHARTS */}
				<div className=''>
					<DataOverviewChart socket={socket} />
				</div>

				{/* Google Maps integration */}
				{/* <div
					ref={containerRef}
					style={{ width: "100%", height: "100%" }}
				/> */}

				{/* Live Image feed from camera sensor  */}
				<div>
					<img src={`data:image/png;base64,${base64_image}`} alt="Base64" style={{ width: "200px", height: "auto" }} />
				</div>

			</main>
		</div>
	);
};
export default OverviewPage;