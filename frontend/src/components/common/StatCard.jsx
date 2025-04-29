import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";

const StatCard = ({ name, icon: Icon, value, color, showAlert, subtext, subcolor }) => {
	return (
		<motion.div
			className='flex bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700'
			whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
		>
			<div className='px-4 py-5 sm:p-6'>
				<span className='flex items-center justify-between text-sm font-medium text-gray-400'>
					<span className='flex items-center'>
						<Icon size={20} className='mr-2' style={{ color }} />
						{name}
					</span>
				</span>
				<div className="flex flex-row items-center gap-x-4">
					<p className='mt-1 text-3xl font-semibold text-gray-100'>{value}</p>
					{showAlert && <TriangleAlert size={35} className='text-yellow-400' />}
					{subtext && (
						<p className='text-2xl mt-1 font-medium' style={{ color: subcolor }}>
							{subtext}
						</p>
					)}
				</div>
			</div>
		</motion.div>
	);
};

export default StatCard;
