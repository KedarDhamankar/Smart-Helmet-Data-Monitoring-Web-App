import { ThermometerSun, Cloudy, Droplets, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import DataOverviewChart from "../components/overview/DataOverviewChart";
import LiveMap from "../components/overview/LiveMap";

const OverviewPage = ({ socket }) => {
	const [sensor_data, setSensorData] = useState({});
	const [base64_image, setBase64Image] = useState();
	const [show_temperature_alert, setShowTemperatureAlert] = useState(false);
	const [air_quality_level, setAirQualityLevel] = useState({ "level": "N/A", "color": "#9CA3AF" }) // Gray color

	const sensor_types = ["temperature", "humidity", "air_quality", "latitude", "longitude"];

	const handleSensorData = (sensor_type, sensor_data) => {
		// Return if invalid gps data
		if ((sensor_type === "latitude" || sensor_type === "longitude") && parseInt(sensor_data, 10) === 0) {
			return;
		}
		// Set alert for temperature
		else if (sensor_type === "temperature") {
			// If temperature greater than 45 or less than 10, then show alert
			const temperature_data = parseInt(sensor_data, 10);
			if (temperature_data > 45 || temperature_data < 10) {
				setShowTemperatureAlert(true);
			} else {
				setShowTemperatureAlert(false);
			}
		}
		// Set text for air quality levels
		else if (sensor_type === "air_quality") {
			const aq_value = parseInt(sensor_data, 10);
			let air_quality_level;
			let air_quality_color;
			if (aq_value <= 400) {
				air_quality_level = "Safe";
				air_quality_color = "#10B981"; // Green
			} else if (aq_value <= 800) {
				air_quality_level = "Moderate";
				air_quality_color = "#FBBF24"; // Yellow
			} else if (aq_value <= 1200) {
				air_quality_level = "High";
				air_quality_color = "#F97316"; // Orange
			} else {
				air_quality_level = "Severe";
				air_quality_color = "#EF4444"; // Red
			}
			setAirQualityLevel({ "level": air_quality_level, "color": air_quality_color })
		}

		setSensorData((prev_data) => ({
			...prev_data,
			[sensor_type]: sensor_data,
		}))
	}

	const handleImageData = async () => {
		const get_image_response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/mongo/image/data`, { method: "GET" })
		const base64_image_data_object = await get_image_response.json();
		if (base64_image_data_object) {
			setBase64Image(base64_image_data_object.base64_image);
		}
	}

	useEffect(() => {
		if (socket) {
			sensor_types.forEach((sensor_type) => {
				// Listen for real-time updates
				socket.on(sensor_type, (sensor_data_object) => {
					console.log("Received new data:", sensor_data_object);
					handleSensorData(sensor_type, sensor_data_object.sensor_reading);
				});
			})

			socket.on("New image received", async () => {
				handleImageData();
				console.log("Received new image");
			})

			return () => {
				sensor_types.forEach((sensor_type) => {
					socket.off(sensor_type); // Clean up on unmount
				})
			};
		}
	}, [socket]);

	useEffect(() => {
		sensor_types.forEach(async (sensor_type) => {
			const mongo_response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/mongo/sensor/data/${sensor_type}`, { method: "GET" })
			const sensor_data_object = await mongo_response.json();
			// console.log(sensor_data_object);
			if (sensor_data_object) {
				handleSensorData(sensor_type, sensor_data_object.sensor_reading);
			}
		})

		handleImageData();
	}, []) // Fetch initial data for all sensors and image

	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Smart Helmet Dashboard' />

			<main className='max-w-7xl mx-auto py-5 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-5'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard
						name='Temperature'
						icon={ThermometerSun}
						value={
							sensor_data.temperature !== undefined && sensor_data.temperature !== null
								? sensor_data.temperature + "°C"
								: "N/A"
						}
						color='#EC4899'

						showAlert={show_temperature_alert}
					/>

					<StatCard
						name='Location'
						icon={MapPin}
						value={
							(sensor_data.latitude !== undefined && sensor_data.longitude !== undefined)
								? `${Number(sensor_data.latitude).toFixed(4)}° ${Number(sensor_data.longitude).toFixed(4)}°`
								: "N/A"
						}
						color='#8B5CF6'
					/>

					<StatCard
						name='Humidity'
						icon={Droplets}
						value={
							sensor_data.humidity !== undefined && sensor_data.humidity !== null
								? sensor_data.humidity + "%"
								: "N/A"
						}
						color='#6366F1'
					/>

					<StatCard
						name='Air Quality'
						icon={Cloudy}
						value={
							sensor_data.air_quality !== undefined && sensor_data.air_quality !== null
								? sensor_data.air_quality
								: "N/A"
						}
						color='#10B981'
						subtext={air_quality_level.level}
						subcolor={air_quality_level.color}
					/>
				</motion.div>

				<motion.div
					className="flex justify-between mb-5 flex-wrap gap-y-5"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>

					{/* Image data from ESP CAM */}
					<div className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 md:w-[49%] w-full'>
						<h2 className='text-lg font-medium mb-4 text-gray-100'>Latest Camera Snapshot</h2>
						<div className="w-full rounded-xl">
							{base64_image ? (
								<img
									src={`data:image/png;base64,${base64_image}`}
									alt="Base64"
									style={{ width: "100%", height: "auto" }}
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
									Image not available
								</div>
							)
							}
						</div>
					</div>

					{/* Google Maps integration */}
					<div className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 md:w-[49%] w-full'>
						<h2 className='text-lg font-medium mb-4 text-gray-100'>Live Location</h2>
						<div className="w-full h-[400px] rounded-xl">
							{(sensor_data.latitude && sensor_data.longitude) ? (
								<LiveMap latitude={Number(sensor_data.latitude)} longitude={Number(sensor_data.longitude)} />
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
									Location not available
								</div>
							)}
						</div>

					</div>
				</motion.div>

				{/* CHARTS */}
				<div className=''>
					<DataOverviewChart socket={socket} />
				</div>

			</main>
		</div>
	);
};
export default OverviewPage;