import React, { useState } from 'react';
import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/mongodb'; // 确保路径正确
import { useRouter } from 'next/router';
import Link from 'next/link';
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
const Room = mongoose.models.Room || mongoose.model('Room', HomeSchema);

const RentalList = ({ rentals }) => {
    const [selectedPhone, setSelectedPhone] = useState(null);
    const [confirmingRental, setConfirmingRental] = useState(null); // 用于存储确认的租户信息
    const router = useRouter();
    const getStatus = (endDate, startDate, paymentMethod, rentDate) => {
        const today = new Date();
        const end = new Date(endDate);
        const rent = new Date(rentDate);

        // 过期状态
        if (today > end) {
            return '过期';
        }

        const diffMonths = (today.getFullYear() - rent.getFullYear()) * 12 + (today.getMonth() - rent.getMonth());

        // 需交租状态
        if (paymentMethod === '按月支付' && diffMonths >= 1) {
            return '需交租';
        }

        // 正常状态
        return '正常';
    };

    const sortedRentals = rentals.sort((a, b) => {
        const statusA = getStatus(a.endDate, a.startDate, a.paymentMethod, a.rentDate);
        const statusB = getStatus(b.endDate, b.startDate, b.paymentMethod, b.rentDate);

        // 需交租状态排在前面，过期状态排在最后
        if (statusA === '需交租' && statusB !== '需交租') return -1;
        if (statusA !== '需交租' && statusB === '需交租') return 1;
        if (statusA === '过期' && statusB !== '过期') return 1;
        if (statusA !== '过期' && statusB === '过期') return -1;

        return 0; // 其他情况保持原顺序
    });

    const handlePhoneClick = (phone) => {
        setSelectedPhone(phone);
    };

    const handleClose = () => {
        setSelectedPhone(null);
    };
    const handleConfirmRental = async (rental) => {
        const newRentDate = new Date(rental.rentDate);
        let monthsToAdd = 0;
    
        // 根据支付方式决定延后多少个月
        if (rental.paymentMethod === '按月支付') {
            monthsToAdd = 1;
        } else if (rental.paymentMethod === '按季度支付') {
            monthsToAdd = 3;
        } else if (rental.paymentMethod === '按年支付') {
            monthsToAdd = 12;
        }
    
        newRentDate.setMonth(newRentDate.getMonth() + monthsToAdd);
    
        // 格式化日期为 'YYYY-MM-DD'
        const formattedRentDate = newRentDate.toISOString().split('T')[0];
    
        // 更新数据库
        const response =await fetch('/api/updateRental', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomNumber: rental.roomNumber, newRentDate: formattedRentDate }), // 使用格式化后的日期
        });
        const data = await response.json();
        console.log(data);
        setConfirmingRental(null); // 关闭确认框
        router.reload()
        // 这里可以添加更新状态的逻辑，例如重新获取租户数据
    };
    return (
        <div className="container">
            <h2>房间信息</h2>
            <Link href="/">
                <button className='action-button'>返回租户登记</button>
            </Link>
            <table>
                <thead>
                    <tr>
                        <th>房间号</th>
                        <th className="hidden-mobile">租户姓名</th>
                        <th className="hidden-mobile">起租日期</th>
                        <th>到期日期</th>
                        <th>交租日期</th>
                        <th className="hidden-mobile">手机号</th>
                        <th>支付方式</th>
                        <th>当前状态</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedRentals.map((rental) => {
                        const status = getStatus(rental.endDate, rental.startDate, rental.paymentMethod, rental.rentDate);
                        const color = status === '过期' ? '#E0E0E0' : status === '需交租' ? '#FFC107' : '#2196F3';
                        return (
                            <tr key={rental.id} style={{ backgroundColor: color, color: '#333333' }}>
                                <td onClick={() => handlePhoneClick(rental.phone)} style={{ cursor: 'pointer' }}>{rental.roomNumber}</td>
                                <td className="hidden-mobile">{rental.name}</td>
                                <td className="hidden-mobile">{rental.startDate}</td>
                                <td>{rental.endDate}</td>
                                <td>{rental.rentDate}</td>
                                <td className="hidden-mobile">{rental.phone}</td>
                                <td>{rental.paymentMethod}</td>
                                <td>
                                    {status === '需交租' ? (
                                        <button className="action-button" onClick={() => setConfirmingRental(rental)}>收租</button>
                                    ) : (
                                        status // 显示其他状态
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {selectedPhone && (
                <div className="overlay" onClick={handleClose}>
                    <div className="popup" onClick={(e) => e.stopPropagation()}>
                        <h3>完整手机号</h3>
                        <p>{selectedPhone}</p>
                        <button className="close-button" onClick={handleClose}>关闭</button>
                    </div>
                </div>
            )}

            {confirmingRental && (
                <div className="overlay" onClick={() => setConfirmingRental(null)}>
                    <div className="popup" onClick={(e) => e.stopPropagation()}>
                        <h3>确认收租</h3>
                        <p>您确定要收租并将交租时间延后吗？</p>
                        <button className="confirm-button" onClick={() => handleConfirmRental(confirmingRental)}>确认</button>
                        <button className="cancel-button" onClick={() => setConfirmingRental(null)}>取消</button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .container {
                    padding: 20px;
                    font-family: 'Arial', sans-serif;
                    background-color: #FFFFFF; /* 白色背景 */
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                h2 {
                    color: #333333; /* 深灰色 */
                    text-align: center;
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ccc;
                    padding: 12px;
                    text-align: center;
                }
                th {
                    background-color: #002200; /* 黑色 */
                    color: white; /* 白色字体 */
                }
                tr:hover {
                    background-color: #B3E5FC; /* 鼠标悬停时的背景色 */
                }
                .hidden-mobile {
                    display: table-cell;
                }
                @media (max-width: 600px) {
                    .hidden-mobile {
                        display: none; /* 小屏幕时隐藏 */
                    }
                }
                .action-button {
                    background-color: #1976D2; /* 深蓝色 */
                    color: white; /* 白色字体 */
                    padding: 10px 15px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s, transform 0.2s;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                }
                .action-button:hover {
                    background-color: #1565C0; /* 深蓝色 */
                    transform: translateY(-2px); /* 鼠标悬停时上升效果 */
                }
                .overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .popup {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .confirm-button, .cancel-button {
                    margin-top: 10px;
                    padding: 8px 12px;
                    border: none;
                    border-radius: 5px;
                    background-color: #1976D2;
                    color: white;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    margin: 5px; /* 按钮之间的间距 */
                }
                .confirm-button:hover {
                    background-color: #1565C0;
                }
                .cancel-button {
                    background-color: #F44336; /* 红色 */
                }
                .cancel-button:hover {
                    background-color: #D32F2F;
                }
            `}</style>
        </div>
    );
};

// 从数据库获取数据
export async function getServerSideProps() {
    await connectToDatabase();
    const rentals = await Room.find({}).lean(); // 获取所有租户数据
    return {
        props: {
            rentals: JSON.parse(JSON.stringify(rentals)), // 确保数据可序列化
        },
    };
}

export default RentalList;
