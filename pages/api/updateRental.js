// pages/api/updateRental.js
import mongoose from 'mongoose';
import { connectToDatabase } from '../../lib/mongodb';

const updateRental = async (req, res) => {
    await connectToDatabase();
    
    if (req.method === 'POST') {
        const { roomNumber, newRentDate } = req.body;

        // 更新租户的交租日期
        await mongoose.models.Room.updateOne(
            { roomNumber },
            { rentDate: newRentDate }
        );

        return res.status(200).json({ message: '更新成功' });
    }

    return res.status(405).json({ message: '方法不支持' });
};

export default updateRental;
