import { Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import OverviewPage from "./pages/OverviewPage";

function App() {
	// Connect to backend WebSocket
	const socket = io("http://localhost:3001");

	socket.on("connect", () => {
		console.log("Connected to server:", socket.id);
	});

	return (
		<div className='flex h-screen bg-gray-900 text-gray-100 overflow-hidden'>
			{/* BG */}
			<div className='fixed inset-0 z-0'>
				<div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80' />
				<div className='absolute inset-0 backdrop-blur-sm' />
			</div>

			{/* <Sidebar /> */}
			<Routes>
				<Route path='/' element={<OverviewPage socket={socket} />} />
			</Routes>
		</div>
	);
}

export default App;
