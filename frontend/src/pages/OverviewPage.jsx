import { ThermometerSun, Vibrate, Cloudy, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import DataOverviewChart from "../components/overview/DataOverviewChart";

const OverviewPage = ({ socket }) => {
	const [sensor_data, setSensorData] = useState({});

	const sensor_types = ["temperature", "humidity", "air_quality"];

	const handleSensorData = (sensor_type, sensor_data) => {
		setSensorData((prev_data) => ({
			...prev_data,
			[sensor_type]: sensor_data,
		}))
	}

	useEffect(() => {
		sensor_types.forEach((sensor_type) => {
			// Listen for real-time updates
			socket.on(sensor_type, (sensor_data_object) => {
				console.log("Received new data:", sensor_data_object);
				handleSensorData(sensor_type, sensor_data_object.sensor_reading);
				console.log(sensor_data_object)
			});
		})

		return () => {
			sensor_types.forEach((sensor_type) => {
				socket.off(sensor_type); // Clean up on unmount
			})
		};
	}, [socket]);

	useEffect(() => {
		sensor_types.forEach(async (sensor_type) => {
			const mongo_response = await fetch(`http://localhost:3000/mongo/sensor/data/${sensor_type}`, { method: "GET" })
			const sensor_data_object = await mongo_response.json();
			console.log(sensor_data_object);
			handleSensorData(sensor_type, sensor_data_object.sensor_reading);
		})
	}, [])

	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Sensor Readings Overview' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name='Temperature' icon={ThermometerSun} value={sensor_data.temperature + "°C"} color='#EC4899' />
					<StatCard name='Vibration' icon={Vibrate} value='85 units' color='#8B5CF6' />
					<StatCard name='Humidity' icon={Droplets} value={sensor_data.humidity + "%"} color='#6366F1' />
					<StatCard name='Air Quality' icon={Cloudy} value={sensor_data.air_quality + " AQI"} color='#10B981' />
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