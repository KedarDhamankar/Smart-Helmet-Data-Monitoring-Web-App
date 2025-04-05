import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";

const DataOverviewChart = ({ socket }) => {

	const [chart_data, setChartData] = useState([]);
	const sensor_types = ["temperature", "humidity", "air_quality"];
	const sensor_colors = {
		temperature: "#EC4899",
		humidity: "#6366F1",
		air_quality: "#10B981"
	};

	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const sensor_readings = {};

				for (const type of sensor_types) {
					const mongo_response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/mongo/sensor/data/history/${type}/12`)
					const data = await mongo_response.json();
					sensor_readings[type] = data;
				}

				const formatted_data = [];

				for (let i = 0; i < 12; i++) {
					const data_point = { index: i };

					for (const type of sensor_types) {
						if (sensor_readings[type] && sensor_readings[type][i]) {
							data_point[type] = sensor_readings[type][i].sensor_reading;
						}
					}

					formatted_data.push(data_point);
				}
				setChartData(formatted_data);

			} catch (error) {
				console.error("Error fetching initial chart data:", error);
			}
		};
		fetchInitialData();
	}, []);

	// Listen for real-time updates
	useEffect(() => {
		if (!socket) return;

		const handleSensorUpdate = (type, data) => {
			setChartData(prevData => {
				// Create new data array with the same length
				const newData = [...prevData];

				// Shift all data points to the left (removing the first/oldest point)
				for (let i = 0; i < newData.length - 1; i++) {
					newData[i] = {
						...newData[i + 1],
						index: i  // Keep the same index value for continuity
					};
				}

				// Update the last position with new data
				const lastIndex = newData.length - 1;
				newData[lastIndex] = {
					...newData[lastIndex],
					index: lastIndex,
					[type]: data.sensor_reading
				};

				return newData;
			});
		};

		// Set up listeners for each sensor type
		sensor_types.forEach(type => {
			socket.on(type, (data) => handleSensorUpdate(type, data));
		});

		// Clean up listeners
		return () => {
			sensor_types.forEach(type => {
				socket.off(type);
			});
		};
	}, [socket]);


	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<h2 className='text-lg font-medium mb-4 text-gray-100'>Live Trends</h2>

			<div className='h-80'>
				<ResponsiveContainer width={"100%"} height={"100%"}>
					<LineChart data={chart_data} >
						<CartesianGrid strokeDasharray='3 3' stroke='#4B5563' />
						<XAxis dataKey={"name"} stroke='#9ca3af' tick={false} />
						<YAxis stroke='#9ca3af' />
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Legend />
						{sensor_types.map(type => (
							<Line
								key={type}
								type='monotone'
								dataKey={type}
								name={type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
								stroke={sensor_colors[type]}
								strokeWidth={2}
								dot={{ fill: sensor_colors[type], strokeWidth: 1, r: 4 }}
								activeDot={{ r: 6, strokeWidth: 2 }}
								connectNulls={true}
							/>
						))}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default DataOverviewChart;