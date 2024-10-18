// pages/api/register.js
import mongoose from 'mongoose';
import { connectToDatabase } from '../../lib/mongodb';

// 定义房间信息的 Schema
const HomeSchema = new mongoose.Schema({
  startDate: String,
  endDate: String,
  rentDate:String,
  phone: String,
  roomNumber: String,
  id: String,
  name: String,
  paymentMethod: String,
});

// 定义历史记录的 Schema
const HistorySchema = new mongoose.Schema({
  startDate: String,
  endDate: String,
  rentDate:String,
  phone: String,
  roomNumber: String,
  id: String,
  name: String,
  paymentMethod: String,
});

// 检查模型是否已经定义
const Room = mongoose.models.Room || mongoose.model('Room', HomeSchema);
const History = mongoose.models.History || mongoose.model('History', HistorySchema);

export default async function handler(req, res) {
  await connectToDatabase(); // 确保连接到数据库

  if (req.method === 'POST') {
    const { 
      startDate,
      endDate,
      rentDate,
      phone,
      roomNumber,
      id,
      name,
      paymentMethod,
    } = req.body;

    try {
      // 写入历史记录，用来防止错误操作
      const history = new History({ 
        startDate,
        endDate,
        rentDate,
        phone,
        roomNumber,
        id,
        name,
        paymentMethod,
      });

      await history.save();

      // 使用 findOneAndUpdate 方法插入或更新文档
      const updatedRoom = await Room.findOneAndUpdate(
        { roomNumber }, // 查找条件
        { 
          startDate,
          endDate,
          rentDate,
          phone,
          id,
          name,
          paymentMethod,
        }, // 更新的数据
        { new: true, upsert: true } // new: true 返回更新后的文档, upsert: true 如果找不到则插入新文档
      );

      res.status(201).json({ message: '操作成功', room: updatedRoom });
    } catch (error) {
      console.error('操作失败:', error);
      res.status(500).json({ message: '操作失败' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
